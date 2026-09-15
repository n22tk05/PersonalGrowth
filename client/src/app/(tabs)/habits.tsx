import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  TextInput,
  RefreshControl,
} from "react-native";
import { Icon } from "@/components/ui/icon";
import {
  Dumbbell,
  BookOpen,
  Leaf,
  Droplets,
  Moon,
  CheckCircle2,
  Flame,
  Trophy,
  ChevronDown,
  Clock,
  Check,
  Plus,
  X,
  Bot,
  Sparkles,
  Target,
  LucideIcon,
} from "lucide-react-native";
import Svg, { Circle } from "react-native-svg";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Calendar } from "@/components/ui/calendar";
import { habitApi, Habit } from "@/services/habit.service";
import { dashboardApi, type AnalyticsResponse } from "@/services/dashboard.service";
import HabitAnalyticsView from "@/components/habits/HabitAnalyticsView";

interface HabitItem {
  id: string;
  name: string;
  rule: string;
  detail: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  streakDays: number;
  maxStreakDays?: number;
  progress: number;
  checked: boolean;
  recordId?: string;
}

// Component Vòng tròn tiến độ 80% Hoàn thành hôm nay
function CircularProgress({
  percentage = 80,
  size = 72,
  strokeWidth = 7,
  color = "#22C55E",
}: {
  percentage?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * percentage) / 100;

  return (
    <View className="items-center justify-center relative">
      <Svg width={size} height={size}>
        {/* Vòng nền màu xám mờ */}
        <Circle
          stroke="#E5E7EB"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        {/* Vòng tiến độ màu xanh lá */}
        <Circle
          stroke={color}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View className="absolute items-center justify-center">
        <Text className="text-xl font-extrabold text-foreground">
          {percentage}%
        </Text>
        <Text className="text-[9px] text-muted-foreground text-center font-medium leading-tight">
          Hôm nay
        </Text>
      </View>
    </View>
  );
}

