import { styled } from "nativewind";
import React from 'react';
import { Text } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
const SafeAreaView = styled(RNSafeAreaView);

export default function SubscriptionsScreen() {
  return (
    <SafeAreaView className="flex-1 items-center justify-center">
      <Text>Subscriptions</Text>
    </SafeAreaView>
  );
}
