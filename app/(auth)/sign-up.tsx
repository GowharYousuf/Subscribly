import AuthShell from "@/components/auth/AuthShell";
import AuthLoadingOverlay from "@/components/auth/AuthLoadingOverlay";
import AuthTextField from "@/components/auth/AuthTextField";
import SocialAuthButtons from "@/components/auth/SocialAuthButtons";
import { useSignUp } from "@clerk/expo";
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

function formatMissingField(field: string) {
  return field.replace(/_/g, " ");
}

export default function SignUp() {
  const router = useRouter();
  const { signUp, errors, fetchStatus } = useSignUp();
  const [fullName, setFullName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [dashboardPending, setDashboardPending] = useState(false);
  const [formError, setFormError] = useState<string | undefined>();
  const [localErrors, setLocalErrors] = useState<{
    username?: string;
    email?: string;
    password?: string;
    code?: string;
  }>({});

  const isFetching = fetchStatus === "fetching";
  const normalizedEmail = useMemo(
    () => emailAddress.trim().toLowerCase(),
    [emailAddress],
  );

  const validateForm = () => {
    const nextErrors: typeof localErrors = {};

    if (fullName.trim().length < 2) {
      nextErrors.username = "Enter your name.";
    }

    if (!emailPattern.test(normalizedEmail)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters.";
    }

    setLocalErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const finishSignUp = async () => {
    if (!signUp) {
      return;
    }

    const finalizeResult = await signUp.finalize();

    if (finalizeResult.error) {
      setFormError(
        getErrorMessage(finalizeResult.error) ??
          "We could not finish account setup.",
      );
      return;
    }

    setDashboardPending(true);
    router.replace("/");
  };

  const handleCreateAccount = async () => {
    if (!signUp || isFetching || !validateForm()) {
      return;
    }

    setFormError(undefined);

    const [username, ...lastNameParts] = fullName.trim().split(/\s+/);
    const { error } = await signUp.password({
      emailAddress: normalizedEmail,
      password,
      username,
      lastName: lastNameParts.join(" ") || undefined,
    });

    if (error) {
      setFormError(getErrorMessage(error) ?? "We could not create your account.");
      return;
    }

    if (signUp.status === "complete") {
      await finishSignUp();
      return;
    }

    const verificationResult = await signUp.verifications.sendEmailCode();

    if (verificationResult.error) {
      setFormError(
        getErrorMessage(verificationResult.error) ??
          "We could not send a verification code.",
      );
      return;
    }

    setPendingVerification(true);
  };

  const handleVerifyEmail = async () => {
    if (!signUp || isFetching) {
      return;
    }

    const trimmedCode = code.trim();

    if (trimmedCode.length < 6) {
      setLocalErrors({ code: "Enter the full verification code." });
      return;
    }

    setFormError(undefined);
    setLocalErrors({});

    const { error } = await signUp.verifications.verifyEmailCode({
      code: trimmedCode,
    });

    if (error) {
      setFormError(getErrorMessage(error) ?? "That code did not work.");
      return;
    }

    if (signUp.status === "complete") {
      await finishSignUp();
      return;
    }

    const missingFields = signUp.missingFields.map(formatMissingField);
    setFormError(
      missingFields.length > 0
        ? `Add ${missingFields.join(", ")} to finish account setup.`
        : "Account setup needs one more step.",
    );
  };

  const globalError =
    formError ??
    errors.global?.[0]?.longMessage ??
    errors.global?.[0]?.message;

  if (pendingVerification) {
    return (
      <AuthShell
        title="Verify email"
        subtitle={`Enter the code sent to ${normalizedEmail}`}
      >
        <View className="auth-form">
          {globalError ? (
            <View className="auth-error-box">
              <Text className="auth-error-box-text">{globalError}</Text>
            </View>
          ) : null}

          <AuthTextField
            label="Code"
            value={code}
            onChangeText={(value) => {
              setCode(value);
              setLocalErrors((current) => ({ ...current, code: undefined }));
            }}
            error={localErrors.code ?? errors.fields.code?.message}
            keyboardType="number-pad"
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="Enter verification code"
            returnKeyType="done"
            onSubmitEditing={handleVerifyEmail}
          />

          <Pressable
            className={cx("auth-button", isFetching && "auth-button-disabled")}
            disabled={isFetching}
            onPress={handleVerifyEmail}
          >
            {isFetching ? (
              <ActivityIndicator color="#081126" />
            ) : (
              <Text className="auth-button-text">Verify email</Text>
            )}
          </Pressable>
        </View>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Create account"
      subtitle="Start managing your subscriptions in seconds"
    >
      <View className="auth-form">
        {globalError ? (
          <View className="auth-error-box">
            <Text className="auth-error-box-text">{globalError}</Text>
          </View>
        ) : null}

        <AuthTextField
          label="Name"
          value={fullName}
          onChangeText={(value) => {
            setFullName(value);
            setLocalErrors((current) => ({ ...current, username: undefined }));
          }}
          error={localErrors.username ?? errors.fields.firstName?.message}
          textContentType="name"
          autoCapitalize="words"
          placeholder="Enter your name"
          returnKeyType="next"
        />

        <AuthTextField
          label="Email"
          value={emailAddress}
          onChangeText={(value) => {
            setEmailAddress(value);
            setLocalErrors((current) => ({ ...current, email: undefined }));
          }}
          error={localErrors.email ?? errors.fields.emailAddress?.message}
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
          textContentType="newPassword"
          placeholder="Create your password"
          returnKeyType="done"
          onSubmitEditing={handleCreateAccount}
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
          onPress={handleCreateAccount}
        >
          {isFetching ? (
            <ActivityIndicator color="#081126" />
          ) : (
            <Text className="auth-button-text">Create account</Text>
          )}
        </Pressable>

        <View nativeID="clerk-captcha" />

        <SocialAuthButtons
          mode="sign-up"
          onDashboardPending={() => setDashboardPending(true)}
          onError={setFormError}
        />

        <View className="auth-link-row">
          <Text className="auth-link-copy">Already have an account?</Text>
          <Link href="/(auth)/sign-in" asChild>
            <Pressable>
              <Text className="auth-link">Sign in</Text>
            </Pressable>
          </Link>
        </View>
      </View>
      <AuthLoadingOverlay visible={dashboardPending} />
    </AuthShell>
  );
}
