import React from 'react';
import { ScrollView, ScrollViewProps } from 'react-native';
import AppRefreshControl from '@/components/AppRefreshControl';

type Props = ScrollViewProps & {
  onRefresh?: () => void | Promise<void>;
};

export default function PullToRefreshScrollView({ onRefresh, ...props }: Props) {
  return (
    <ScrollView
      {...props}
      alwaysBounceVertical
      refreshControl={<AppRefreshControl onRefresh={onRefresh} />}
    />
  );
}
