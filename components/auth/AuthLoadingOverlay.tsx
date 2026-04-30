import React, { useEffect, useRef } from "react";
import { Animated, Easing, Text, View } from "react-native";

interface AuthLoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export default function AuthLoadingOverlay({
  visible,
  message = "Opening your dashboard",
}: AuthLoadingOverlayProps) {
  const rotate = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      return;
    }

    const rotationLoop = Animated.loop(
      Animated.timing(rotate, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 650,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 650,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );

    rotationLoop.start();
    pulseLoop.start();

    return () => {
      rotationLoop.stop();
      pulseLoop.stop();
      rotate.setValue(0);
      pulse.setValue(0);
    };
  }, [pulse, rotate, visible]);

  if (!visible) {
    return null;
  }

  const spin = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });
  const scale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08],
  });

  return (
    <View className="auth-loading-overlay">
      <Animated.View
        className="auth-loading-ring"
        style={{ transform: [{ rotate: spin }] }}
      />
      <Animated.View
        className="auth-loading-mark"
        style={{ transform: [{ scale }] }}
      >
        <Text className="auth-logo-mark-text">S</Text>
      </Animated.View>
      <Text className="auth-loading-title">{message}</Text>
      <Text className="auth-loading-copy">Syncing your secure session</Text>
    </View>
  );
}
