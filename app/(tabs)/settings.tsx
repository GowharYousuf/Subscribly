import images from "@/constants/images";
import { useClerk, useUser } from "@clerk/expo";
import { styled } from "nativewind";
import React from 'react';
import { Image, Pressable, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
const SafeAreaView = styled(RNSafeAreaView)

export default function Settings() {
  const { signOut } = useClerk();
  const { user } = useUser();
  const displayName =
    user?.fullName ??
    user?.firstName ??
    user?.primaryEmailAddress?.emailAddress.split("@")[0] ??
    "Your account";
  const emailAddress = user?.primaryEmailAddress?.emailAddress ?? "";
  const avatarSource = user?.imageUrl ? { uri: user.imageUrl } : images.avatar;

  return (
    <SafeAreaView className="flex-1 bg-background px-5 pt-6">
      <Text className="mb-5 text-3xl font-sans-bold text-primary">Settings</Text>

      <View className="rounded-2xl border border-border bg-card p-5">
        <View className="flex-row items-center gap-4">
          <Image source={avatarSource} className="size-16 rounded-full" />
          <View className="min-w-0 flex-1">
            <Text className="text-xl font-sans-bold text-primary">
              {displayName}
            </Text>
            {emailAddress ? (
              <Text className="mt-1 text-sm font-sans-medium text-muted-foreground">
                {emailAddress}
              </Text>
            ) : null}
          </View>
        </View>

        <Pressable
          className="mt-6 items-center rounded-2xl bg-primary py-4"
          onPress={() => signOut()}
        >
          <Text className="font-sans-bold text-background">Sign out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}
