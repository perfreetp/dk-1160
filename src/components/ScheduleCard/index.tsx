import React from 'react';
import { View, Text, Button } from '@tarojs/components';
import { ScheduleItem } from '@/types/schedule';
import StatusTag from '@/components/StatusTag';
import styles from './index.module.scss';

interface ScheduleCardProps {
  item: ScheduleItem;
  onRemind?: () => void;
  onClick?: () => void;
}

const ScheduleCard: React.FC<ScheduleCardProps> = ({ item, onRemind, onClick }) => {
  return (
    <View className={styles.card} onClick={onClick}>
      <View className={styles.header}>
        <View className={styles.columnTag}>
          <Text className={styles.columnText}>{item.columnName}</Text>
        </View>
        <StatusTag status={item.status} />
      </View>

      <Text className={styles.title}>{item.proposalTitle}</Text>

      <View className={styles.meta}>
        <View className={styles.metaItem}>
          <Text className={styles.metaLabel}>作者：</Text>
          <Text className={styles.metaValue}>{item.author}</Text>
        </View>
        <View className={styles.metaItem}>
          <Text className={styles.metaLabel}>负责人：</Text>
          <Text className={styles.metaValue}>{item.assignee || '未分配'}</Text>
        </View>
      </View>

      <View className={styles.footer}>
        <View className={styles.dateInfo}>
          <Text className={styles.deadline}>截稿：{item.deadline}</Text>
          {item.urgency === 'high' && (
            <View className={styles.urgentTag}>
              <Text className={styles.urgentText}>紧急</Text>
            </View>
          )}
        </View>
        {item.status !== 'ready' && (
          <Button className={styles.remindButton} onClick={onRemind}>
            <Text className={styles.remindButtonText}>催办</Text>
          </Button>
        )}
      </View>
    </View>
  );
};

export default ScheduleCard;