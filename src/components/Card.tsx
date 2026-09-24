import React from 'react';
import { Pressable, View, Text, StyleSheet, useColorScheme, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getTheme } from '@/theme/colors';
import { typography } from '@/theme/typography';

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  onPress: () => void;
  style?: ViewStyle;
  accessibilityLabel?: string;
};

export default function Card({ icon, title, description, onPress, style, accessibilityLabel }: Props) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const theme = getTheme(scheme);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
          opacity: pressed ? 0.86 : 1,
          shadowColor: theme.primaryDark,
        },
        style,
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: theme.primary + '14', borderColor: theme.primary + '2B' }]}>
        <Ionicons name={icon} size={22} color={theme.primary} />
      </View>
      <Text style={[typography.bodyBold, { color: theme.text, marginTop: 10 }]}>{title}</Text>
      <Text style={[typography.caption, { color: theme.textMuted, marginTop: 2 }]}>{description}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexBasis: '48%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 15,
    marginBottom: 12,
    minHeight: 142,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
