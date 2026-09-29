import React, { useRef, useState } from 'react';
import { RefreshControl, RefreshControlProps, useColorScheme } from 'react-native';
import { apiClient } from '@/api/client';
import { getTheme } from '@/theme/colors';

type Props = Omit<RefreshControlProps, 'refreshing' | 'onRefresh'> & {
  onRefresh?: () => void | Promise<void>;
};

export default function AppRefreshControl({ onRefresh, ...props }: Props) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const theme = getTheme(scheme);
  const refreshingRef = useRef(false);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = async () => {
    if (refreshingRef.current) return;
    refreshingRef.current = true;
    setRefreshing(true);
    try {
      if (onRefresh) {
        await onRefresh();
      } else {
        await apiClient.get('/health', { timeout: 15000 });
      }
    } catch {
      // Keep pull-to-refresh available when the backend is offline.
    } finally {
      refreshingRef.current = false;
      setRefreshing(false);
    }
  };

  return (
    <RefreshControl
      {...props}
      refreshing={refreshing}
      onRefresh={refresh}
      tintColor={theme.primary}
      colors={[theme.primary]}
      progressBackgroundColor={theme.surface}
    />
  );
}