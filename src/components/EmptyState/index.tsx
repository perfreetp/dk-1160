import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

interface EmptyStateProps {
  message?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ message = '暂无数据' }) => {
  return (
    <View className={styles.container}>
      <View className={styles.icon}>📭</View>
      <Text className={styles.message}>{message}</Text>
    </View>
  );
};

export default EmptyState;