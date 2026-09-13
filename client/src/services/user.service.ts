import { api } from "@/lib/api";

export interface UserProfile {
  fullName: string | null;
  avatar: string | null;
  birthday: string | null;
  gender: "MALE" | "FEMALE" | null;
  theme: "LIGHT" | "DARK" | "SYSTEM";
  timezone: string;
}

export interface UserMeResponse {
  id: string;
  email: string;
  createdAt: string;
  profile: UserProfile | null;
}

export interface UpdateProfileDto {
  fullName?: string;
  gender?: "MALE" | "FEMALE";
  birthday?: string;
  avatar?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const userApi = {
  getMe: () => api.get<UserMeResponse>("/users/me"),
  updateProfile: (data: UpdateProfileDto) =>
    api.patch<UserMeResponse>("/users/profile", data),
  changePassword: (data: ChangePasswordDto) =>
    api.patch<{ message: string }>("/users/password", data),
};
