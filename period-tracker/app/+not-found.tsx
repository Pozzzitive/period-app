import React, { useMemo } from 'react';
import { Link, Stack } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/src/theme';
import type { ThemeColors } from '@/src/theme';
import { s, fs } from '@/src/utils/scale';

export default function NotFoundScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.container}>
        <Text style={styles.title}>This screen doesn't exist.</Text>

        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Go to home screen!</Text>
        </Link>
      </View>
    </>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: s(20),
      backgroundColor: colors.background,
    },
    title: {
      fontSize: fs(20),
      fontWeight: 'bold',
      color: colors.text,
    },
    link: {
      marginTop: s(15),
      paddingVertical: s(15),
    },
    linkText: {
      fontSize: fs(14),
      color: colors.primary,
    },
  });
