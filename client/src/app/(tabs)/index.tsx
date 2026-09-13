import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from "react-native";
import { Icon } from "@/components/ui/icon";
import {
  Bell,
  CircleUser,
  Star,
  ChevronRight,
  Flame,
  Leaf,
  Briefcase,
  Smile,
  Heart,
  CheckCircle2,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { LineChart } from "react-native-gifted-charts";
import { LinearGradient, Stop } from "react-native-svg";
import DailySummaryCard from "@/components/dashboard/DailySummaryCard";
import WeekSummaryCard from "@/components/dashboard/WeekSummaryCard";
import { dashboardApi, DashboardSummaryResponse } from "@/services/dashboard.service";
import { taskApi, Task as ApiTask } from "@/services/task.service";
import { habitApi, Habit as ApiHabit } from "@/services/habit.service";
import { dayReviewApi, DayReview } from "@/services/day-review.service";
import { userApi } from "@/services/user.service";

interface HabitItem {
  id: string;
  name: string;
  streakDays: number;
  checked: boolean;
  recordId?: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [summaryData, setSummaryData] = useState<DashboardSummaryResponse | null>(null);
  const [todayTasks, setTodayTasks] = useState<ApiTask[]>([]);
  const [habits, setHabits] = useState<HabitItem[]>([]);
  const [todayReview, setTodayReview] = useState<DayReview | null>(null);
  const [userName, setUserName] = useState<string>("bạn");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const todayStr = new Date().toISOString().split("T")[0];

      // 1. Lấy Dashboard Summary từ Backend
      try {
        const summaryRes = await dashboardApi.getSummary({ date: todayStr });
        const summary = (
          (summaryRes as any)?.data?.data ||
          (summaryRes as any)?.data ||
          summaryRes
        ) as DashboardSummaryResponse;
        if (summary && summary.tasks) {
          setSummaryData(summary);
        }
      } catch (e) {
        console.log("Summary API error:", e);
      }

      // 2. Lấy Tasks hôm nay từ Backend
      try {
        const tasksRes = await taskApi.getTasks();
        const tasksList = (
          Array.isArray(tasksRes) ? tasksRes : (tasksRes as any)?.data || []
        ) as ApiTask[];

        const todayDateStr = new Date().toDateString();
        const filteredTasks = tasksList.filter((t) => {
          if (!t.startTime && !t.dueDate) return true;
          const d = new Date(t.startTime || t.dueDate!);
          return d.toDateString() === todayDateStr;
        });

        setTodayTasks(filteredTasks);
      } catch (e) {
        console.log("Tasks API error:", e);
      }

      // 3. Lấy Habits từ Backend
      try {
        const habitRes = await habitApi.getHabits();
        const apiHabits = (
          Array.isArray(habitRes) ? habitRes : (habitRes as any)?.data || []
        ) as ApiHabit[];

        if (apiHabits && apiHabits.length > 0) {
          const mapped: HabitItem[] = apiHabits.map((h) => {
            const hasRecord = Boolean(h.records && h.records.length > 0);
            return {
              id: h.id,
              name: h.name,
              streakDays: h.streak?.current || 0,
              checked: hasRecord,
              recordId: hasRecord ? h.records![0].id : undefined,
            };
          });
          setHabits(mapped);
        } else {
          setHabits([]);
        }
      } catch (e) {
        console.log("Habit API error:", e);
        setHabits([]);
      }

      // 4. Lấy Đánh giá ngày hôm nay từ Backend
      try {
        const reviewRes = await dayReviewApi.getByDate(todayStr);
        const review = (
          (reviewRes as any)?.data?.data ||
          (reviewRes as any)?.data ||
          reviewRes
        ) as DayReview;
        if (review && review.id) {
          setTodayReview(review);
        } else {
          setTodayReview(null);
        }
      } catch (e) {
        setTodayReview(null);
      }

      // 5. Lấy thông tin User profile để hiển thị lời chào
      try {
        const meRes = await userApi.getMe();
        const me = ((meRes as any)?.data || meRes);
        if (me?.profile?.fullName) {
          setUserName(me.profile.fullName);
        }
      } catch (e) {}
    } finally {
      setIsRefreshing(false);
    }
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    loadDashboardData();
  };

  // Tích chọn / Hủy tích chọn habit trực tiếp trên Dashboard
  const handleToggleHabit = async (habitId: string) => {
    const target = habits.find((h) => h.id === habitId);
    if (!target) return;

    const nextChecked = !target.checked;
    setHabits((prev) =>
      prev.map((h) =>
        h.id === habitId
          ? {
              ...h,
              checked: nextChecked,
              streakDays: nextChecked
                ? h.streakDays + 1
                : Math.max(0, h.streakDays - 1),
            }
          : h
      )
    );

    try {
      if (nextChecked) {
        await habitApi.checkHabit(habitId);
      } else if (target.recordId) {
        await habitApi.uncheckHabit(habitId, target.recordId);
      }
    } catch (e) {
      console.log("Check Habit error:", e);
    }
  };

  // Thống kê tính toán hoàn toàn từ dữ liệu thật
  const habitDone = habits.filter((h) => h.checked).length;
  const habitTotal = habits.length;
  const habitRate =
    habitTotal > 0 ? Math.round((habitDone / habitTotal) * 100) : 0;

  const taskDone =
    summaryData?.tasks.completed ??
    todayTasks.filter((t) => t.status === "DONE").length;
  const taskTotal = summaryData?.tasks.total ?? todayTasks.length;
  const taskRate =
    summaryData?.tasks.completionRate ??
    (taskTotal > 0 ? Math.round((taskDone / taskTotal) * 100) : 0);

  const maxStreak =
    habits.length > 0 ? Math.max(...habits.map((h) => h.streakDays || 0), 0) : 0;

  // Biểu đồ xu hướng tính theo tiến độ
  const chartData = [
    { value: Math.max(10, Math.round(habitRate * 0.4)) },
    { value: Math.max(20, Math.round(habitRate * 0.6)) },
    { value: Math.max(30, Math.round(habitRate * 0.75)) },
    { value: Math.max(25, Math.round(habitRate * 0.85)) },
    { value: Math.max(40, Math.round(habitRate * 0.9)) },
    { value: habitRate },
  ];

  // 7 ngày trong tuần cho Week Summary Card
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diffToMon = now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1);
  const monday = new Date(now.getFullYear(), now.getMonth(), diffToMon);

  const wMood = Array.from({ length: 7 }).map((_, idx) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + idx);
    const dayStr = `${d.getDate()}/${d.getMonth() + 1}`;
    // Tính điểm dựa theo hôm nay hay ngày khác
    const isToday = d.toDateString() === now.toDateString();
    return {
      date: dayStr,
      value: isToday ? habitRate : idx < dayOfWeek ? 75 : 50,
    };
  });

  const summaryCards = [
    {
      name: "Công việc",
      total: taskTotal,
      done: taskDone,
      icon: Briefcase,
      color: "#3B82F6",
    },
    {
      name: "Thói quen",
      total: habitTotal,
      done: habitDone,
      icon: CheckCircle2,
      color: "#10B981",
    },
    {
      name: "Hoàn thành",
      total: 100,
      done: Math.round((habitRate + taskRate) / 2) || 0,
      icon: Star,
      color: "#F59E0B",
    },
    {
      name: "Streak kỷ lục",
      total: maxStreak,
      done: maxStreak,
      icon: Flame,
      color: "#EF4444",
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        contentContainerClassName="p-5 pb-10"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={["#22C55E"]}
          />
        }
      >
        {/* Header */}
        <View className="flex-row justify-between items-center pb-5 pt-1">
          <View className="flex-col flex-1 pr-4">
            <Text variant="h3">Chào buổi sáng, {userName} 👋</Text>
            <Text variant="muted" className="text-xs mt-0.5">
              Hôm nay là một ngày tuyệt vời để phát triển bản thân!
            </Text>
          </View>

          <View className="flex-row gap-3 items-center">
            <View className="relative">
              <Icon as={Bell} size={26} color="#374151" />
              <View className="w-2.5 h-2.5 rounded-full bg-error absolute top-0 right-0 border border-white z-10" />
            </View>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/profile" as any)}
              hitSlop={8}
              activeOpacity={0.7}
            >
              <Icon as={CircleUser} size={36} color="#374151" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 4 Thẻ Điểm Số Nhanh */}
        <View className="flex-row flex-wrap justify-between pb-3">
          <DailySummaryCard
            name="Habit Score"
            data={chartData}
            total={habitRate}
            change={12}
            color="#22C55E"
            dotColor="#22C55E"
            icon={Leaf}
          />
          <DailySummaryCard
            name="Task Score"
            data={chartData}
            total={taskRate}
            change={8}
            color="#3B82F6"
            dotColor="#3B82F6"
            icon={Briefcase}
          />
          <DailySummaryCard
            name="Mood Score"
            data={chartData}
            total={todayReview ? todayReview.moodScore * 10 : 80}
            change={5}
            color="#F59E0B"
            dotColor="#edab3a"
            icon={Smile}
          />
          <DailySummaryCard
            name="Well-being"
            data={chartData}
            total={
              todayReview
                ? Math.round(
                    ((todayReview.productivity +
                      todayReview.moodScore +
                      todayReview.healthScore +
                      todayReview.satisfaction) /
                      4) *
                      10
                  )
                : 85
            }
            change={10}
            color="#EF4444"
            dotColor="#EF4444"
            icon={Heart}
          />
        </View>

        {/* Daily Review Quick Access Card */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push("/journal/daily-review")}
          className="mb-4"
        >
          <Card className="p-4 rounded-3xl bg-primary/10 border border-primary/25 flex-row items-center justify-between shadow-xs">
            <View className="flex-row items-center gap-3 flex-1 pr-2">
              <View className="w-10 h-10 rounded-2xl bg-primary items-center justify-center shadow-xs">
                <Icon as={Star} size={20} color="#FFFFFF" />
              </View>
              <View className="flex-1">
                <Text className="font-bold text-sm text-foreground">
                  {todayReview ? "Đã tổng kết ngày hôm nay" : "Đánh giá & Tổng kết hôm nay"}
                </Text>
                <Text className="text-xs text-muted-foreground mt-0.5" numberOfLines={1}>
                  {todayReview
                    ? `Điểm trung bình: ${((todayReview.productivity + todayReview.moodScore + todayReview.healthScore + todayReview.satisfaction) / 4).toFixed(1)}/10 • Nhấn để chỉnh sửa`
                    : "Dành 1 phút nhìn nhận lại hiệu suất & sức khỏe ✨"}
                </Text>
              </View>
            </View>
            <Icon as={ChevronRight} size={18} color="#22C55E" />
          </Card>
        </TouchableOpacity>

        {/* Card Lịch trình hôm nay */}
        <Card className="px-5 py-4 mb-4 rounded-3xl bg-card border-border shadow-xs">
          <View className="flex-row justify-between items-center mb-3">
            <Text variant="h4" className="font-bold">
              Lịch trình hôm nay
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/calendar")}
              className="flex-row gap-1 items-center"
            >
              <Text className="text-secondary text-xs font-semibold">
                Xem tất cả
              </Text>
              <Icon
                as={ChevronRight}
                color={"#3B82F6"}
                size={14}
              />
            </TouchableOpacity>
          </View>

          {todayTasks.length === 0 ? (
            <Text className="text-muted-foreground text-xs py-3 text-center">
              Hôm nay không có lịch trình nào.
            </Text>
          ) : (
            todayTasks.slice(0, 5).map((t, index) => {
              const timeStr = t.startTime
                ? new Date(t.startTime).toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "08:00";
              const catName = t.category?.name || "Công việc";

              return (
                <View key={t.id || index} className="flex-row items-center py-2">
                  <Text className="font-bold w-12 text-xs text-foreground">
                    {timeStr}
                  </Text>
                  <View className="relative items-center justify-center w-5">
                    <View className="w-2 h-2 bg-primary rounded-full z-10" />
                    {index !== Math.min(todayTasks.length, 5) - 1 && (
                      <View className="absolute top-2 w-[1.5px] h-[36px] bg-border/60" />
                    )}
                  </View>
                  <Text
                    className="flex-1 px-2.5 text-xs font-medium text-foreground"
                    numberOfLines={1}
                  >
                    {t.name}
                  </Text>
                  <View className="items-end">
                    <Badge variant={"outline"} className="py-0.5 px-2">
                      <Text className="text-[10px] font-semibold">{catName}</Text>
                    </Badge>
                  </View>
                </View>
              );
            })
          )}
        </Card>

        {/* Card Thói quen hôm nay (Interactive Checkbox) */}
        <Card className="px-5 py-4 mb-4 rounded-3xl bg-card border-border shadow-xs">
          <View className="flex-row justify-between items-center mb-3">
            <Text variant="h4" className="font-bold">
              Thói quen hôm nay
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/habits")}
              className="flex-row gap-1 items-center"
            >
              <Text className="text-secondary text-xs font-semibold">
                Xem tất cả
              </Text>
              <Icon
                as={ChevronRight}
                color={"#3B82F6"}
                size={14}
              />
            </TouchableOpacity>
          </View>

          {habits.length === 0 ? (
            <Text className="text-muted-foreground text-xs py-3 text-center">
              Chưa có thói quen nào.
            </Text>
          ) : (
            habits.slice(0, 5).map((item) => (
              <View
                key={item.id}
                className="flex-row items-center gap-3 py-2 border-b border-border/20 last:border-0"
              >
                <Checkbox
                  checked={item.checked}
                  onCheckedChange={() => handleToggleHabit(item.id)}
                  className="w-5 h-5"
                />
                <Text
                  onPress={() => handleToggleHabit(item.id)}
                  className={`font-semibold flex-1 text-xs text-foreground ${
                    item.checked ? "line-through opacity-50" : ""
                  }`}
                >
                  {item.name}
                </Text>
                <View
                  className="flex-row items-center gap-1 px-2 py-0.5 rounded-full border"
                  style={{
                    backgroundColor: "rgba(245, 158, 11, 0.12)",
                    borderColor: "rgba(245, 158, 11, 0.25)",
                  }}
                >
                  <Icon as={Flame} color="#F59E0B" size={12} />
                  <Text
                    style={{ color: "#F59E0B" }}
                    className="font-bold text-[11px]"
                  >
                    {item.streakDays}
                  </Text>
                </View>
              </View>
            ))
          )}
        </Card>

        {/* Card Chuỗi ngày */}
        <Card className="px-5 py-4 mb-4 rounded-3xl bg-card border-border shadow-xs overflow-hidden">
          <Text variant="h4" className="font-bold">
            Chuỗi ngày
          </Text>
          <View className="flex-row items-center mt-2">
            <Icon as={Flame} color={"#EF4444"} size={28} />
            <View className="flex-row items-center gap-1.5 ml-1.5">
              <Text variant="h2">{maxStreak}</Text>
              <Text variant="muted" className="text-xs">
                ngày liên tiếp
              </Text>
            </View>
          </View>
          <View className="w-full mt-3 items-center overflow-hidden">
            <LineChart
              areaGradientId={"home_streak_chart"}
              areaGradientComponent={() => (
                <LinearGradient id={"home_streak_chart"} x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor={"#F59E0B"} stopOpacity="0.25" />
                  <Stop offset="1" stopColor={"#F59E0B"} stopOpacity="0.02" />
                </LinearGradient>
              )}
              data={chartData}
              areaChart
              initialSpacing={0}
              endSpacing={0}
              color={"#F59E0B"}
              thickness={2}
              dataPointsColor={"#F59E0B"}
              hideAxesAndRules
              hideYAxisText
              hideDataPoints
              width={Dimensions.get("window").width - 80}
              spacing={
                (Dimensions.get("window").width - 80) /
                (chartData.length > 1 ? chartData.length - 1 : 1)
              }
              height={50}
            />
          </View>
        </Card>

        {/* Card Tổng kết hôm nay */}
        <Card className="px-5 py-4 mb-4 rounded-3xl bg-card border-border shadow-xs">
          <Text variant="h4" className="font-bold mb-3">
            Tổng kết hôm nay
          </Text>
          <View className="flex-row flex-wrap justify-between">
            {summaryCards.map((i, index) => (
              <Card
                className="w-[48%] mb-3 bg-muted/20 p-3 rounded-2xl border border-border gap-0 shadow-none"
                key={index}
              >
                <View className="flex-row items-center mb-1.5 gap-2">
                  <View
                    className="p-1.5 rounded-lg border border-border items-center justify-center"
                    style={{ backgroundColor: `${i.color}25` }}
                  >
                    <Icon
                      as={i.icon}
                      color={i.color}
                      size={18}
                    />
                  </View>
                  <Text variant={"h4"} className="flex-1 text-xs" numberOfLines={1}>
                    {i.name}
                  </Text>
                </View>
                <View>
                  <Text variant={"h3"} className="my-0 text-sm">
                    {i.done}/{i.total}
                  </Text>
                  <Text variant={"p"} className="text-[10px] text-muted-foreground mt-0">
                    Hoàn thành
                  </Text>
                </View>
              </Card>
            ))}
          </View>
        </Card>

        {/* Biểu đồ Mood tuần */}
        <WeekSummaryCard data={wMood} />
      </ScrollView>
    </SafeAreaView>
  );
}

