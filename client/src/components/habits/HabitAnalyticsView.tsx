import React, { useMemo } from "react";
import { View, TouchableOpacity, Dimensions, Platform, ActivityIndicator } from "react-native";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Icon } from "@/components/ui/icon";
import {
  Flame,
  Trophy,
  Target,
  Zap,
  CheckCircle2,
  CalendarDays,
  TrendingUp,
  Award,
  Sparkles,
  BarChart2,
} from "lucide-react-native";
import { LineChart, BarChart } from "react-native-gifted-charts";
import { LinearGradient, Stop } from "react-native-svg";
import type { AnalyticsResponse } from "@/services/dashboard.service";

interface HabitAnalyticsViewProps {
  data: AnalyticsResponse | null;
  isLoading: boolean;
  selectedRange: "7d" | "30d";
  onSelectRange: (range: "7d" | "30d") => void;
  onRefresh?: () => void;
}

export default function HabitAnalyticsView({
  data,
  isLoading,
  selectedRange,
  onSelectRange,
}: HabitAnalyticsViewProps) {
  const screenWidth = Dimensions.get("window").width;
  const chartWidth = Math.max(260, screenWidth - 84);

  // Line chart data: Thói quen hoàn thành theo từng ngày
  const lineChartData = useMemo(() => {
    if (!data?.dailyStats || data.dailyStats.length === 0) return [];
    return data.dailyStats.map((item) => {
      const parts = item.date.split("-");
      const shortLabel = parts.length === 3 ? `${parseInt(parts[2], 10)}/${parseInt(parts[1], 10)}` : item.dayOfWeek;
      return {
        value: item.habitRate,
        labelComponent: () => (
          <View style={{ width: 40, marginLeft: -12, marginTop: 4 }}>
            <Text className="text-[10px] text-muted-foreground text-center font-medium">
              {shortLabel}
            </Text>
          </View>
        ),
      };
    });
  }, [data]);

  // Bar chart data: So sánh Habit vs Task
  const barChartData = useMemo(() => {
    if (!data?.dailyStats || data.dailyStats.length === 0) return [];
    // Hiển thị 7 ngày gần nhất để biểu đồ cột thoáng đẹp
    const recent = data.dailyStats.slice(-7);
    const result: any[] = [];

    recent.forEach((item) => {
      const parts = item.date.split("-");
      const dayLabel = parts.length === 3 ? `${parseInt(parts[2], 10)}/${parseInt(parts[1], 10)}` : item.dayOfWeek;

      // Cột 1: Habit Rate
      result.push({
        value: item.habitRate,
        spacing: 4,
        label: dayLabel,
        labelTextStyle: { color: "#9CA3AF", fontSize: 9 },
        frontColor: "#10B981",
      });
      // Cột 2: Task Rate
      result.push({
        value: item.taskRate,
        frontColor: "#3B82F6",
      });
    });

    return result;
  }, [data]);

  if (isLoading && !data) {
    return (
      <Card className="p-8 items-center justify-center rounded-3xl bg-card border border-border my-4">
        <ActivityIndicator size="large" color="#10B981" />
        <Text className="text-sm font-semibold text-muted-foreground mt-3">
          Đang tải dữ liệu thống kê...
        </Text>
      </Card>
    );
  }

  const habitRate = data?.habitAverageRate ?? 0;
  const taskRate = data?.taskAverageRate ?? 0;
  const overallScore = data?.overallScore ?? 0;
  const completions = data?.totalHabitCompletions ?? 0;
  const tasksCompleted = data?.totalTasksCompleted ?? 0;
  const topHabits = data?.topHabits ?? [];

  // Message động viên theo điểm
  const insightMessage =
    overallScore >= 80
      ? "Phong độ vượt bậc! Kỷ luật của bạn đang tạo nên kết quả phi thường 🚀"
      : overallScore >= 50
      ? "Tiến độ rất vững chắc! Hãy tiếp tục duy trì ngọn lửa kiên trì 🔥"
      : "Mỗi bước đi nhỏ đều đáng giá. Hãy bắt đầu với 1 thói quen hôm nay 🌱";

  return (
    <View className="space-y-4 mb-6">
      {/* 1. Bộ lọc Khoảng thời gian (Pills) */}
      <View className="flex-row items-center justify-between mb-3 bg-muted/40 p-1.5 rounded-2xl border border-border/60">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => onSelectRange("7d")}
          className={`flex-1 py-2 rounded-xl items-center flex-row justify-center gap-1.5 ${
            selectedRange === "7d"
              ? "bg-emerald-500 shadow-xs"
              : "bg-transparent"
          }`}
        >
          <Icon
            as={CalendarDays}
            size={14}
            color={selectedRange === "7d" ? "#FFFFFF" : "#6B7280"}
          />
          <Text
            className={`text-xs font-bold ${
              selectedRange === "7d" ? "text-white" : "text-muted-foreground"
            }`}
          >
            7 ngày gần đây
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => onSelectRange("30d")}
          className={`flex-1 py-2 rounded-xl items-center flex-row justify-center gap-1.5 ${
            selectedRange === "30d"
              ? "bg-emerald-500 shadow-xs"
              : "bg-transparent"
          }`}
        >
          <Icon
            as={BarChart2}
            size={14}
            color={selectedRange === "30d" ? "#FFFFFF" : "#6B7280"}
          />
          <Text
            className={`text-xs font-bold ${
              selectedRange === "30d" ? "text-white" : "text-muted-foreground"
            }`}
          >
            30 ngày gần đây
          </Text>
        </TouchableOpacity>
      </View>

      {/* 2. Hộp Lời khuyên & Động viên */}
      <Card className="p-4 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 mb-3 flex-row items-center gap-3">
        <View className="w-10 h-10 rounded-2xl bg-emerald-500/20 items-center justify-center">
          <Icon as={Sparkles} size={20} color="#10B981" />
        </View>
        <View className="flex-1">
          <Text className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-0.5">
            Đánh giá hiệu suất ({selectedRange.toUpperCase()})
          </Text>
          <Text className="text-xs text-foreground/80 font-medium leading-tight">
            {insightMessage}
          </Text>
        </View>
      </Card>

      {/* 3. 4 Thẻ KPI Tóm tắt */}
      <View className="flex-row gap-3 mb-3">
        {/* Thẻ 1: Tỷ lệ thói quen */}
        <Card className="flex-1 p-3.5 rounded-2xl bg-card border border-border shadow-xs">
          <View className="flex-row items-center justify-between mb-1.5">
            <Text className="text-[11px] font-semibold text-muted-foreground">
              Tuân thủ Habit
            </Text>
            <View className="w-6 h-6 rounded-lg bg-emerald-500/15 items-center justify-center">
              <Icon as={Target} size={14} color="#10B981" />
            </View>
          </View>
          <Text className="text-2xl font-black text-foreground mb-0.5">
            {habitRate}%
          </Text>
          <Text className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
            {completions} lượt hoàn thành
          </Text>
        </Card>

        {/* Thẻ 2: Điểm tổng quát */}
        <Card className="flex-1 p-3.5 rounded-2xl bg-card border border-border shadow-xs">
          <View className="flex-row items-center justify-between mb-1.5">
            <Text className="text-[11px] font-semibold text-muted-foreground">
              Điểm tổng quát
            </Text>
            <View className="w-6 h-6 rounded-lg bg-amber-500/15 items-center justify-center">
              <Icon as={Zap} size={14} color="#F59E0B" />
            </View>
          </View>
          <Text className="text-2xl font-black text-foreground mb-0.5">
            {overallScore}%
          </Text>
          <Text className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
            Habit & Công việc
          </Text>
        </Card>
      </View>

      <View className="flex-row gap-3 mb-4">
        {/* Thẻ 3: Công việc hoàn thành */}
        <Card className="flex-1 p-3.5 rounded-2xl bg-card border border-border shadow-xs">
          <View className="flex-row items-center justify-between mb-1.5">
            <Text className="text-[11px] font-semibold text-muted-foreground">
              Hoàn thành Task
            </Text>
            <View className="w-6 h-6 rounded-lg bg-blue-500/15 items-center justify-center">
              <Icon as={CheckCircle2} size={14} color="#3B82F6" />
            </View>
          </View>
          <Text className="text-2xl font-black text-foreground mb-0.5">
            {taskRate}%
          </Text>
          <Text className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">
            {tasksCompleted} tasks hoàn tất
          </Text>
        </Card>

        {/* Thẻ 4: Top Habit kiên trì */}
        <Card className="flex-1 p-3.5 rounded-2xl bg-card border border-border shadow-xs">
          <View className="flex-row items-center justify-between mb-1.5">
            <Text className="text-[11px] font-semibold text-muted-foreground">
              Top Streak
            </Text>
            <View className="w-6 h-6 rounded-lg bg-rose-500/15 items-center justify-center">
              <Icon as={Flame} size={14} color="#EF4444" />
            </View>
          </View>
          <Text className="text-2xl font-black text-foreground mb-0.5">
            {topHabits[0]?.currentStreak ?? 0}
            <Text className="text-xs font-bold text-muted-foreground"> ngày</Text>
          </Text>
          <Text className="text-[10px] text-rose-500 font-bold truncate">
            {topHabits[0]?.name ?? "Chưa có dữ liệu"}
          </Text>
        </Card>
      </View>

      {/* 4. Biểu đồ Xu hướng Hoàn thành Thói quen (LineChart) */}
      <Card className="p-4 rounded-3xl bg-card border border-border shadow-xs mb-4 overflow-hidden">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center gap-2">
            <View className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <Text className="font-bold text-sm text-foreground">
              Xu hướng tuân thủ thói quen (%)
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Icon as={TrendingUp} size={14} color="#10B981" />
            <Text className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400">
              TB: {habitRate}%
            </Text>
          </View>
        </View>

        {lineChartData.length > 0 ? (
          <View className="w-full items-center my-2">
            <LineChart
              curved
              areaChart
              data={lineChartData}
              width={chartWidth}
              height={150}
              maxValue={100}
              noOfSections={4}
              color="#10B981"
              thickness={2.5}
              dataPointsColor="#10B981"
              dataPointsRadius={4}
              initialSpacing={16}
              endSpacing={16}
              spacing={Math.max(28, (chartWidth - 40) / Math.max(1, lineChartData.length - 1))}
              hideYAxisText={false}
              yAxisTextStyle={{ color: "#9CA3AF", fontSize: 9 }}
              yAxisLabelWidth={28}
              xAxisThickness={0}
              yAxisThickness={0}
              rulesColor="rgba(156, 163, 175, 0.15)"
              rulesType="solid"
              areaGradientId="habitGradient"
              areaGradientComponent={() => (
                <LinearGradient id="habitGradient" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor="#10B981" stopOpacity="0.3" />
                  <Stop offset="1" stopColor="#10B981" stopOpacity="0.0" />
                </LinearGradient>
              )}
            />
          </View>
        ) : (
          <View className="py-8 items-center justify-center">
            <Text className="text-xs text-muted-foreground">
              Chưa có đủ dữ liệu thói quen để hiển thị biểu đồ
            </Text>
          </View>
        )}
      </Card>

      {/* 5. Biểu đồ Đối chiếu Thói quen & Công việc (BarChart) */}
      <Card className="p-4 rounded-3xl bg-card border border-border shadow-xs mb-4 overflow-hidden">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="font-bold text-sm text-foreground">
            Đối chiếu Thói quen vs Công việc
          </Text>
          <View className="flex-row items-center gap-3">
            <View className="flex-row items-center gap-1">
              <View className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <Text className="text-[10px] text-muted-foreground font-medium">Habits</Text>
            </View>
            <View className="flex-row items-center gap-1">
              <View className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <Text className="text-[10px] text-muted-foreground font-medium">Tasks</Text>
            </View>
          </View>
        </View>

        {barChartData.length > 0 ? (
          <View className="w-full items-center my-2">
            <BarChart
              data={barChartData}
              barWidth={10}
              height={140}
              width={chartWidth}
              maxValue={100}
              noOfSections={4}
              hideYAxisText={false}
              yAxisTextStyle={{ color: "#9CA3AF", fontSize: 9 }}
              yAxisLabelWidth={28}
              xAxisThickness={0}
              yAxisThickness={0}
              rulesColor="rgba(156, 163, 175, 0.15)"
              initialSpacing={14}
              spacing={16}
              roundedTop
              roundedBottom
            />
          </View>
        ) : (
          <View className="py-8 items-center justify-center">
            <Text className="text-xs text-muted-foreground">
              Chưa có dữ liệu đối chiếu
            </Text>
          </View>
        )}
      </Card>

      {/* 6. Bảng Xếp Hạng Top Thói Quen Kiên Trì Nhất (Top Streaks) */}
      <Card className="p-4 rounded-3xl bg-card border border-border shadow-xs mb-6">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center gap-2">
            <View className="w-7 h-7 rounded-xl bg-amber-500/15 items-center justify-center">
              <Icon as={Trophy} size={16} color="#F59E0B" />
            </View>
            <Text className="font-extrabold text-sm text-foreground">
              Bảng vàng kiên trì (Top Streaks)
            </Text>
          </View>
          <Text className="text-[11px] text-muted-foreground font-medium">
            {topHabits.length} thói quen
          </Text>
        </View>

        {topHabits.length > 0 ? (
          <View className="space-y-2.5">
            {topHabits.map((habit, idx) => {
              const badgeColor =
                idx === 0
                  ? "#F59E0B"
                  : idx === 1
                  ? "#94A3B8"
                  : idx === 2
                  ? "#F97316"
                  : "#6B7280";

              return (
                <View
                  key={habit.id}
                  className="bg-background/80 border border-border rounded-2xl p-3 flex-row items-center justify-between mb-2"
                >
                  {/* Left Rank Badge */}
                  <View
                    style={{ backgroundColor: `${badgeColor}20` }}
                    className="w-8 h-8 rounded-xl items-center justify-center mr-3"
                  >
                    {idx < 3 ? (
                      <Icon as={idx === 0 ? Trophy : Award} size={16} color={badgeColor} />
                    ) : (
                      <Text className="text-xs font-black text-muted-foreground">
                        #{idx + 1}
                      </Text>
                    )}
                  </View>

                  {/* Habit Details */}
                  <View className="flex-1 mr-3">
                    <View className="flex-row items-center justify-between mb-1">
                      <Text className="font-bold text-sm text-foreground">
                        {habit.name}
                      </Text>
                      <View className="flex-row items-center gap-1">
                        <Icon as={Flame} size={13} color="#EF4444" />
                        <Text className="text-xs font-extrabold text-foreground">
                          {habit.currentStreak} ngày
                        </Text>
                      </View>
                    </View>

                    {/* Progress Bar & Subtitle */}
                    <View className="flex-row items-center gap-2">
                      <View className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <View
                          style={{ width: `${habit.completionRate}%` }}
                          className="h-full bg-emerald-500 rounded-full"
                        />
                      </View>
                      <Text className="text-[10px] font-bold text-muted-foreground w-16 text-right">
                        Tỉ lệ {habit.completionRate}%
                      </Text>
                    </View>

                    <View className="flex-row items-center justify-between mt-1">
                      <Text className="text-[10px] text-muted-foreground">
                        {habit.frequency === "DAILY" ? "Hàng ngày" : "Hàng tuần"}
                      </Text>
                      <Text className="text-[10px] text-muted-foreground font-medium">
                        Kỷ lục: {habit.maxStreak} ngày
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View className="py-6 items-center justify-center">
            <Text className="text-xs text-muted-foreground">
              Chưa có dữ liệu thói quen nào. Hãy tạo thói quen đầu tiên!
            </Text>
          </View>
        )}
      </Card>
    </View>
  );
}
