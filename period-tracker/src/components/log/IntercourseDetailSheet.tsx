import React, { useMemo } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { useLogStore } from '../../stores';
import { formatDate } from '../../utils/dates';
import { pickPhoto, takePhoto, deletePhoto } from '../../utils/photos';
import { useTheme } from '../../theme';
import type { ThemeColors } from '../../theme';
import type { IntercourseEntry } from '../../models';
import { s, fs } from '@/src/utils/scale';

interface IntercourseDetailSheetProps {
  visible: boolean;
  date: string;
  onClose: () => void;
}

function EntryEditor({
  entry,
  date,
  colors,
  styles,
}: {
  entry: IntercourseEntry;
  date: string;
  colors: ThemeColors;
  styles: ReturnType<typeof createStyles>;
}) {
  const updateEntry = useLogStore((s) => s.updateIntercourseEntry);
  const removeEntry = useLogStore((s) => s.removeIntercourseEntry);

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
    <View style={styles.entryCard}>
      {/* Header row with time + delete */}
      <View style={styles.entryHeaderRow}>
        <View style={styles.entryHeaderLeft}>
          <Ionicons name="heart" size={s(16)} color={colors.primary} />
          <Text style={styles.entryTime}>{time}</Text>
        </View>
        <TouchableOpacity onPress={handleDelete} hitSlop={8}>
          <Ionicons name="trash-outline" size={s(16)} color={colors.destructive} />
        </TouchableOpacity>
      </View>

      {/* Protection toggle */}
      <View style={styles.protectionRow}>
        <TouchableOpacity
          style={[
            styles.protectionButton,
            entry.protected === true && styles.protectionActive,
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
            size={s(14)}
            color={entry.protected === true ? colors.success : colors.textMuted}
          />
          <Text
            style={[
              styles.protectionText,
              entry.protected === true && styles.protectionTextActive,
            ]}
          >
            Protected
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.protectionButton,
            entry.protected === false && styles.protectionUnprotected,
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
            size={s(14)}
            color={entry.protected === false ? colors.destructive : colors.textMuted}
          />
          <Text
            style={[
              styles.protectionText,
              entry.protected === false && styles.protectionTextUnprotected,
            ]}
          >
            Unprotected
          </Text>
        </TouchableOpacity>
      </View>

      {/* Notes */}
      <TextInput
        style={styles.notesInput}
        placeholder="Add notes..."
        placeholderTextColor={colors.textMuted}
        multiline
        value={entry.notes ?? ''}
        onChangeText={(text) =>
          updateEntry(date, entry.id, { notes: text || undefined })
        }
      />

      {/* Photos */}
      {((entry.photos && entry.photos.length > 0) || true) && (
        <View style={styles.photoRow}>
          {(entry.photos ?? []).map((uri, i) => (
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
            <Ionicons name="camera-outline" size={s(20)} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

export function IntercourseDetailSheet({ visible, date, onClose }: IntercourseDetailSheetProps) {
  const { colors } = useTheme();
  const entries = useLogStore((s) => s.logs[date]?.intercourse);
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <View style={styles.sheet}>
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerDate}>{formatDate(date, 'EEEE, MMM d')}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={s(18)} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {entries && entries.length > 0 ? (
            entries.map((entry) => (
              <EntryEditor
                key={entry.id}
                entry={entry}
                date={date}
                colors={colors}
                styles={styles}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No entries for this day</Text>
            </View>
          )}
        </ScrollView>
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
      maxHeight: '80%',
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
    headerDate: {
      fontSize: fs(18),
      fontWeight: '600',
      color: colors.text,
    },
    closeButton: {
      padding: s(8),
      minWidth: s(36),
      minHeight: s(36),
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: s(18),
      backgroundColor: colors.surfaceTertiary,
    },
    content: {
      paddingHorizontal: s(20),
      paddingTop: s(12),
    },
    entryCard: {
      backgroundColor: colors.surface,
      borderRadius: s(14),
      padding: s(14),
      marginBottom: s(12),
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    entryHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: s(10),
    },
    entryHeaderLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(6),
    },
    entryTime: {
      fontSize: fs(13),
      fontWeight: '600',
      color: colors.text,
    },
    protectionRow: {
      flexDirection: 'row',
      gap: s(8),
      marginBottom: s(10),
    },
    protectionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: s(5),
      paddingVertical: s(8),
      borderRadius: s(10),
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
      fontSize: fs(12),
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
      padding: s(10),
      borderRadius: s(8),
      minHeight: s(40),
      fontSize: fs(13),
      color: colors.text,
      textAlignVertical: 'top',
      marginBottom: s(8),
    },
    photoRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: s(6),
    },
    photoContainer: {
      position: 'relative',
    },
    photoThumb: {
      width: s(48),
      height: s(48),
      borderRadius: s(8),
      backgroundColor: colors.surfaceTertiary,
    },
    photoRemove: {
      position: 'absolute',
      top: s(-5),
      right: s(-5),
      backgroundColor: colors.surface,
      borderRadius: s(9),
    },
    photoAdd: {
      width: s(48),
      height: s(48),
      borderRadius: s(8),
      backgroundColor: colors.surfaceTertiary,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderStyle: 'dashed',
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyState: {
      paddingVertical: s(32),
      alignItems: 'center',
    },
    emptyText: {
      fontSize: fs(15),
      color: colors.textMuted,
      fontStyle: 'italic',
    },
  });
