import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Text } from "@/components/ui/text";
import { Icon } from "@/components/ui/icon";
import { LucideIcon } from "lucide-react-native";
import { cn } from "@/lib/utils";
import { TASK_STATUS } from "@/types";
import { View } from "react-native";

export default function TaskCard({
  iconName,
  name,
  checked,
  setChecked,
  dueDate,
  status,
  category,
  indicatorClassName,
}: {
  iconName?: LucideIcon;
  name: string;
  checked: boolean;
  setChecked: (checked: boolean) => void;
  dueDate: Date;
  status: TASK_STATUS;
  category: string;
  indicatorClassName?: string;
}) {
  return (
    <Card className="flex-row justify-between items-center mb-3 rounded-2xl p-4 shadow-sm border-border bg-card">
      <View className="flex-column items-start">
        <View className="flex-row gap-1">
          <Badge>
            <Text variant={"lead"} className="pb-1">
              {status}
            </Text>
          </Badge>
          <Badge>
            <Text variant={"lead"} className="pb-1">
              {dueDate.toDateString()}
            </Text>
          </Badge>
        </View>
        <View className="flex-row items-center">
          <View className="w-12 h-12 rounded-2xl bg-primary/10 justify-center items-center mr-4">
            {iconName && <Icon as={iconName} size={24} color="#22C55E" />}
          </View>
          <View className="justify-center">
            <Text
              variant="large"
              className={cn("mb-1", checked && "line-through opacity-50")}
            >
              {name}
            </Text>
          </View>
        </View>
      </View>
      <Checkbox
        checked={checked}
        onCheckedChange={setChecked}
        className={cn(
          "w-6 h-6 rounded-md border-primary overflow-hidden",
          indicatorClassName,
        )}
      />
    </Card>
  );
}
