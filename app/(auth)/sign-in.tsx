import AuthShell from "@/components/auth/AuthShell";
import AuthLoadingOverlay from "@/components/auth/AuthLoadingOverlay";
import AuthTextField from "@/components/auth/AuthTextField";
import SocialAuthButtons from "@/components/auth/SocialAuthButtons";
import { useSignIn } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import cx from "clsx";
import { Link, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getErrorMessage(error: unknown) {
  if (!error || typeof error !== "object") {
    return undefined;
  }

  if ("longMessage" in error && typeof error.longMessage === "string") {
    return error.longMessage;
  }

  if ("message" in error && typeof error.message === "string") {
    return error.message;
  }

  return undefined;
}

export default function SignIn() {
  const router = useRouter();
  const { signIn, errors, fetchStatus } = useSignIn();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | undefined>();
  const [dashboardPending, setDashboardPending] = useState(false);
  const [localErrors, setLocalErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const isFetching = fetchStatus === "fetching";
  const normalizedEmail = useMemo(
    () => emailAddress.trim().toLowerCase(),
    [emailAddress],
  );

  const validateForm = () => {
    const nextErrors: typeof localErrors = {};

    if (!emailPattern.test(normalizedEmail)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters.";
    }

    setLocalErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSignIn = async () => {
    if (!signIn || isFetching || !validateForm()) {
      return;
    }

    setFormError(undefined);

    const { error } = await signIn.password({
      emailAddress: normalizedEmail,
      password,
    });

    if (error) {
      setFormError(getErrorMessage(error) ?? "We could not sign you in.");
      return;
    }

    if (signIn.status !== "complete") {
      setFormError("This account needs another verification step.");
      return;
    }

    const finalizeResult = await signIn.finalize();

    if (finalizeResult.error) {
      setFormError(
        getErrorMessage(finalizeResult.error) ?? "We could not finish sign in.",
      );
      return;
    }

    setDashboardPending(true);
    router.replace("/");
  };

  const globalError =
    formError ??
    errors.global?.[0]?.longMessage ??
    errors.global?.[0]?.message;

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue managing your subscriptions"
    >
      <View className="auth-form">
        {globalError ? (
          <View className="auth-error-box">
            <Text className="auth-error-box-text">{globalError}</Text>
          </View>
        ) : null}

        <AuthTextField
          label="Email"
          value={emailAddress}
          onChangeText={(value) => {
            setEmailAddress(value);
            setLocalErrors((current) => ({ ...current, email: undefined }));
          }}
          error={localErrors.email ?? errors.fields.identifier?.message}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="emailAddress"
          placeholder="Enter your email"
          returnKeyType="next"
        />

        <AuthTextField
          label="Password"
          value={password}
          onChangeText={(value) => {
            setPassword(value);
            setLocalErrors((current) => ({ ...current, password: undefined }));
          }}
          error={localErrors.password ?? errors.fields.password?.message}
          secureTextEntry={!showPassword}
          textContentType="password"
          placeholder="Enter your password"
          returnKeyType="done"
          onSubmitEditing={handleSignIn}
          right={
            <Pressable
              accessibilityLabel={showPassword ? "Hide password" : "Show password"}
              hitSlop={10}
              onPress={() => setShowPassword((current) => !current)}
            >
              <Ionicons
                color="rgba(0, 0, 0, 0.55)"
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
              />
            </Pressable>
          }
        />

        <Pressable
          className={cx("auth-button", isFetching && "auth-button-disabled")}
          disabled={isFetching}
          onPress={handleSignIn}
        >
          {isFetching ? (
            <ActivityIndicator color="#081126" />
          ) : (
            <Text className="auth-button-text">Sign in</Text>
          )}
        </Pressable>

        <SocialAuthButtons
          mode="sign-in"
          onDashboardPending={() => setDashboardPending(true)}
          onError={setFormError}
        />

        <View className="auth-link-row">
          <Text className="auth-link-copy">New to SubsAlert?</Text>
          <Link href="/(auth)/sign-up" asChild>
            <Pressable>
              <Text className="auth-link">Create an account</Text>
            </Pressable>
          </Link>
        </View>
      </View>
      <AuthLoadingOverlay visible={dashboardPending} />
    </AuthShell>
  );
}
