import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLogStore } from '../../stores';
import { formatDate } from '../../utils/dates';
import { pickPhoto, takePhoto, deletePhoto } from '../../utils/photos';
import { useTheme } from '../../theme';
import type { IntercourseEntry } from '../../models';

interface IntercourseDetailSheetProps {
  visible: boolean;
  date: string;
  onClose: () => void;
  onAdd?: () => void;
}

function EntryEditor({ entry, date }: { entry: IntercourseEntry; date: string }) {
  const { colors } = useTheme();
  const updateEntry = useLogStore((s) => s.updateIntercourseEntry);
  const removeEntry = useLogStore((s) => s.removeIntercourseEntry);
  const [localNotes, setLocalNotes] = React.useState(entry.notes ?? '');

  const handleDelete = () => {
    Alert.alert('Delete entry', 'Remove this entry?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          entry.photos?.forEach(deletePhoto);
          removeEntry(date, entry.id);
        },
      },
    ]);
  };

  const handleAddPhoto = () => {
    Alert.alert('Add photo', undefined, [
      {
        text: 'Camera',
        onPress: async () => {
          const uri = await takePhoto();
          if (uri) {
            updateEntry(date, entry.id, {
              photos: [...(entry.photos ?? []), uri],
            });
          }
        },
      },
      {
        text: 'Photo Library',
        onPress: async () => {
          const uri = await pickPhoto();
          if (uri) {
            updateEntry(date, entry.id, {
              photos: [...(entry.photos ?? []), uri],
            });
          }
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleRemovePhoto = (uri: string) => {
    deletePhoto(uri);
    updateEntry(date, entry.id, {
      photos: (entry.photos ?? []).filter((p) => p !== uri),
    });
  };

  const time = new Date(entry.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View
      className="rounded-[14px] p-3.5 mb-3"
      style={{ backgroundColor: colors.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border }}
    >
      {/* Header row with time + delete */}
      <View className="flex-row justify-between items-center mb-2.5">
        <View className="flex-row items-center gap-1.5">
          <Ionicons name="heart" size={16} color={colors.primary} />
          <Text className="text-[13px] font-semibold" style={{ color: colors.text }}>{time}</Text>
        </View>
        <TouchableOpacity onPress={handleDelete} hitSlop={8}>
          <Ionicons name="trash-outline" size={16} color={colors.destructive} />
        </TouchableOpacity>
      </View>

      {/* Protection toggle */}
      <View className="flex-row gap-2 mb-2.5">
        <TouchableOpacity
          className="flex-1 flex-row items-center justify-center gap-[5px] py-2 rounded-[10px] border-[1.5px] border-transparent"
          style={[
            { backgroundColor: colors.surfaceTertiary },
            entry.protected === true
              ? { backgroundColor: colors.successLight, borderColor: colors.success }
              : undefined,
          ]}
          onPress={() =>
            updateEntry(date, entry.id, {
              protected: entry.protected === true ? undefined : true,
            })
          }
          activeOpacity={0.7}
        >
          <Ionicons
            name="shield-checkmark"
            size={14}
            color={entry.protected === true ? colors.success : colors.textMuted}
          />
          <Text
            className="text-[12px] font-semibold"
            style={{ color: entry.protected === true ? colors.success : colors.textSecondary }}
          >
            Protected
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 flex-row items-center justify-center gap-[5px] py-2 rounded-[10px] border-[1.5px] border-transparent"
          style={[
            { backgroundColor: colors.surfaceTertiary },
            entry.protected === false
              ? { backgroundColor: colors.destructiveLight, borderColor: colors.destructive }
              : undefined,
          ]}
          onPress={() =>
            updateEntry(date, entry.id, {
              protected: entry.protected === false ? undefined : false,
            })
          }
          activeOpacity={0.7}
        >
          <Ionicons
            name="shield-outline"
            size={14}
            color={entry.protected === false ? colors.destructive : colors.textMuted}
          />
          <Text
            className="text-[12px] font-semibold"
            style={{ color: entry.protected === false ? colors.destructive : colors.textSecondary }}
          >
            Unprotected
          </Text>
        </TouchableOpacity>
      </View>

      {/* Notes */}
      <TextInput
        style={{
          backgroundColor: colors.surfaceTertiary,
          padding: 10,
          borderRadius: 8,
          minHeight: 40,
          fontSize: 13,
          color: colors.text,
          marginBottom: 8,
          textAlignVertical: 'top',
        }}
        placeholder="Add notes..."
        placeholderTextColor={colors.textMuted}
        multiline
        value={localNotes}
        onChangeText={setLocalNotes}
        onBlur={() => updateEntry(date, entry.id, { notes: localNotes || undefined })}
      />

      {/* Photos */}
      <View className="flex-row flex-wrap gap-1.5">
        {(entry.photos ?? []).map((uri, i) => (
          <View key={i} className="relative">
            <Image source={{ uri }} className="w-12 h-12 rounded-lg" style={{ backgroundColor: colors.surfaceTertiary }} />
            <TouchableOpacity
              className="absolute -top-[5px] -right-[5px] rounded-[9px]"
              style={{ backgroundColor: colors.surface }}
              onPress={() => handleRemovePhoto(uri)}
            >
              <Ionicons name="close-circle" size={18} color={colors.destructive} />
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity
          className="w-12 h-12 rounded-lg border-[1.5px] border-dashed justify-center items-center"
          style={{ backgroundColor: colors.surfaceTertiary, borderColor: colors.border }}
          onPress={handleAddPhoto}
        >
          <Ionicons name="camera-outline" size={20} color={colors.textMuted} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export function IntercourseDetailSheet({ visible, date, onClose, onAdd }: IntercourseDetailSheetProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const entries = useLogStore((s) => s.logs[date]?.intercourse);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1" style={{ backgroundColor: colors.backdrop }} />
      </TouchableWithoutFeedback>

      <View
        className="rounded-t-3xl"
        style={{ backgroundColor: colors.sheetBackground, maxHeight: '80%', paddingBottom: Math.max(insets.bottom, 10) + 14 }}
      >
        <View
          className="w-9 h-1 rounded-sm self-center mt-2.5 mb-0.5"
          style={{ backgroundColor: colors.handleColor }}
        />

        {/* Header */}
        <View
          className="flex-row justify-between items-center px-5 pt-2 pb-3"
          style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.borderSubtle }}
        >
          <Text className="text-lg font-semibold" style={{ color: colors.text }}>
            {formatDate(date, 'EEEE, MMM d')}
          </Text>
          <TouchableOpacity onPress={onClose} className="p-2 min-w-[36px] min-h-[36px] items-center justify-center rounded-[18px]" style={{ backgroundColor: colors.surfaceTertiary }}>
            <Ionicons name="close" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        <ScrollView
          className="px-5 pt-3"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {entries && entries.length > 0 ? (
            entries.map((entry) => (
              <EntryEditor
                key={entry.id}
                entry={entry}
                date={date}
              />
            ))
          ) : (
            <View className="py-8 items-center">
              <Text className="text-[15px] italic" style={{ color: colors.textMuted }}>
                No entries for this day
              </Text>
            </View>
          )}

          {onAdd && (
            <TouchableOpacity
              className="flex-row items-center justify-center gap-1.5 py-3 rounded-xl mb-4"
              style={{ backgroundColor: colors.primaryMuted, borderWidth: 1, borderColor: colors.primaryLight }}
              onPress={onAdd}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={18} color={colors.primary} />
              <Text className="text-sm font-bold" style={{ color: colors.primary }}>Add entry</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}
