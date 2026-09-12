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
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  ArrowLeft,
  UserPlus,
} from "lucide-react-native";
import Logo from "@/components/icons/logo";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useAuth } from "@/context/auth-context";

export default function Register() {
  const router = useRouter();
  const { register } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const validate = () => {
    if (!fullName.trim()) {
      setErrorMessage("Vui lòng nhập họ và tên");
      return false;
    }
    if (fullName.trim().length < 2) {
      setErrorMessage("Họ và tên cần có ít nhất 2 ký tự");
      return false;
    }
    if (!email.trim()) {
      setErrorMessage("Vui lòng nhập địa chỉ email");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage("Địa chỉ email không đúng định dạng");
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
    if (password !== confirmPassword) {
      setErrorMessage("Mật khẩu xác nhận không khớp");
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    setErrorMessage(null);
    if (!validate()) return;

    try {
      setIsLoading(true);
      await register({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
      });
      // AuthProvider và _layout sẽ tự động điều hướng sang /(tabs)
    } catch (error: any) {
      let message = "Đăng ký thất bại. Vui lòng thử lại.";
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
        <View className="flex-1 px-6 py-6 justify-center">
          {/* Top Bar Back Button */}
          <View className="flex-row items-center mb-4">
            <Pressable
              hitSlop={12}
              onPress={() => router.back()}
              className="h-10 w-10 items-center justify-center rounded-xl bg-card border border-border shadow-xs"
            >
              <Icon as={ArrowLeft} size={20} color="#6B7280" />
            </Pressable>
          </View>

          {/* Logo & Header */}
          <View className="items-center mb-6">
            <Logo size={76} />
            <View className="items-center gap-1 mt-4">
              <Text variant="h2" className="text-center font-bold text-foreground">
                Tạo tài khoản
              </Text>
              <Text variant="p" className="text-muted-foreground text-center text-sm px-2">
                Bắt đầu hành trình kỷ luật và phát triển bản thân của bạn 🌱
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
          <View className="gap-3.5">
            {/* Full Name */}
            <View className="gap-1.5">
              <Text className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">
                Họ và tên
              </Text>
              <Input
                value={fullName}
                onChangeText={(text) => {
                  setFullName(text);
                  if (errorMessage) setErrorMessage(null);
                }}
                autoCapitalize="words"
                placeholder="Nguyễn Văn A"
                returnKeyType="next"
                leftIcon={<Icon as={User} size={20} color="#9CA3AF" />}
              />
            </View>

            {/* Email */}
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

            {/* Password */}
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
                returnKeyType="next"
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

            {/* Confirm Password */}
            <View className="gap-1.5">
              <Text className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">
                Xác nhận mật khẩu
              </Text>
              <Input
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (errorMessage) setErrorMessage(null);
                }}
                autoCapitalize="none"
                secureTextEntry={!showConfirmPassword}
                placeholder="Nhập lại mật khẩu..."
                returnKeyType="done"
                onSubmitEditing={handleRegister}
                leftIcon={<Icon as={Lock} size={20} color="#9CA3AF" />}
                rightIcon={
                  <Pressable
                    hitSlop={8}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Icon
                      as={showConfirmPassword ? EyeOff : Eye}
                      size={20}
                      color="#9CA3AF"
                    />
                  </Pressable>
                }
              />
            </View>

            {/* Submit Button */}
            <Button
              onPress={handleRegister}
              disabled={isLoading}
              className="w-full h-12 rounded-2xl bg-primary mt-2 shadow-md shadow-primary/20"
              size="lg"
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <View className="flex-row items-center justify-center gap-2">
                  <Icon as={UserPlus} size={18} color="#FFFFFF" />
                  <Text className="text-white font-bold text-base">Đăng ký tài khoản</Text>
                </View>
              )}
            </Button>
          </View>

          {/* Login Link */}
          <View className="flex-row items-center justify-center gap-1.5 mt-6 mb-2">
            <Text className="text-muted-foreground text-sm">
              Đã có tài khoản?
            </Text>
            <Pressable
              hitSlop={8}
              onPress={() => router.push("/(auth)/login")}
            >
              <Text className="text-primary font-bold text-sm">
                Đăng nhập ngay
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}