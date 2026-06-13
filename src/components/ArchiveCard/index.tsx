import React from 'react';
import { View, Text, Button } from '@tarojs/components';
import { ArchiveItem } from '@/types/archive';
import styles from './index.module.scss';

interface ArchiveCardProps {
  item: ArchiveItem;
  onEdit?: () => void;
  onClick?: () => void;
}

const ArchiveCard: React.FC<ArchiveCardProps> = ({ item, onEdit, onClick }) => {
  const formatNumber = (num: number) => {
    if (num >= 10000) {
      return `${(num / 10000).toFixed(1)}万`;
    }
    return num.toString();
  };

  return (
    <View className={styles.card} onClick={onClick}>
      <View className={styles.header}>
        <View className={styles.columnTag}>
          <Text className={styles.columnText}>{item.columnName}</Text>
        </View>
        <Text className={styles.date}>{item.publishDate}</Text>
      </View>

      <Text className={styles.title}>{item.title}</Text>
      <Text className={styles.author}>作者：{item.author}</Text>

      <View className={styles.stats}>
        <View className={styles.statItem}>
          <Text className={styles.statIcon}>👁</Text>
          <Text className={styles.statValue}>{formatNumber(item.readCount)}</Text>
          <Text className={styles.statLabel}>阅读</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statIcon}>📤</Text>
          <Text className={styles.statValue}>{formatNumber(item.shareCount)}</Text>
          <Text className={styles.statLabel}>转发</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statIcon}>💡</Text>
          <Text className={styles.statValue}>{formatNumber(item.leadCount)}</Text>
          <Text className={styles.statLabel}>线索</Text>
        </View>
      </View>

      <View className={styles.footer}>
        <View className={styles.tags}>
          {item.tags.slice(0, 3).map(tag => (
            <View key={tag} className={styles.tag}>
              <Text className={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
        <Button className={styles.editButton} onClick={onEdit}>
          <Text className={styles.editButtonText}>编辑数据</Text>
        </Button>
      </View>
    </View>
  );
};

export default ArchiveCard;