import React, { useState, useEffect } from "react";
import { Modal, View, TextInput, TouchableOpacity, Alert } from "react-native";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Icon } from "../ui/icon";
import { X } from "lucide-react-native";
import { SegmentedControl } from "../ui/segmented-control";
import { journalApi } from "@/services/journal.service";
import { MOOD } from "@/types";

interface JournalModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  journalToEdit?: any;
}

const MOOD_MAP: Record<string, { name: string; value: MOOD }> = {
  "Rất vui": { name: "Rất vui", value: "Very Happy" },
  "Vui": { name: "Vui", value: "Happy" },
  "Bình thường": { name: "Bình thường", value: "Normal" },
  "Buồn": { name: "Buồn", value: "Sad" },
  "Rất buồn": { name: "Rất buồn", value: "Very Sad" },
};

const VALUE_TO_NAME: Record<string, string> = {
  VERY_HAPPY: "Rất vui",
  HAPPY: "Vui",
  NORMAL: "Bình thường",
  SAD: "Buồn",
  VERY_SAD: "Rất buồn",
};

export default function JournalModal({
  visible,
  onClose,
  onSuccess,
  journalToEdit,
}: JournalModalProps) {
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [selectedMood, setSelectedMood] = useState<{
    name: string;
    value: string;
  }>({
    name: "Vui",
    value: "HAPPY",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      if (journalToEdit) {
        setName(journalToEdit.name || "");
        setContent(journalToEdit.content || "");
        const moodVal = journalToEdit.mood || "HAPPY";
        setSelectedMood({
          name: VALUE_TO_NAME[moodVal] || "Vui",
          value: moodVal,
        });
      } else {
        setName("");
        setContent("");
        setSelectedMood({
          name: "Vui",
          value: "HAPPY",
        });
      }
    }
  }, [journalToEdit, visible]);

  const handleSubmit = async () => {
    if (!content.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập nội dung nhật ký");
      return;
    }

    try {
      setIsSubmitting(true);
      if (journalToEdit?.id) {
        await journalApi.updateJournal(journalToEdit.id, {
          name: name.trim(),
          content: content.trim(),
          mood: selectedMood.value as MOOD,
        });
      } else {
        await journalApi.createJournal({
          name: name.trim(),
          content: content.trim(),
          mood: selectedMood.value as MOOD,
        });
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      Alert.alert(
        "Lỗi",
        journalToEdit ? "Không thể cập nhật nhật ký." : "Không thể tạo nhật ký."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    if (!journalToEdit?.id) return;
    Alert.alert("Xóa nhật ký", "Bạn có chắc chắn muốn xóa bài nhật ký này không?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            await journalApi.deleteJournal(journalToEdit.id);
            onSuccess();
            onClose();
          } catch (error) {
            console.error(error);
            Alert.alert("Lỗi", "Không thể xóa nhật ký.");
          }
        },
      },
    ]);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white rounded-t-3xl p-5">
          <View className="flex-row justify-between items-center mb-5">
            <Text variant="h2">{journalToEdit ? "Cập nhật Nhật ký" : "Thêm Nhật ký"}</Text>
            <TouchableOpacity onPress={onClose} className="items-center">
              <Icon as={X} size={24} />
            </TouchableOpacity>
          </View>

          <View className="mb-4">
            <Text className="font-semibold mb-2 text-gray-700">Tên nhật ký</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 text-base text-gray-900 bg-gray-50"
              placeholder="VD: Cà phê sáng, Hoàn thành dự án..."
              value={name}
              onChangeText={setName}
            />
          </View>

          <View className="mb-4">
            <Text className="font-semibold mb-2 text-gray-700">Nội dung</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 text-base text-gray-900 bg-gray-50 h-28"
              placeholder="Hôm nay..."
              value={content}
              onChangeText={setContent}
              multiline
              textAlignVertical="top"
            />
          </View>

          <View className="mb-6">
            <Text className="font-semibold mb-2 text-gray-700">Tâm trạng</Text>
            <SegmentedControl
              options={["Rất vui", "Vui", "Bình thường", "Buồn", "Rất buồn"]}
              selectedOption={selectedMood.name}
              onOptionPress={(val) => {
                const matched = MOOD_MAP[val];
                if (matched) {
                  setSelectedMood(matched);
                }
              }}
            />
          </View>

          {journalToEdit ? (
            <View className="flex-row gap-2 mt-2">
              <Button onPress={handleDelete} className="flex-1 bg-red-500" size="lg">
                <Text className="text-white font-bold text-lg">Xóa</Text>
              </Button>
              <Button onPress={handleSubmit} disabled={isSubmitting} className="flex-1" size="lg">
                <Text className="text-white font-bold text-lg">{isSubmitting ? "Đang lưu..." : "Lưu"}</Text>
              </Button>
            </View>
          ) : (
            <Button onPress={handleSubmit} disabled={isSubmitting} className="w-full mt-2" size="lg">
              <Text className="text-white font-bold text-lg">{isSubmitting ? "Đang lưu..." : "Tạo mới"}</Text>
            </Button>
          )}
        </View>
      </View>
    </Modal>
  );
}

