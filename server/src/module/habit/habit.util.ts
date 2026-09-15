export function calculateHabitStats(habit: any) {
  const records = habit.records || [];
  if (records.length === 0) {
    return { streak: { current: 0, max: 0 }, completionRate: 0 };
  }
  // Lọc các ngày bị trùng nhau 
  const uniqueDates: string[] = Array.from(new Set<string>(records.map((r: any) => {
    const d = new Date(r.completedAt);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
  }))).sort((a: string, b: string) => b.localeCompare(a)); // Sắp xếp giảm dần (mới nhất lên đầu)

  let maxStreak = 0;
  let currentStreak = 0;
  
  // Tính Max Streak
  let tempStreak = 1;
  for (let i = 0; i < uniqueDates.length; i++) {
    if (i === 0) {
      maxStreak = 1;
      continue;
    }
    const prevDate = new Date(uniqueDates[i - 1]);
    const currDate = new Date(uniqueDates[i]);
    const diffDays = Math.round(Math.abs(prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24));
    // Nếu khoảng cách 2 ngày records liên tiếp nhau 
    if (diffDays === 1) {
      tempStreak++;
      if (tempStreak > maxStreak) maxStreak = tempStreak;
    } else {
      tempStreak = 1;
    }
  }

  // Tính Current Streak
  const today = new Date();
  const todayStr = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().split('T')[0];
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = new Date(yesterday.getTime() - yesterday.getTimezoneOffset() * 60000).toISOString().split('T')[0];

  if (uniqueDates[0] === todayStr || uniqueDates[0] === yesterdayStr) {
    currentStreak = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
      const prevDate = new Date(uniqueDates[i - 1]);
      const currDate = new Date(uniqueDates[i]);
      const diffDays = Math.round(Math.abs(prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // Tính Completion Rate theo tần suất
  const createdDate = new Date(habit.createdAt);
  const createdDateStr = new Date(createdDate.getTime() - createdDate.getTimezoneOffset() * 60000).toISOString().split('T')[0];
  const diffTimeSinceCreation = Math.abs(new Date(todayStr).getTime() - new Date(createdDateStr).getTime());
  const totalDaysSinceCreation = Math.max(1, Math.round(diffTimeSinceCreation / (1000 * 60 * 60 * 24)) + 1); // +1 để tính cả ngày tạo
  
  let expectedTimes = totalDaysSinceCreation;
  if (habit.frequency === "WEEKLY") {
    expectedTimes = Math.max(1, Math.ceil(totalDaysSinceCreation / 7));
  } else if (habit.frequency === "MONTHLY") {
    expectedTimes = Math.max(1, Math.ceil(totalDaysSinceCreation / 30));
  }

  const completionRate = Math.round((uniqueDates.length / expectedTimes) * 100);

  return {
    streak: {
      current: currentStreak,
      max: maxStreak,
    },
    completionRate: Math.min(100, completionRate),
  };
}
