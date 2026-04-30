import cx from "clsx";
import React from "react";
import { Text, TextInput, TextInputProps, View } from "react-native";

interface AuthTextFieldProps extends TextInputProps {
  label: string;
  error?: string;
  helper?: string;
  right?: React.ReactNode;
}

export default function AuthTextField({
  label,
  error,
  helper,
  right,
  ...props
}: AuthTextFieldProps) {
  return (
    <View className="auth-field">
      <Text className="auth-label">{label}</Text>
      <View className={cx("auth-input-row", error && "auth-input-error")}>
        <TextInput
          className="auth-input-control"
          placeholderTextColor="rgba(0, 0, 0, 0.42)"
          {...props}
        />
        {right}
      </View>
      {error ? (
        <Text className="auth-error">{error}</Text>
      ) : helper ? (
        <Text className="auth-helper">{helper}</Text>
      ) : null}
    </View>
  );
}