export default function HabitsScreen() {
  // Tab đang chọn trong phần sub-navigation
  const [activeTab, setActiveTab] = useState<
    "Hôm nay" | "Lịch" | "Thống kê" | "AI Coach" | "Thử thách"
  >("Hôm nay");

  // Ngày đang được chọn trên lịch (mặc định là hôm nay)
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [isLoadingApi, setIsLoadingApi] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mảng danh sách thói quen
  const [habits, setHabits] = useState<HabitItem[]>([]);

  // Modal Thêm Habit Mới
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newHabitName, setNewHabitName] = useState("");
  const [newHabitRule, setNewHabitRule] = useState("");
  const [newHabitDetail, setNewHabitDetail] = useState("");

  // Gọi API lấy danh sách Habit từ NestJS Backend
  useEffect(() => {
    fetchHabitsFromApi();
  }, []);

  const fetchHabitsFromApi = async () => {
    try {
      setIsLoadingApi(true);
      const res = await habitApi.getHabits();
      let rawHabits: Habit[] = [];
      if (Array.isArray(res)) {
        rawHabits = res;
      } else if (Array.isArray((res as any)?.data)) {
        rawHabits = (res as any).data;
      } else if (Array.isArray((res as any)?.data?.data)) {
        rawHabits = (res as any).data.data;
      }

      // Khử trùng lặp (Deduplicate) theo ID
      const uniqueMap = new Map<string, Habit>();
      for (const h of rawHabits) {
        if (h && h.id) {
          uniqueMap.set(h.id, h);
        }
      }
      const uniqueHabits = Array.from(uniqueMap.values());

      if (uniqueHabits.length > 0) {
        const mapped: HabitItem[] = uniqueHabits.map((h, idx) => {
          const hasRecordToday = Boolean(h.records && h.records.length > 0);
          return {
            id: h.id,
            name: h.name,
            rule: h.frequency === "DAILY" ? "Hàng ngày" : "Hàng tuần",
            detail: "08:00",
            icon: [
              Dumbbell,
              BookOpen,
              Leaf,
              Droplets,
              Moon,
            ][idx % 5],
            color: [
              "#22C55E",
              "#8B5CF6",
              "#14B8A6",
              "#3B82F6",
              "#F59E0B",
            ][idx % 5],
            bgColor: [
              "bg-emerald-500/15",
              "bg-purple-500/15",
              "bg-teal-500/15",
              "bg-blue-500/15",
              "bg-amber-500/15",
            ][idx % 5],
            streakDays: h.streak?.current || 0,
            maxStreakDays: h.streak?.max || h.streak?.current || 0,
            progress: hasRecordToday ? 100 : 0,
            checked: hasRecordToday,
            recordId: hasRecordToday ? h.records![0].id : undefined,
          };
        });
        setHabits(mapped);
      } else {
        setHabits([]);
      }
    } catch (error) {
      console.log("Lỗi khi tải danh sách habit:", error);
      setHabits([]);
    } finally {
      setIsLoadingApi(false);
      setIsRefreshing(false);
    }
  };

  // Analytics state
  const [analyticsData, setAnalyticsData] = useState<AnalyticsResponse | null>(null);
  const [analyticsRange, setAnalyticsRange] = useState<"7d" | "30d">("7d");
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

  const fetchAnalytics = async (range: "7d" | "30d" = analyticsRange) => {
    try {
      setIsLoadingAnalytics(true);
      const res = await dashboardApi.getAnalytics({ range });
      let actualData: AnalyticsResponse | null = null;
      if ((res as any)?.data?.data) {
        actualData = (res as any).data.data;
      } else if ((res as any)?.data) {
        actualData = (res as any).data;
      } else {
        actualData = res as AnalyticsResponse;
      }
      setAnalyticsData(actualData);
    } catch (err) {
      console.log("Lỗi khi tải dữ liệu thống kê:", err);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  useEffect(() => {
    if (activeTab === "Thống kê") {
      fetchAnalytics(analyticsRange);
    }
  }, [activeTab, analyticsRange]);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchHabitsFromApi();
    if (activeTab === "Thống kê") {
      fetchAnalytics(analyticsRange);
    }
  };

  // Xử lý Tích chọn / Hủy tích chọn hoàn thành (Checkbox toggle)
  const toggleCheck = async (id: string) => {
    const target = habits.find((h) => h.id === id);
    if (!target) return;

    const nextChecked = !target.checked;

    // Cập nhật UI ngay lập tức
    setHabits((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            checked: nextChecked,
            progress: nextChecked ? 100 : 0,
            streakDays: nextChecked
              ? item.streakDays + 1
              : Math.max(0, item.streakDays - 1),
          };
        }
        return item;
      })
    );

    // Gọi API NestJS Backend
    try {
      if (nextChecked) {
        await habitApi.checkHabit(id);
      } else if (target.recordId) {
        await habitApi.uncheckHabit(id, target.recordId);
      }
    } catch (err) {
      console.log("Lỗi khi tích chọn habit");
    }
  };

  const completedCount = habits.filter((h) => h.checked).length;
  const totalCount = habits.length;
  const overallPercentage =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const currentStreakDays =
    habits.length > 0 ? Math.max(...habits.map((h) => h.streakDays || 0), 0) : 0;
  const bestStreakDays =
    habits.length > 0
      ? Math.max(
          ...habits.map((h) => h.maxStreakDays || h.streakDays || 0),
          0
        )
      : 0;

  // Xử lý thêm habit mới
  const handleAddHabit = async () => {
    if (!newHabitName.trim()) return;
    
    try {
      await habitApi.createHabit({
        name: newHabitName.trim(),
        frequency: "DAILY",
      });
      await fetchHabitsFromApi();
    } catch (err) {
      console.log("Lỗi khi tạo habit:", err);
    }

    setNewHabitName("");
    setNewHabitRule("");
    setNewHabitDetail("");
    setIsAddModalOpen(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        contentContainerClassName="p-5 pb-4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={["#22C55E"]}
          />
        }
      >
        {/* ==================== 1. HEADER (Bỏ nút Setting) ==================== */}
        <View className="mb-4 pt-2">
          <Text variant="h1">Habits</Text>
          <Text variant="muted" className="mt-0.5">
            Xây dựng thói quen tốt mỗi ngày ✨
          </Text>
        </View>

        {/* ==================== 2. CARD TỔNG QUAN HÔM NAY ==================== */}
        <Card className="p-4 mb-4 rounded-3xl bg-card border  bg-emerald-500/5 shadow-xs">

          <Text variant="h4">
            Tổng quan hôm nay
          </Text>

          <View className="flex-row items-center justify-between">
            {/* Vòng tròn tiến độ 80% */}
            <CircularProgress percentage={overallPercentage} color="#22C55E" />

            {/* 3 Cột chỉ số */}
            <View className="flex-1 ml-4 justify-between">
              <View className="flex-row justify-between items-center mb-3">
                {/* 1. Hoàn thành */}
                <View className="items-center flex-1">
                  <View className="flex-row items-center gap-1">
                    <Icon as={CheckCircle2} size={16} color="#22C55E" />
                    <Text className="font-extrabold text-sm text-foreground">
                      {completedCount} / {totalCount}
                    </Text>
                  </View>
                  <Text className="text-[10px] text-muted-foreground mt-0.5">
                    Hoàn thành
                  </Text>
                </View>

                {/* 2. Streak hiện tại */}
                <View className="items-center flex-1">
                  <View className="flex-row items-center gap-1">
                    <Icon as={Flame} size={16} color="#EF4444" />
                    <Text className="font-extrabold text-sm text-foreground">
                      {currentStreakDays}
                    </Text>
                  </View>
                  <Text className="text-[10px] text-muted-foreground mt-0.5">
                    Streak hiện tại
                  </Text>
                </View>

                {/* 3. Streak tốt nhất */}
                <View className="items-center flex-1">
                  <View className="flex-row items-center gap-1">
                    <Icon as={Trophy} size={16} color="#F59E0B" />
                    <Text className="font-extrabold text-sm text-foreground">
                      {bestStreakDays}
                    </Text>
                  </View>
                  <Text className="text-[10px] text-muted-foreground mt-0.5">
                    Streak tốt nhất
                  </Text>
                </View>
              </View>

              {/* Khung lời nhắn động viên */}
              <View className="bg-emerald-500/10 rounded-full py-1.5 px-3 items-center justify-center">
                <Text className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  💚 Bạn đang làm rất tốt! Tiếp tục nhé! 💚
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* ==================== 3. SUB-NAVIGATION TABS ==================== */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-5 border-b border-border/50 pb-1"
        >
          {(
            ["Hôm nay", "Lịch", "Thống kê", "AI Coach", "Thử thách"] as const
          ).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                activeOpacity={0.7}
                onPress={() => setActiveTab(tab)}
                className="mr-6 pb-2 relative"
              >
                <Text
                  className={`text-sm font-bold ${
                    isActive ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                  }`}
                >
                  {tab}
                </Text>
                {isActive && (
                  <View className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ==================== 4. CONDITIONAL TAB VIEWS ==================== */}
        {activeTab === "Thống kê" && (
          <HabitAnalyticsView
            data={analyticsData}
            isLoading={isLoadingAnalytics}
            selectedRange={analyticsRange}
            onSelectRange={(range) => {
              setAnalyticsRange(range);
              fetchAnalytics(range);
            }}
            onRefresh={() => fetchAnalytics(analyticsRange)}
          />
        )}

        {activeTab === "Hôm nay" && (
          <>
            {/* HABIT CỦA TÔI CARD SECTION */}
            <Card className="rounded-3xl p-4 mb-4 bg-card border-border shadow-xs">
              {/* Header Row */}
              <View className="flex-row items-center justify-between mb-3">
                <Text variant="h3">Habit của tôi</Text>
                <TouchableOpacity className="flex-row items-center gap-1">
                  <Text variant="caption">Sắp xếp</Text>
                  <Icon as={ChevronDown} size={16} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {/* Danh sách các Habit */}
              {habits.map((item) => {
                return (
                  <View
                    key={item.id}
                    className="mb-2 bg-background border border-border rounded-2xl p-3 flex-row items-center justify-between"
                  >
                    {/* Left Icon Square */}
                    <View
                      className={`w-11 h-11 rounded-2xl items-center justify-center mr-3 ${item.bgColor}`}
                    >
                      <Icon as={item.icon} size={22} color={item.color} />
                    </View>

                    {/* Body Content */}
                    <View className="flex-1 mr-2">
                      {/* Row 1: Title & Streak */}
                      <View className="flex-row items-center justify-between mb-1">
                        <Text className="font-bold text-sm text-foreground">
                          {item.name}
                        </Text>
                        <View className="flex-row items-center gap-0.5">
                          <Icon as={Flame} size={12} color="#EF4444" />
                          <Text className="text-[11px] font-semibold text-muted-foreground">
                            {item.streakDays} ngày
                          </Text>
                        </View>
                      </View>

                      {/* Row 2: Subtitles */}
                      <View className="flex-row items-center gap-2 mb-2">
                        <Text className="text-[11px] text-muted-foreground font-medium">
                          {item.rule}
                        </Text>
                        <Text className="text-[11px] text-muted-foreground/60">•</Text>
                        <View className="flex-row items-center gap-0.5">
                          <Icon
                            as={item.name.includes("nước") ? Droplets : Clock}
                            size={11}
                            color={item.color}
                          />
                          <Text
                            style={{ color: item.color }}
                            className="text-[11px] font-semibold"
                          >
                            {item.detail}
                          </Text>
                        </View>
                      </View>

                      {/* Row 3: Horizontal Progress Bar & Percentage */}
                      <View className="flex-row items-center gap-2">
                        <View className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <View
                            style={{
                              width: `${item.progress}%`,
                              backgroundColor: item.color,
                            }}
                            className="h-full rounded-full"
                          />
                        </View>
                        <Text className="text-[10px] font-bold text-muted-foreground w-7 text-right">
                          {item.progress}%
                        </Text>
                      </View>
                    </View>

                    {/* Right Checkbox Circle */}
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => toggleCheck(item.id)}
                      className="ml-1"
                    >
                      {item.checked ? (
                        <View className="w-7 h-7 rounded-full bg-emerald-500 items-center justify-center shadow-xs">
                          <Icon as={Check} size={16} color="#FFFFFF" />
                        </View>
                      ) : (
                        <View className="w-7 h-7 rounded-full border-2 border-muted-foreground/30 bg-transparent" />
                      )}
                    </TouchableOpacity>
                  </View>
                );
              })}

              {/* Bottom Button inside Card */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setIsAddModalOpen(true)}
                className="w-full py-3 bg-emerald-500 rounded-xl items-center justify-center flex-row gap-1.5 mt-2"
              >
                <Icon as={Plus} size={18} color="#fff" />
                <Text className="font-bold text-md text-[#fff]">Thêm habit mới</Text>
              </TouchableOpacity>
            </Card>

            {/* LỊCH MINI NGAY DƯỚI */}
            <Card className="rounded-3xl p-3 bg-card border-border shadow-xs overflow-hidden mb-6">
              <Calendar
                onDayPress={(day: any) => setSelectedDate(day.dateString)}
                markedDates={(() => {
                  const todayStr = new Date().toISOString().split("T")[0];
                  const baseDates: Record<string, any> = {};

                  const completedHabits = habits.filter((h) => h.checked);
                  if (completedHabits.length > 0) {
                    baseDates[todayStr] = {
                      dots: completedHabits.map((h) => ({ color: h.color })),
                    };
                  }

                  if (selectedDate) {
                    const existing = baseDates[selectedDate] || {};
                    baseDates[selectedDate] = {
                      ...existing,
                      selected: true,
                      selectedColor: "#22C55E",
                    };
                  }

                  return baseDates;
                })()}
                hideExtraDays={true}
                firstDay={1}
              />
            </Card>
          </>
        )}

        {activeTab === "Lịch" && (
          <Card className="rounded-3xl p-4 bg-card border-border shadow-xs overflow-hidden mb-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text variant="h3">Lịch theo dõi thói quen</Text>
              <Text className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                Ngày: {selectedDate}
              </Text>
            </View>
            <Calendar
              onDayPress={(day: any) => setSelectedDate(day.dateString)}
              markedDates={(() => {
                const todayStr = new Date().toISOString().split("T")[0];
                const baseDates: Record<string, any> = {};

                const completedHabits = habits.filter((h) => h.checked);
                if (completedHabits.length > 0) {
                  baseDates[todayStr] = {
                    dots: completedHabits.map((h) => ({ color: h.color })),
                  };
                }

                if (selectedDate) {
                  const existing = baseDates[selectedDate] || {};
                  baseDates[selectedDate] = {
                    ...existing,
                    selected: true,
                    selectedColor: "#22C55E",
                  };
                }

                return baseDates;
              })()}
              hideExtraDays={false}
              firstDay={1}
            />

            {/* Chi tiết ngày đang chọn */}
            <View className="mt-4 pt-3 border-t border-border">
              <Text className="text-xs font-bold text-muted-foreground mb-2">
                THÓI QUEN TRONG NGÀY {selectedDate}
              </Text>
              {habits.map((h) => (
                <View
                  key={h.id}
                  className="flex-row items-center justify-between py-2 border-b border-border/40"
                >
                  <View className="flex-row items-center gap-2">
                    <View
                      style={{ backgroundColor: `${h.color}20` }}
                      className="w-6 h-6 rounded-md items-center justify-center"
                    >
                      <Icon as={h.icon} size={13} color={h.color} />
                    </View>
                    <Text className="text-sm font-semibold text-foreground">{h.name}</Text>
                  </View>
                  <Text className="text-xs text-muted-foreground">
                    Chuỗi: {h.streakDays} ngày
                  </Text>
                </View>
              ))}
            </View>
          </Card>
        )}

        {activeTab === "AI Coach" && (
          <Card className="rounded-3xl p-5 bg-card border-border shadow-xs mb-6">
            <View className="flex-row items-center gap-3 mb-4">
              <View className="w-12 h-12 rounded-2xl bg-emerald-500/15 items-center justify-center">
                <Icon as={Bot} size={26} color="#10B981" />
              </View>
              <View className="flex-1">
                <Text variant="h3">AI Habit Coach</Text>
                <Text className="text-xs text-muted-foreground mt-0.5">
                  Trợ lý thông minh phân tích và tối ưu thói quen
                </Text>
              </View>
            </View>

            <View className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20 mb-4">
              <View className="flex-row items-center gap-2 mb-1.5">
                <Icon as={Sparkles} size={16} color="#10B981" />
                <Text className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  Lời khuyên hôm nay
                </Text>
              </View>
              <Text className="text-xs text-foreground/80 leading-relaxed font-medium">
                Dựa trên thói quen hiện tại, bạn có xu hướng hoàn thành tốt nhất vào buổi sáng.
                Hãy tiếp tục gắn thói quen mới vào chuỗi thói quen đã vững chắc này để duy trì tỷ lệ thành công cao nhất!
              </Text>
            </View>

            <View className="p-3 bg-muted/40 rounded-2xl border border-border">
              <Text className="text-xs font-bold text-foreground mb-1">
                Gợi ý quy tắc 2 phút (Atomic Habits)
              </Text>
              <Text className="text-xs text-muted-foreground leading-relaxed">
                Khi bắt đầu một thói quen mới, hãy làm nó trong ít hơn 2 phút để biến nó thành một phần tự nhiên trong ngày mà không tạo áp lực.
              </Text>
            </View>
          </Card>
        )}

        {activeTab === "Thử thách" && (
          <Card className="rounded-3xl p-5 bg-card border-border shadow-xs mb-6">
            <View className="flex-row items-center gap-3 mb-4">
              <View className="w-12 h-12 rounded-2xl bg-amber-500/15 items-center justify-center">
                <Icon as={Trophy} size={24} color="#F59E0B" />
              </View>
              <View className="flex-1">
                <Text variant="h3">Thử thách thói quen</Text>
                <Text className="text-xs text-muted-foreground mt-0.5">
                  Chinh phục các cột mốc để nhận huy hiệu
                </Text>
              </View>
            </View>

            {/* Thử thách 1 */}
            <View className="bg-background border border-border p-4 rounded-2xl mb-3">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-sm font-bold text-foreground">🔥 Kỷ luật thép (7 Ngày)</Text>
                <Text className="text-xs font-extrabold text-amber-500">Đang thực hiện</Text>
              </View>
              <Text className="text-xs text-muted-foreground mb-2">
                Hoàn thành tất cả thói quen liên tục trong 7 ngày liên tiếp.
              </Text>
              <View className="h-2 bg-muted rounded-full overflow-hidden">
                <View style={{ width: "70%" }} className="h-full bg-amber-500 rounded-full" />
              </View>
            </View>

            {/* Thử thách 2 */}
            <View className="bg-background border border-border p-4 rounded-2xl">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-sm font-bold text-foreground">🌊 Uống nước đúng giờ (14 Ngày)</Text>
                <Text className="text-xs font-bold text-muted-foreground">Chưa bắt đầu</Text>
              </View>
              <Text className="text-xs text-muted-foreground mb-2">
                Duy trì uống đủ 2L nước mỗi ngày trong 14 ngày.
              </Text>
              <View className="h-2 bg-muted rounded-full overflow-hidden">
                <View style={{ width: "20%" }} className="h-full bg-blue-500 rounded-full" />
              </View>
            </View>
          </Card>
        )}
      </ScrollView>

      {/* MODAL THÊM HABIT MỚI */}
      <Modal
        visible={isAddModalOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsAddModalOpen(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center p-5">
          <Card className="w-full max-w-md p-6 bg-card border-border rounded-3xl shadow-xl">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="font-extrabold text-lg text-foreground">
                Thêm thói quen mới
              </Text>
              <TouchableOpacity onPress={() => setIsAddModalOpen(false)}>
                <Icon as={X} size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <Text className="text-xs font-semibold text-muted-foreground mb-1.5">
              Tên thói quen
            </Text>
            <TextInput
              value={newHabitName}
              onChangeText={setNewHabitName}
              placeholder="VD: Tập Yoga..."
              placeholderTextColor="#9CA3AF"
              className="bg-muted/30 border border-border rounded-xl px-4 py-3 text-foreground text-sm mb-3"
            />

            <Text className="text-xs font-semibold text-muted-foreground mb-1.5">
              Mục tiêu / Quy định
            </Text>
            <TextInput
              value={newHabitRule}
              onChangeText={setNewHabitRule}
              placeholder="VD: 30 phút mỗi ngày..."
              placeholderTextColor="#9CA3AF"
              className="bg-muted/30 border border-border rounded-xl px-4 py-3 text-foreground text-sm mb-3"
            />

            <Text className="text-xs font-semibold text-muted-foreground mb-1.5">
              Thời gian
            </Text>
            <TextInput
              value={newHabitDetail}
              onChangeText={setNewHabitDetail}
              placeholder="VD: 07:00..."
              placeholderTextColor="#9CA3AF"
              className="bg-muted/30 border border-border rounded-xl px-4 py-3 text-foreground text-sm mb-6"
            />

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setIsAddModalOpen(false)}
                className="flex-1 py-3 bg-muted rounded-xl items-center"
              >
                <Text className="font-semibold text-foreground">Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAddHabit}
                className="flex-1 py-3 bg-emerald-500 rounded-xl items-center"
              >
                <Text className="font-bold text-white">Tạo thói quen</Text>
              </TouchableOpacity>
            </View>
          </Card>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
