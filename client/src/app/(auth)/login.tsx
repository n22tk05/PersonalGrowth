import React, { useState } from "react";
import {
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react-native";
import Logo from "@/components/icons/logo";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useAuth } from "@/context/auth-context";

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const validate = () => {
    if (!email.trim()) {
      setErrorMessage("Vui lòng nhập địa chỉ email");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage("Địa chỉ email không hợp lệ");
      return false;
    }
    if (!password) {
      setErrorMessage("Vui lòng nhập mật khẩu");
      return false;
    }
    if (password.length < 8) {
      setErrorMessage("Mật khẩu phải có ít nhất 8 ký tự");
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    setErrorMessage(null);
    if (!validate()) return;

    try {
      setIsLoading(true);
      await login({
        email: email.trim().toLowerCase(),
        password,
      });
      // AuthProvider và _layout sẽ tự động điều hướng sang /(tabs)
    } catch (error: any) {
      let message = "Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản hoặc mật khẩu.";
      if (error?.message) {
        if (Array.isArray(error.message)) {
          message = error.message.join(", ");
        } else if (typeof error.message === "string") {
          message = error.message;
        }
      }
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-background"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 justify-center px-6 py-10">
          {/* Logo & Header */}
          <View className="items-center mb-8">
            <Logo size={88} />
            <View className="items-center gap-1 mt-5">
              <Text variant="h2" className="text-center font-bold text-foreground">
                Personal Growth
              </Text>
              <Text variant="p" className="text-muted-foreground text-center text-sm px-4">
                {"Đăng nhập để tiếp tục hành trình\nphát triển bản thân của bạn 🌱"}
              </Text>
            </View>
          </View>

          {/* Error Banner */}
          {errorMessage && (
            <View className="mb-4 rounded-xl bg-destructive/10 border border-destructive/20 p-3.5">
              <Text className="text-destructive text-sm text-center font-medium">
                {errorMessage}
              </Text>
            </View>
          )}

          {/* Form Fields */}
          <View className="gap-4">
            <View className="gap-1.5">
              <Text className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">
                Email
              </Text>
              <Input
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errorMessage) setErrorMessage(null);
                }}
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="example@domain.com"
                keyboardType="email-address"
                returnKeyType="next"
                leftIcon={<Icon as={Mail} size={20} color="#9CA3AF" />}
              />
            </View>

            <View className="gap-1.5">
              <Text className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">
                Mật khẩu
              </Text>
              <Input
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errorMessage) setErrorMessage(null);
                }}
                autoCapitalize="none"
                secureTextEntry={!showPassword}
                placeholder="Tối thiểu 8 ký tự"
                returnKeyType="done"
                onSubmitEditing={handleLogin}
                leftIcon={<Icon as={Lock} size={20} color="#9CA3AF" />}
                rightIcon={
                  <Pressable
                    hitSlop={8}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Icon
                      as={showPassword ? EyeOff : Eye}
                      size={20}
                      color="#9CA3AF"
                    />
                  </Pressable>
                }
              />
            </View>

            {/* Submit Button */}
            <Button
              onPress={handleLogin}
              disabled={isLoading}
              className="w-full h-12 rounded-2xl bg-primary mt-3 shadow-md shadow-primary/20"
              size="lg"
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <View className="flex-row items-center justify-center gap-2">
                  <Icon as={LogIn} size={18} color="#FFFFFF" />
                  <Text className="text-white font-bold text-base">Đăng nhập</Text>
                </View>
              )}
            </Button>
          </View>

          {/* Register Link */}
          <View className="flex-row items-center justify-center gap-1.5 mt-8">
            <Text className="text-muted-foreground text-sm">
              Chưa có tài khoản?
            </Text>
            <Pressable
              hitSlop={8}
              onPress={() => router.push("/(auth)/register")}
            >
              <Text className="text-primary font-bold text-sm">
                Đăng ký ngay
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
