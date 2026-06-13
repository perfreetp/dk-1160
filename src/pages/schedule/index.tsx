import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import ScheduleCard from '@/components/ScheduleCard';
import EmptyState from '@/components/EmptyState';
import { ScheduleItem } from '@/types/schedule';
import { mockSchedule } from '@/data/schedule';
import styles from './index.module.scss';

const DAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

const SchedulePage: React.FC = () => {
  const [schedule, setSchedule] = useState<ScheduleItem[]>(mockSchedule);

  const currentWeek = useMemo(() => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() + 1);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    return {
      start: weekStart.toISOString().split('T')[0],
      end: weekEnd.toISOString().split('T')[0],
      number: Math.ceil((weekStart.getDate() + 6) / 7)
    };
  }, []);

  const groupedSchedule = useMemo(() => {
    const groups: { [key: number]: ScheduleItem[] } = {};
    schedule.forEach(item => {
      if (!groups[item.dayOfWeek]) {
        groups[item.dayOfWeek] = [];
      }
      groups[item.dayOfWeek].push(item);
    });
    return groups;
  }, [schedule]);

  const handleRemind = (item: ScheduleItem) => {
    Taro.showModal({
      title: '催办提醒',
      content: `确定催办"${item.proposalTitle}"吗？将通知负责人${item.assignee}`,
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '催办已发送', icon: 'success' });
          console.log('[SchedulePage] 催办:', item.id, item.assignee);
        }
      }
    });
  };

  const handleCardClick = (item: ScheduleItem) => {
    const statusFlow = ['drafting', 'reviewing', 'finalizing', 'ready'];
    const currentIndex = statusFlow.indexOf(item.status);
    if (currentIndex < statusFlow.length - 1) {
      const nextStatus = statusFlow[currentIndex + 1];
      setSchedule(schedule.map(s => 
        s.id === item.id ? { ...s, status: nextStatus as any } : s
      ));
      Taro.showToast({ title: `状态已更新为${nextStatus}`, icon: 'success' });
      console.log('[SchedulePage] 更新状态:', item.id, nextStatus);
    }
  };

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.title}>排期看板</Text>
        <Text className={styles.weekInfo}>
          本周（第{currentWeek.number}周） {currentWeek.start} ~ {currentWeek.end}
        </Text>
      </View>

      <ScrollView className={styles.list} scrollY>
        {schedule.length === 0 ? (
          <EmptyState message="本周暂无排期" />
        ) : (
          DAYS.map((day, index) => {
            const daySchedule = groupedSchedule[index + 1] || [];
            if (daySchedule.length === 0) return null;
            
            return (
              <View key={day} className={styles.dateGroup}>
                <View className={styles.dateHeader}>
                  <Text className={styles.dateText}>{day}</Text>
                </View>
                {daySchedule.map(item => (
                  <ScheduleCard
                    key={item.id}
                    item={item}
                    onRemind={() => handleRemind(item)}
                    onClick={() => handleCardClick(item)}
                  />
                ))}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

export default SchedulePage;