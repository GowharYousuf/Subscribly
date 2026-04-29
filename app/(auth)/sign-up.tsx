import { Link } from "expo-router";
import React from 'react';
import { Text, View } from 'react-native';

const signUp=() => {
  return (
    <View>
      <Text>sign-Up</Text>
      <Link href="/(auth)/sign-up">Sing In</Link>
    </View>
  )
}

export default signUp