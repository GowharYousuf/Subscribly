import { useSSO } from "@clerk/expo";
import type { StartSSOFlowReturnType } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import cx from "clsx";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Platform, Pressable, Text, View } from "react-native";

WebBrowser.maybeCompleteAuthSession();

type SocialStrategy = "oauth_google";

interface Provider {
  label: string;
  key: SocialStrategy;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

interface SocialAuthButtonsProps {
  mode: "sign-in" | "sign-up";
  onError?: (message: string) => void;
  onDashboardPending?: () => void;
}

const providers: Provider[] = [
  {
    label: "Continue with Google",
    key: "oauth_google",
    icon: "logo-google",
    color: "#081126",
  },
];

function getErrorMessage(error: unknown) {
  if (!error || typeof error !== "object") {
    return "We could not complete that connection. Please try again.";
  }

  if ("longMessage" in error && typeof error.longMessage === "string") {
    return error.longMessage;
  }

  if ("message" in error && typeof error.message === "string") {
    return error.message;
  }

  return "We could not complete that connection. Please try again.";
}

function buildUsernameSeed(value?: string | null) {
  const seed = value?.split("@")[0] ?? "subsalert";
  const normalized = seed.replace(/[^a-zA-Z0-9_-]/g, "").toLowerCase();

  return normalized.length >= 3 ? normalized.slice(0, 20) : "subsalert";
}

async function completeTransferredSignUp({
  signIn,
  signUp,
  setActive,
}: Pick<StartSSOFlowReturnType, "signIn" | "signUp" | "setActive">) {
  if (!signUp) {
    return null;
  }

  if (signUp.createdSessionId) {
    await setActive?.({ session: signUp.createdSessionId });
    return signUp.createdSessionId;
  }

  if (!signUp.missingFields.includes("username")) {
    return null;
  }

  const baseUsername = buildUsernameSeed(signUp.emailAddress ?? signIn?.identifier);
  const usernameOptions = [
    baseUsername,
    `${baseUsername}${Math.floor(1000 + Math.random() * 9000)}`,
    `${baseUsername}_${Math.floor(1000 + Math.random() * 9000)}`,
  ];

  for (const username of usernameOptions) {
    try {
      const updatedSignUp = await signUp.update({ username });

      if (updatedSignUp.createdSessionId) {
        await setActive?.({ session: updatedSignUp.createdSessionId });
        return updatedSignUp.createdSessionId;
      }
    } catch {
      // Try the next generated username if this one is already taken.
    }
  }

  return null;
}

export default function SocialAuthButtons({
  mode,
  onError,
  onDashboardPending,
}: SocialAuthButtonsProps) {
  const router = useRouter();
  const { startSSOFlow } = useSSO();
  const [pendingStrategy, setPendingStrategy] = useState<SocialStrategy | null>(
    null,
  );

  useEffect(() => {
    if (Platform.OS === "web") {
      return;
    }

    void WebBrowser.warmUpAsync();

    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);

  const startFlow = useCallback(
    async (provider: Provider) => {
      setPendingStrategy(provider.key);
      onError?.("");

      try {
        const { createdSessionId, setActive, authSessionResult, signIn, signUp } =
          await startSSOFlow({
            strategy: provider.key,
            redirectUrl: Linking.createURL("/", { scheme: "subsalert" }),
            unsafeMetadata:
              mode === "sign-up"
                ? { onboardingSource: "mobile_sso" }
                : undefined,
          });

        if (createdSessionId) {
          onDashboardPending?.();
          await setActive?.({ session: createdSessionId });
          router.replace("/");
          return;
        }

        const completedSessionId = await completeTransferredSignUp({
          signIn,
          signUp,
          setActive,
        });

        if (completedSessionId) {
          onDashboardPending?.();
          router.replace("/");
          return;
        }

        if (authSessionResult?.type === "cancel") {
            return;
        }

        onError?.(
          "That connection needs one more verification step before we can open your dashboard.",
        );
      } catch (error) {
        onError?.(getErrorMessage(error));
      } finally {
        setPendingStrategy(null);
      }
    },
    [mode, onDashboardPending, onError, router, startSSOFlow],
  );

  return (
    <View className="auth-social-list">
      {providers.map((provider) => {
        const isPending = pendingStrategy === provider.key;
        const disabled = pendingStrategy !== null;

        return (
          <Pressable
            key={provider.key}
            className={cx(
              "auth-sso-button",
              disabled && !isPending && "auth-sso-button-disabled",
            )}
            disabled={disabled}
            onPress={() => startFlow(provider)}
          >
            <View className="auth-sso-icon">
              {isPending ? (
                <ActivityIndicator color="#081126" />
              ) : (
                <Ionicons name={provider.icon} size={21} color={provider.color} />
              )}
            </View>
            <Text className="auth-sso-button-text">{provider.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
