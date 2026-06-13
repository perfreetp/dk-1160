import React from 'react';
import { View, Text } from '@tarojs/components';
import { Column } from '@/types/column';
import styles from './index.module.scss';

interface ColumnCardProps {
  column: Column;
  onClick?: () => void;
  onLongPress?: () => void;
}

const ColumnCard: React.FC<ColumnCardProps> = ({ column, onClick, onLongPress }) => {
  return (
    <View 
      className={styles.card} 
      onClick={onClick}
      onLongPress={onLongPress}
    >
      <View className={styles.header}>
        <Text className={styles.name}>{column.name}</Text>
        <View className={styles.countBadge}>
          <Text className={styles.countText}>{column.proposalCount} 个选题</Text>
        </View>
      </View>
      <Text className={styles.description}>{column.description}</Text>
      <View className={styles.footer}>
        <View className={styles.ownerTag}>
          <Text className={styles.ownerText}>负责人：{column.owner}</Text>
        </View>
      </View>
    </View>
  );
};

export default ColumnCard;