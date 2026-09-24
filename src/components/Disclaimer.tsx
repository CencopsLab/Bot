import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getTheme } from '@/theme/colors';
import { typography } from '@/theme/typography';

export default function Disclaimer({ text }: { text: string }) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const theme = getTheme(scheme);

  return (
    <View style={[styles.wrap, { borderColor: theme.accent, backgroundColor: theme.accent + '14' }]}> 
      <Ionicons name="information-circle-outline" size={18} color={theme.accent} />
      <Text style={[typography.caption, { color: theme.text, flex: 1, marginLeft: 8 }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
});
