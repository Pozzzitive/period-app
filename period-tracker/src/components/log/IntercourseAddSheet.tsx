import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  TextInput,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLogStore } from '../../stores';
import { formatDate } from '../../utils/dates';
import { pickPhoto, takePhoto, deletePhoto } from '../../utils/photos';
import { useTheme } from '../../theme';

interface IntercourseAddSheetProps {
  visible: boolean;
  date: string;
  onClose: () => void;
}

export function IntercourseAddSheet({ visible, date, onClose }: IntercourseAddSheetProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const addEntry = useLogStore((s) => s.addIntercourseEntry);

  const [isProtected, setIsProtected] = useState<boolean | undefined>(undefined);
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);

  const reset = () => {
    setIsProtected(undefined);
    setNotes('');
    setPhotos([]);
  };

  const handleDone = () => {
    addEntry(date, {
      protected: isProtected,
      notes: notes.trim() || undefined,
      photos: photos.length > 0 ? photos : undefined,
    });
    reset();
    onClose();
  };

  const handleCancel = () => {
    // Clean up any photos that were copied to app storage
    if (photos.length > 0) {
      for (const uri of photos) {
        deletePhoto(uri);
      }
    }
    reset();
    onClose();
  };

  const handleAddPhoto = () => {
    Alert.alert('Add photo', undefined, [
      {
        text: 'Camera',
        onPress: async () => {
          const uri = await takePhoto();
          if (uri) setPhotos((prev) => [...prev, uri]);
        },
      },
      {
        text: 'Photo Library',
        onPress: async () => {
          const uri = await pickPhoto();
          if (uri) setPhotos((prev) => [...prev, uri]);
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleRemovePhoto = (uri: string) => {
    deletePhoto(uri);
    setPhotos((prev) => prev.filter((p) => p !== uri));
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleCancel}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={handleCancel}>
        <View className="flex-1" style={{ backgroundColor: colors.backdrop }} />
      </TouchableWithoutFeedback>

      <View className="rounded-t-3xl" style={{ backgroundColor: colors.sheetBackground, paddingBottom: Math.max(insets.bottom, 10) + 14 }}>
        <View
          className="w-9 h-1 rounded-sm self-center mt-2.5 mb-0.5"
          style={{ backgroundColor: colors.handleColor }}
        />

        {/* Header */}
        <View
          className="flex-row justify-between items-center px-5 pt-2 pb-3"
          style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.borderSubtle }}
        >
          <TouchableOpacity onPress={handleCancel}>
            <Text className="text-base" style={{ color: colors.textSecondary }}>Cancel</Text>
          </TouchableOpacity>
          <Text className="text-[17px] font-semibold" style={{ color: colors.text }}>New Entry</Text>
          <TouchableOpacity onPress={handleDone}>
            <Text className="text-base font-bold" style={{ color: colors.primary }}>Done</Text>
          </TouchableOpacity>
        </View>

        <View className="px-5 pt-4">
          {/* Date */}
          <Text className="text-sm mb-4" style={{ color: colors.textTertiary }}>{formatDate(date, 'EEEE, MMM d')}</Text>

          {/* Protection */}
          <Text className="text-[12px] font-bold uppercase tracking-wider mb-2" style={{ color: colors.textMuted }}>Protection</Text>
          <View className="flex-row gap-2.5 mb-5">
            <TouchableOpacity
              className="flex-1 flex-row items-center justify-center gap-1.5 py-3 rounded-xl border-[1.5px] border-transparent"
              style={[
                { backgroundColor: colors.surfaceTertiary },
                isProtected === true ? { backgroundColor: colors.successLight, borderColor: colors.success } : undefined,
              ]}
              onPress={() => setIsProtected(isProtected === true ? undefined : true)}
              activeOpacity={0.7}
            >
              <Ionicons
                name="shield-checkmark"
                size={16}
                color={isProtected === true ? colors.success : colors.textMuted}
              />
              <Text
                className="text-sm font-semibold"
                style={{ color: isProtected === true ? colors.success : colors.textSecondary }}
              >
                Protected
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 flex-row items-center justify-center gap-1.5 py-3 rounded-xl border-[1.5px] border-transparent"
              style={[
                { backgroundColor: colors.surfaceTertiary },
                isProtected === false ? { backgroundColor: colors.destructiveLight, borderColor: colors.destructive } : undefined,
              ]}
              onPress={() => setIsProtected(isProtected === false ? undefined : false)}
              activeOpacity={0.7}
            >
              <Ionicons
                name="shield-outline"
                size={16}
                color={isProtected === false ? colors.destructive : colors.textMuted}
              />
              <Text
                className="text-sm font-semibold"
                style={{ color: isProtected === false ? colors.destructive : colors.textSecondary }}
              >
                Unprotected
              </Text>
            </TouchableOpacity>
          </View>

          {/* Notes */}
          <Text className="text-[12px] font-bold uppercase tracking-wider mb-2" style={{ color: colors.textMuted }}>Notes</Text>
          <TextInput
            style={{
              backgroundColor: colors.surfaceTertiary,
              padding: 12,
              borderRadius: 10,
              minHeight: 80,
              fontSize: 14,
              color: colors.text,
              marginBottom: 20,
              textAlignVertical: 'top',
            }}
            placeholder="Add notes..."
            placeholderTextColor={colors.textMuted}
            multiline
            value={notes}
            onChangeText={setNotes}
          />

          {/* Photos */}
          <Text className="text-[12px] font-bold uppercase tracking-wider mb-2" style={{ color: colors.textMuted }}>Photos</Text>
          <View className="flex-row flex-wrap gap-2">
            {photos.map((uri, i) => (
              <View key={i} className="relative">
                <Image source={{ uri }} className="w-16 h-16 rounded-[10px]" style={{ backgroundColor: colors.surfaceTertiary }} />
                <TouchableOpacity
                  className="absolute -top-1.5 -right-1.5 rounded-[10px]"
                  style={{ backgroundColor: colors.surface }}
                  onPress={() => handleRemovePhoto(uri)}
                >
                  <Ionicons name="close-circle" size={18} color={colors.destructive} />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity
              className="w-16 h-16 rounded-[10px] border-[1.5px] border-dashed justify-center items-center"
              style={{ backgroundColor: colors.surfaceTertiary, borderColor: colors.border }}
              onPress={handleAddPhoto}
            >
              <Ionicons name="camera-outline" size={22} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
