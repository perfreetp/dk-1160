import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, Button, Picker, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import ScheduleCard from '@/components/ScheduleCard';
import EmptyState from '@/components/EmptyState';
import { ScheduleItem, ScheduleStatus } from '@/types/schedule';
import { Proposal } from '@/types/proposal';
import { mockSchedule } from '@/data/schedule';
import { storage, STORAGE_KEYS } from '@/utils/index';
import styles from './index.module.scss';

const DAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
const URGENCY_OPTIONS = ['低', '中', '高'];
const STATUS_OPTIONS = ['撰写中', '审核中', '定稿中', '待发布'];

const SchedulePage: React.FC = () => {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);
  const [selectedProposalIndex, setSelectedProposalIndex] = useState(0);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [editFormData, setEditFormData] = useState({
    urgency: 'low',
    deadline: '',
    assignee: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const savedSchedule = await storage.get<ScheduleItem[]>(STORAGE_KEYS.SCHEDULE, mockSchedule);
    const savedProposals = await storage.get<Proposal[]>(STORAGE_KEYS.PROPOSALS, []);
    setSchedule(savedSchedule);
    setProposals(savedProposals);
    console.log('[SchedulePage] 数据加载完成:', savedSchedule.length, '条排期');
  };

  const saveData = async (data: ScheduleItem[]) => {
    await storage.set(STORAGE_KEYS.SCHEDULE, data);
    setSchedule(data);
  };

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

  const approvedProposals = useMemo(() => {
    return proposals.filter(p => p.status === 'approved');
  }, [proposals]);

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

  const handleGenerateSchedule = () => {
    if (approvedProposals.length === 0) {
      Taro.showToast({ title: '暂无已通过的选题', icon: 'none' });
      return;
    }
    setSelectedProposalIndex(0);
    setSelectedDayIndex(0);
    setShowGenerateModal(true);
    console.log('[SchedulePage] 准备生成排期');
  };

  const handleConfirmGenerate = async () => {
    const selectedProposal = approvedProposals[selectedProposalIndex];
    const selectedDay = selectedDayIndex + 1;
    
    const deadlineDate = new Date(currentWeek.start);
    deadlineDate.setDate(deadlineDate.getDate() + selectedDay - 1);
    const deadline = deadlineDate.toISOString().split('T')[0];

    const newScheduleItem: ScheduleItem = {
      id: Date.now().toString(),
      proposalId: selectedProposal.id,
      proposalTitle: selectedProposal.title,
      columnName: selectedProposal.columnName,
      author: selectedProposal.author,
      assignee: '',
      urgency: 'medium',
      deadline,
      status: 'drafting',
      weekNumber: currentWeek.number,
      dayOfWeek: selectedDay,
      createdAt: new Date().toISOString().split('T')[0]
    };

    const updatedProposals = proposals.map(p => 
      p.id === selectedProposal.id ? { ...p, status: 'scheduled' } : p
    );
    
    await storage.set(STORAGE_KEYS.PROPOSALS, updatedProposals);
    setProposals(updatedProposals);
    
    const updatedSchedule = [...schedule, newScheduleItem];
    await saveData(updatedSchedule);
    
    setShowGenerateModal(false);
    Taro.showToast({ title: '排期已生成', icon: 'success' });
    console.log('[SchedulePage] 生成排期:', newScheduleItem);
  };

  const handleEdit = (item: ScheduleItem) => {
    setEditingItem(item);
    setEditFormData({
      urgency: item.urgency,
      deadline: item.deadline,
      assignee: item.assignee
    });
    setShowEditModal(true);
    console.log('[SchedulePage] 编辑排期:', item.id);
  };

  const handleUrgencyChange = (e) => {
    const urgencyMap = ['low', 'medium', 'high'];
    setEditFormData({ ...editFormData, urgency: urgencyMap[e.detail.value] });
  };

  const handleConfirmEdit = async () => {
    if (!editingItem) return;

    const updatedSchedule = schedule.map(s => 
      s.id === editingItem.id 
        ? { 
            ...s, 
            urgency: editFormData.urgency,
            deadline: editFormData.deadline,
            assignee: editFormData.assignee
          }
        : s
    );

    await saveData(updatedSchedule);
    setShowEditModal(false);
    setEditingItem(null);
    Taro.showToast({ title: '修改成功', icon: 'success' });
    console.log('[SchedulePage] 修改排期:', editingItem.id, editFormData);
  };

  const handleRemind = (item: ScheduleItem) => {
    Taro.showModal({
      title: '催办提醒',
      content: `确定催办"${item.proposalTitle}"吗？将通知负责人${item.assignee || '未分配'}`,
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '催办已发送', icon: 'success' });
          console.log('[SchedulePage] 催办:', item.id, item.assignee);
        }
      }
    });
  };

  const handleCardClick = async (item: ScheduleItem) => {
    const statusFlow: ScheduleStatus[] = ['drafting', 'reviewing', 'finalizing', 'ready'];
    const currentIndex = statusFlow.indexOf(item.status);
    if (currentIndex < statusFlow.length - 1) {
      const nextStatus = statusFlow[currentIndex + 1];
      const updatedSchedule = schedule.map(s => 
        s.id === item.id ? { ...s, status: nextStatus } : s
      );
      await saveData(updatedSchedule);
      Taro.showToast({ title: `状态已更新`, icon: 'success' });
      console.log('[SchedulePage] 更新状态:', item.id, nextStatus);
    } else {
      handleEdit(item);
    }
  };

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <View className={styles.headerTop}>
          <Text className={styles.title}>排期看板</Text>
          <Button className={styles.generateButton} onClick={handleGenerateSchedule}>
            <Text className={styles.generateButtonText}>生成排期</Text>
          </Button>
        </View>
        <Text className={styles.weekInfo}>
          本周（第{currentWeek.number}周） {currentWeek.start} ~ {currentWeek.end}
        </Text>
      </View>

      <ScrollView className={styles.list} scrollY>
        {schedule.length === 0 ? (
          <EmptyState message="本周暂无排期，点击上方按钮生成" />
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

      {showGenerateModal && (
        <View className={styles.modalOverlay} onClick={() => setShowGenerateModal(false)}>
          <View className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <Text className={styles.modalTitle}>生成排期</Text>
            
            <View className={styles.formGroup}>
              <Text className={styles.label}>选择选题 *</Text>
              <Picker 
                mode='selector' 
                range={approvedProposals.map(p => `${p.columnName} - ${p.title}`)} 
                value={selectedProposalIndex}
                onChange={(e) => setSelectedProposalIndex(e.detail.value)}
              >
                <View className={styles.picker}>
                  <Text className={styles.pickerText}>
                    {approvedProposals[selectedProposalIndex] 
                      ? `${approvedProposals[selectedProposalIndex].columnName} - ${approvedProposals[selectedProposalIndex].title}`
                      : '请选择选题'
                    }
                  </Text>
                  <Text className={styles.pickerArrow}>▼</Text>
                </View>
              </Picker>
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.label}>发布日期 *</Text>
              <Picker 
                mode='selector' 
                range={DAYS} 
                value={selectedDayIndex}
                onChange={(e) => setSelectedDayIndex(e.detail.value)}
              >
                <View className={styles.picker}>
                  <Text className={styles.pickerText}>{DAYS[selectedDayIndex]}</Text>
                  <Text className={styles.pickerArrow}>▼</Text>
                </View>
              </Picker>
            </View>

            <View className={styles.modalButtons}>
              <Button className={styles.cancelButton} onClick={() => setShowGenerateModal(false)}>
                <Text className={styles.cancelButtonText}>取消</Text>
              </Button>
              <Button className={styles.submitButton} onClick={handleConfirmGenerate}>
                <Text className={styles.submitButtonText}>确认生成</Text>
              </Button>
            </View>
          </View>
        </View>
      )}

      {showEditModal && editingItem && (
        <View className={styles.modalOverlay} onClick={() => setShowEditModal(false)}>
          <View className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <Text className={styles.modalTitle}>编辑排期</Text>
            
            <View className={styles.formGroup}>
              <Text className={styles.label}>选题标题</Text>
              <Text className={styles.itemTitle}>{editingItem.proposalTitle}</Text>
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.label}>紧急程度</Text>
              <Picker 
                mode='selector' 
                range={URGENCY_OPTIONS} 
                value={['low', 'medium', 'high'].indexOf(editFormData.urgency)}
                onChange={handleUrgencyChange}
              >
                <View className={styles.picker}>
                  <Text className={styles.pickerText}>
                    {URGENCY_OPTIONS[['low', 'medium', 'high'].indexOf(editFormData.urgency)]}
                  </Text>
                  <Text className={styles.pickerArrow}>▼</Text>
                </View>
              </Picker>
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.label}>截稿日期</Text>
              <Input
                className={styles.input}
                value={editFormData.deadline}
                onInput={(e) => setEditFormData({ ...editFormData, deadline: e.detail.value })}
                placeholder="如：2024-03-20"
              />
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.label}>负责人</Text>
              <Input
                className={styles.input}
                value={editFormData.assignee}
                onInput={(e) => setEditFormData({ ...editFormData, assignee: e.detail.value })}
                placeholder="请输入负责人姓名"
              />
            </View>

            <View className={styles.modalButtons}>
              <Button className={styles.cancelButton} onClick={() => setShowEditModal(false)}>
                <Text className={styles.cancelButtonText}>取消</Text>
              </Button>
              <Button className={styles.submitButton} onClick={handleConfirmEdit}>
                <Text className={styles.submitButtonText}>保存</Text>
              </Button>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default SchedulePage;