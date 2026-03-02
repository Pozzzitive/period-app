import React, { useMemo, useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLogStore } from '../../stores';
import { formatDate } from '../../utils/dates';
import { pickPhoto, takePhoto, deletePhoto } from '../../utils/photos';
import { useTheme } from '../../theme';
import type { ThemeColors } from '../../theme';
import { s, fs } from '@/src/utils/scale';

interface IntercourseAddSheetProps {
  visible: boolean;
  date: string;
  onClose: () => void;
}

export function IntercourseAddSheet({ visible, date, onClose }: IntercourseAddSheetProps) {
  const { colors } = useTheme();
  const addEntry = useLogStore((s) => s.addIntercourseEntry);
  const styles = useMemo(() => createStyles(colors), [colors]);

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
      <TouchableWithoutFeedback onPress={handleCancel}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <View style={styles.sheet}>
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Entry</Text>
          <TouchableOpacity onPress={handleDone}>
            <Text style={styles.doneText}>Done</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Date */}
          <Text style={styles.dateLabel}>{formatDate(date, 'EEEE, MMM d')}</Text>

          {/* Protection */}
          <Text style={styles.fieldLabel}>Protection</Text>
          <View style={styles.protectionRow}>
            <TouchableOpacity
              style={[
                styles.protectionButton,
                isProtected === true && styles.protectionActive,
              ]}
              onPress={() => setIsProtected(isProtected === true ? undefined : true)}
              activeOpacity={0.7}
            >
              <Ionicons
                name="shield-checkmark"
                size={s(16)}
                color={isProtected === true ? colors.success : colors.textMuted}
              />
              <Text
                style={[
                  styles.protectionText,
                  isProtected === true && styles.protectionTextActive,
                ]}
              >
                Protected
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.protectionButton,
                isProtected === false && styles.protectionUnprotected,
              ]}
              onPress={() => setIsProtected(isProtected === false ? undefined : false)}
              activeOpacity={0.7}
            >
              <Ionicons
                name="shield-outline"
                size={s(16)}
                color={isProtected === false ? colors.destructive : colors.textMuted}
              />
              <Text
                style={[
                  styles.protectionText,
                  isProtected === false && styles.protectionTextUnprotected,
                ]}
              >
                Unprotected
              </Text>
            </TouchableOpacity>
          </View>

          {/* Notes */}
          <Text style={styles.fieldLabel}>Notes</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Add notes..."
            placeholderTextColor={colors.textMuted}
            multiline
            value={notes}
            onChangeText={setNotes}
          />

          {/* Photos */}
          <Text style={styles.fieldLabel}>Photos</Text>
          <View style={styles.photoRow}>
            {photos.map((uri, i) => (
              <View key={i} style={styles.photoContainer}>
                <Image source={{ uri }} style={styles.photoThumb} />
                <TouchableOpacity
                  style={styles.photoRemove}
                  onPress={() => handleRemovePhoto(uri)}
                >
                  <Ionicons name="close-circle" size={s(18)} color={colors.destructive} />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={styles.photoAdd} onPress={handleAddPhoto}>
              <Ionicons name="camera-outline" size={s(22)} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: colors.backdrop,
    },
    sheet: {
      backgroundColor: colors.sheetBackground,
      borderTopLeftRadius: s(24),
      borderTopRightRadius: s(24),
      paddingBottom: s(34),
    },
    handle: {
      width: s(36),
      height: s(4),
      borderRadius: 2,
      backgroundColor: colors.handleColor,
      alignSelf: 'center',
      marginTop: s(10),
      marginBottom: s(2),
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: s(20),
      paddingTop: s(8),
      paddingBottom: s(12),
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.borderSubtle,
    },
    cancelText: {
      fontSize: fs(16),
      color: colors.textSecondary,
    },
    headerTitle: {
      fontSize: fs(17),
      fontWeight: '600',
      color: colors.text,
    },
    doneText: {
      fontSize: fs(16),
      fontWeight: '700',
      color: colors.primary,
    },
    content: {
      paddingHorizontal: s(20),
      paddingTop: s(16),
    },
    dateLabel: {
      fontSize: fs(14),
      color: colors.textTertiary,
      marginBottom: s(16),
    },
    fieldLabel: {
      fontSize: fs(12),
      fontWeight: '700',
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: fs(0.5),
      marginBottom: s(8),
    },
    protectionRow: {
      flexDirection: 'row',
      gap: s(10),
      marginBottom: s(20),
    },
    protectionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: s(6),
      paddingVertical: s(12),
      borderRadius: s(12),
      backgroundColor: colors.surfaceTertiary,
      borderWidth: 1.5,
      borderColor: 'transparent',
    },
    protectionActive: {
      backgroundColor: colors.successLight,
      borderColor: colors.success,
    },
    protectionUnprotected: {
      backgroundColor: colors.destructiveLight,
      borderColor: colors.destructive,
    },
    protectionText: {
      fontSize: fs(14),
      fontWeight: '600',
      color: colors.textSecondary,
    },
    protectionTextActive: {
      color: colors.success,
    },
    protectionTextUnprotected: {
      color: colors.destructive,
    },
    notesInput: {
      backgroundColor: colors.surfaceTertiary,
      padding: s(12),
      borderRadius: s(10),
      minHeight: s(80),
      fontSize: fs(14),
      color: colors.text,
      textAlignVertical: 'top',
      marginBottom: s(20),
    },
    photoRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: s(8),
    },
    photoContainer: {
      position: 'relative',
    },
    photoThumb: {
      width: s(64),
      height: s(64),
      borderRadius: s(10),
      backgroundColor: colors.surfaceTertiary,
    },
    photoRemove: {
      position: 'absolute',
      top: s(-6),
      right: s(-6),
      backgroundColor: colors.surface,
      borderRadius: s(10),
    },
    photoAdd: {
      width: s(64),
      height: s(64),
      borderRadius: s(10),
      backgroundColor: colors.surfaceTertiary,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderStyle: 'dashed',
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
