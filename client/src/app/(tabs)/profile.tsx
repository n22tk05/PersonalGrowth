import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  Pressable,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { useRouter } from "expo-router";
import {
  User as UserIcon,
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogOut,
  ChevronRight,
  Shield,
  Bell,
  Moon,
  Info,
  Check,
  X,
  Calendar,
  Sparkles,
  Edit3,
} from "lucide-react-native";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/auth-context";
import { userApi, UserMeResponse } from "@/services/user.service";

export default function ProfileScreen() {
  const router = useRouter();
  const { logout } = useAuth();

  const [userData, setUserData] = useState<UserMeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Edit profile form state
  const [editFullName, setEditFullName] = useState("");
  const [editGender, setEditGender] = useState<"MALE" | "FEMALE">("MALE");
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Change password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const fetchUserProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await userApi.getMe();
      const user = ((res as any)?.data || res) as UserMeResponse;
      setUserData(user);
      if (user?.profile?.fullName) {
        setEditFullName(user.profile.fullName);
      }
      if (user?.profile?.gender) {
        setEditGender(user.profile.gender);
      }
    } catch (error) {
      console.log("Error fetching user profile:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const handleLogout = () => {
    Alert.alert(
      "Đăng xuất",
      "Bạn có chắc chắn muốn đăng xuất khỏi tài khoản trên thiết bị này không?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Đăng xuất",
          style: "destructive",
          onPress: async () => {
            try {
              await logout();
              router.replace("/(auth)/login");
            } catch (error) {
              console.log("Logout error:", error);
            }
          },
        },
      ]
    );
  };

  const handleUpdateProfile = async () => {
    setProfileError(null);
    if (!editFullName.trim() || editFullName.trim().length < 2) {
      setProfileError("Họ và tên phải có ít nhất 2 ký tự");
      return;
    }

    try {
      setIsSubmittingProfile(true);
      await userApi.updateProfile({
        fullName: editFullName.trim(),
        gender: editGender,
      });
      await fetchUserProfile();
      setIsEditModalOpen(false);
      Alert.alert("Thành công", "Cập nhật hồ sơ cá nhân thành công!");
    } catch (error: any) {
      const msg = error?.message || "Không thể cập nhật hồ sơ. Vui lòng thử lại.";
      setProfileError(Array.isArray(msg) ? msg.join(", ") : msg);
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError(null);
    if (!currentPassword) {
      setPasswordError("Vui lòng nhập mật khẩu hiện tại");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("Mật khẩu mới phải có tối thiểu 8 ký tự");
      return;
    }
    if (newPassword === currentPassword) {
      setPasswordError("Mật khẩu mới không được trùng với mật khẩu hiện tại");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Mật khẩu xác nhận không khớp");
      return;
    }

    try {
      setIsSubmittingPassword(true);
      await userApi.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      setIsPasswordModalOpen(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      Alert.alert("Thành công", "Đổi mật khẩu thành công!");
    } catch (error: any) {
      const msg = error?.message || "Đổi mật khẩu thất bại. Vui lòng kiểm tra lại.";
      setPasswordError(Array.isArray(msg) ? msg.join(", ") : msg);
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const formattedDate = (dateStr?: string) => {
    if (!dateStr) return "Gần đây";
    try {
      const d = new Date(dateStr);
      return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
    } catch {
      return "Gần đây";
    }
  };

  if (isLoading && !userData) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color="#22C55E" />
      </SafeAreaView>
    );
  }

  const fullName = userData?.profile?.fullName || "Người dùng";
  const email = userData?.email || "";

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        contentContainerClassName="p-5 pb-12"
        showsVerticalScrollIndicator={false}
      >
        {/* Header Title */}
        <View className="pb-4 pt-1">
          <Text variant="h2" className="font-bold">
            Hồ sơ cá nhân
          </Text>
          <Text variant="muted" className="text-xs mt-0.5">
            Quản lý thông tin tài khoản và tùy chọn ứng dụng
          </Text>
        </View>

        {/* User Card */}
        <Card className="p-5 mb-5 rounded-3xl border border-border bg-card shadow-sm">
          <View className="flex-row items-center gap-4">
            <View className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 items-center justify-center">
              <Text className="text-primary font-bold text-2xl">
                {getInitials(fullName)}
              </Text>
            </View>

            <View className="flex-1">
              <View className="flex-row items-center gap-2">
                <Text className="text-lg font-bold text-foreground" numberOfLines={1}>
                  {fullName}
                </Text>
                <Badge variant="outline" className="px-2 py-0.5 border-primary/30 bg-primary/5">
                  <Text className="text-primary text-[10px] font-semibold">Tài khoản</Text>
                </Badge>
              </View>
              <Text className="text-xs text-muted-foreground mt-0.5" numberOfLines={1}>
                {email}
              </Text>
              <View className="flex-row items-center gap-1 mt-1.5">
                <Icon as={Calendar} size={12} color="#9CA3AF" />
                <Text className="text-[11px] text-muted-foreground">
                  Gia nhập: {formattedDate(userData?.createdAt)}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => {
                setEditFullName(fullName);
                setEditGender(userData?.profile?.gender || "MALE");
                setIsEditModalOpen(true);
              }}
              className="h-10 w-10 rounded-xl bg-secondary items-center justify-center border border-border"
              hitSlop={8}
            >
              <Icon as={Edit3} size={18} color="#374151" />
            </TouchableOpacity>
          </View>
        </Card>

        {/* Section: Tài khoản */}
        <View className="mb-5">
          <Text className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 px-1">
            Cài đặt tài khoản
          </Text>
          <Card className="rounded-2xl border border-border bg-card overflow-hidden">
            <TouchableOpacity
              onPress={() => {
                setEditFullName(fullName);
                setEditGender(userData?.profile?.gender || "MALE");
                setIsEditModalOpen(true);
              }}
              className="flex-row items-center justify-between p-4 border-b border-border active:bg-accent/40"
            >
              <View className="flex-row items-center gap-3">
                <View className="h-9 w-9 rounded-xl bg-blue-500/10 items-center justify-center">
                  <Icon as={UserIcon} size={18} color="#3B82F6" />
                </View>
                <View>
                  <Text className="text-sm font-semibold text-foreground">
                    Chỉnh sửa thông tin
                  </Text>
                  <Text className="text-xs text-muted-foreground">
                    Cập nhật họ tên, giới tính
                  </Text>
                </View>
              </View>
              <Icon as={ChevronRight} size={18} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setIsPasswordModalOpen(true)}
              className="flex-row items-center justify-between p-4 active:bg-accent/40"
            >
              <View className="flex-row items-center gap-3">
                <View className="h-9 w-9 rounded-xl bg-amber-500/10 items-center justify-center">
                  <Icon as={Lock} size={18} color="#F59E0B" />
                </View>
                <View>
                  <Text className="text-sm font-semibold text-foreground">
                    Đổi mật khẩu
                  </Text>
                  <Text className="text-xs text-muted-foreground">
                    Cập nhật mật khẩu bảo mật
                  </Text>
                </View>
              </View>
              <Icon as={ChevronRight} size={18} color="#9CA3AF" />
            </TouchableOpacity>
          </Card>
        </View>

        {/* Section: Hệ thống & Tùy chọn */}
        <View className="mb-5">
          <Text className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 px-1">
            Ứng dụng & Hệ thống
          </Text>
          <Card className="rounded-2xl border border-border bg-card overflow-hidden">
            <View className="flex-row items-center justify-between p-4 border-b border-border">
              <View className="flex-row items-center gap-3">
                <View className="h-9 w-9 rounded-xl bg-emerald-500/10 items-center justify-center">
                  <Icon as={Sparkles} size={18} color="#10B981" />
                </View>
                <View>
                  <Text className="text-sm font-semibold text-foreground">
                    Phiên bản ứng dụng
                  </Text>
                  <Text className="text-xs text-muted-foreground">
                    v1.0.0 (Expo + NestJS)
                  </Text>
                </View>
              </View>
              <Badge variant="outline" className="px-2 py-0.5">
                <Text className="text-xs font-medium text-muted-foreground">Mới nhất</Text>
              </Badge>
            </View>

            <View className="flex-row items-center justify-between p-4 border-b border-border">
              <View className="flex-row items-center gap-3">
                <View className="h-9 w-9 rounded-xl bg-indigo-500/10 items-center justify-center">
                  <Icon as={Shield} size={18} color="#6366F1" />
                </View>
                <View>
                  <Text className="text-sm font-semibold text-foreground">
                    Bảo mật dữ liệu
                  </Text>
                  <Text className="text-xs text-muted-foreground">
                    Lưu trữ an toàn trên thiết bị
                  </Text>
                </View>
              </View>
              <Icon as={Check} size={18} color="#10B981" />
            </View>
          </Card>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleLogout}
          className="flex-row items-center justify-center gap-2 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 active:bg-destructive/20 mt-2"
        >
          <Icon as={LogOut} size={20} color="#EF4444" />
          <Text className="text-destructive font-bold text-base">
            Đăng xuất tài khoản
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={isEditModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditModalOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 justify-end bg-black/50"
        >
          <View className="bg-background rounded-t-3xl p-6 border-t border-border">
            <View className="flex-row items-center justify-between mb-4">
              <Text variant="h3" className="font-bold">
                Chỉnh sửa thông tin
              </Text>
              <TouchableOpacity
                onPress={() => setIsEditModalOpen(false)}
                className="h-8 w-8 rounded-full bg-secondary items-center justify-center"
              >
                <Icon as={X} size={18} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {profileError && (
              <View className="mb-4 rounded-xl bg-destructive/10 border border-destructive/20 p-3">
                <Text className="text-destructive text-xs font-medium">
                  {profileError}
                </Text>
              </View>
            )}

            <View className="gap-4 mb-6">
              <View className="gap-1.5">
                <Text className="text-xs font-semibold uppercase text-muted-foreground">
                  Họ và tên
                </Text>
                <Input
                  value={editFullName}
                  onChangeText={(t) => {
                    setEditFullName(t);
                    if (profileError) setProfileError(null);
                  }}
                  placeholder="Nhập họ và tên..."
                  leftIcon={<Icon as={UserIcon} size={18} color="#9CA3AF" />}
                />
              </View>

              <View className="gap-1.5">
                <Text className="text-xs font-semibold uppercase text-muted-foreground">
                  Giới tính
                </Text>
                <View className="flex-row gap-3">
                  <TouchableOpacity
                    onPress={() => setEditGender("MALE")}
                    className={`flex-1 flex-row items-center justify-center gap-2 p-3 rounded-xl border ${
                      editGender === "MALE"
                        ? "bg-primary/10 border-primary"
                        : "bg-card border-border"
                    }`}
                  >
                    <Text
                      className={`text-sm font-semibold ${
                        editGender === "MALE" ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      Nam
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setEditGender("FEMALE")}
                    className={`flex-1 flex-row items-center justify-center gap-2 p-3 rounded-xl border ${
                      editGender === "FEMALE"
                        ? "bg-primary/10 border-primary"
                        : "bg-card border-border"
                    }`}
                  >
                    <Text
                      className={`text-sm font-semibold ${
                        editGender === "FEMALE" ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      Nữ
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <Button
              onPress={handleUpdateProfile}
              disabled={isSubmittingProfile}
              className="w-full h-12 rounded-xl bg-primary"
            >
              {isSubmittingProfile ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-white font-bold text-base">Lưu thay đổi</Text>
              )}
            </Button>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        visible={isPasswordModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsPasswordModalOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 justify-end bg-black/50"
        >
          <View className="bg-background rounded-t-3xl p-6 border-t border-border">
            <View className="flex-row items-center justify-between mb-4">
              <Text variant="h3" className="font-bold">
                Đổi mật khẩu
              </Text>
              <TouchableOpacity
                onPress={() => setIsPasswordModalOpen(false)}
                className="h-8 w-8 rounded-full bg-secondary items-center justify-center"
              >
                <Icon as={X} size={18} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {passwordError && (
              <View className="mb-4 rounded-xl bg-destructive/10 border border-destructive/20 p-3">
                <Text className="text-destructive text-xs font-medium">
                  {passwordError}
                </Text>
              </View>
            )}

            <View className="gap-3.5 mb-6">
              <View className="gap-1">
                <Text className="text-xs font-semibold uppercase text-muted-foreground">
                  Mật khẩu hiện tại
                </Text>
                <Input
                  value={currentPassword}
                  onChangeText={(t) => {
                    setCurrentPassword(t);
                    if (passwordError) setPasswordError(null);
                  }}
                  secureTextEntry={!showCurrentPassword}
                  placeholder="Nhập mật khẩu hiện tại..."
                  leftIcon={<Icon as={Lock} size={18} color="#9CA3AF" />}
                  rightIcon={
                    <Pressable
                      hitSlop={8}
                      onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      <Icon
                        as={showCurrentPassword ? EyeOff : Eye}
                        size={18}
                        color="#9CA3AF"
                      />
                    </Pressable>
                  }
                />
              </View>

              <View className="gap-1">
                <Text className="text-xs font-semibold uppercase text-muted-foreground">
                  Mật khẩu mới
                </Text>
                <Input
                  value={newPassword}
                  onChangeText={(t) => {
                    setNewPassword(t);
                    if (passwordError) setPasswordError(null);
                  }}
                  secureTextEntry={!showNewPassword}
                  placeholder="Tối thiểu 8 ký tự..."
                  leftIcon={<Icon as={Lock} size={18} color="#9CA3AF" />}
                  rightIcon={
                    <Pressable
                      hitSlop={8}
                      onPress={() => setShowNewPassword(!showNewPassword)}
                    >
                      <Icon
                        as={showNewPassword ? EyeOff : Eye}
                        size={18}
                        color="#9CA3AF"
                      />
                    </Pressable>
                  }
                />
              </View>

              <View className="gap-1">
                <Text className="text-xs font-semibold uppercase text-muted-foreground">
                  Xác nhận mật khẩu mới
                </Text>
                <Input
                  value={confirmPassword}
                  onChangeText={(t) => {
                    setConfirmPassword(t);
                    if (passwordError) setPasswordError(null);
                  }}
                  secureTextEntry={!showConfirmPassword}
                  placeholder="Nhập lại mật khẩu mới..."
                  leftIcon={<Icon as={Lock} size={18} color="#9CA3AF" />}
                  rightIcon={
                    <Pressable
                      hitSlop={8}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <Icon
                        as={showConfirmPassword ? EyeOff : Eye}
                        size={18}
                        color="#9CA3AF"
                      />
                    </Pressable>
                  }
                />
              </View>
            </View>

            <Button
              onPress={handleChangePassword}
              disabled={isSubmittingPassword}
              className="w-full h-12 rounded-xl bg-primary"
            >
              {isSubmittingPassword ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-white font-bold text-base">Cập nhật mật khẩu</Text>
              )}
            </Button>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
