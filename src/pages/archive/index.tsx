import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Input, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import ArchiveCard from '@/components/ArchiveCard';
import EmptyState from '@/components/EmptyState';
import { ArchiveItem } from '@/types/archive';
import { mockArchive } from '@/data/archive';
import styles from './index.module.scss';

const ArchivePage: React.FC = () => {
  const [archive, setArchive] = useState<ArchiveItem[]>(mockArchive);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ArchiveItem | null>(null);
  const [formData, setFormData] = useState({
    readCount: 0,
    shareCount: 0,
    leadCount: 0
  });

  const totalStats = useMemo(() => {
    return {
      readCount: archive.reduce((sum, item) => sum + item.readCount, 0),
      shareCount: archive.reduce((sum, item) => sum + item.shareCount, 0),
      leadCount: archive.reduce((sum, item) => sum + item.leadCount, 0)
    };
  }, [archive]);

  const formatNumber = (num: number) => {
    if (num >= 10000) {
      return `${(num / 10000).toFixed(1)}万`;
    }
    return num.toString();
  };

  const handleEdit = (item: ArchiveItem) => {
    setEditingItem(item);
    setFormData({
      readCount: item.readCount,
      shareCount: item.shareCount,
      leadCount: item.leadCount
    });
    setShowModal(true);
    console.log('[ArchivePage] 编辑数据:', item.id);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({ readCount: 0, shareCount: 0, leadCount: 0 });
  };

  const handleSubmit = () => {
    if (!editingItem) return;

    setArchive(archive.map(item => 
      item.id === editingItem.id 
        ? { 
            ...item, 
            readCount: formData.readCount,
            shareCount: formData.shareCount,
            leadCount: formData.leadCount
          }
        : item
    ));
    
    handleCloseModal();
    Taro.showToast({ title: '数据已更新', icon: 'success' });
    console.log('[ArchivePage] 更新数据:', editingItem.id, formData);
  };

  const handleCardClick = (item: ArchiveItem) => {
    Taro.showToast({ title: `查看${item.title}`, icon: 'none' });
    console.log('[ArchivePage] 点击文章:', item);
  };

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.title}>效果归档</Text>
        <View className={styles.statsCard}>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{formatNumber(totalStats.readCount)}</Text>
            <Text className={styles.statLabel}>总阅读</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{formatNumber(totalStats.shareCount)}</Text>
            <Text className={styles.statLabel}>总转发</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{formatNumber(totalStats.leadCount)}</Text>
            <Text className={styles.statLabel}>总线索</Text>
          </View>
        </View>
      </View>

      <ScrollView className={styles.list} scrollY>
        {archive.length === 0 ? (
          <EmptyState message="暂无归档文章" />
        ) : (
          archive.map(item => (
            <ArchiveCard
              key={item.id}
              item={item}
              onEdit={() => handleEdit(item)}
              onClick={() => handleCardClick(item)}
            />
          ))
        )}
      </ScrollView>

      {showModal && editingItem && (
        <View className={styles.modalOverlay} onClick={handleCloseModal}>
          <View className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <Text className={styles.modalTitle}>编辑效果数据</Text>
            <Text className={styles.label}>{editingItem.title}</Text>
            
            <View className={styles.formGroup}>
              <Text className={styles.label}>阅读数</Text>
              <Input
                className={styles.input}
                type="number"
                value={formData.readCount.toString()}
                onInput={(e) => setFormData({ ...formData, readCount: parseInt(e.detail.value) || 0 })}
                placeholder="请输入阅读数"
              />
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.label}>转发数</Text>
              <Input
                className={styles.input}
                type="number"
                value={formData.shareCount.toString()}
                onInput={(e) => setFormData({ ...formData, shareCount: parseInt(e.detail.value) || 0 })}
                placeholder="请输入转发数"
              />
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.label}>线索数</Text>
              <Input
                className={styles.input}
                type="number"
                value={formData.leadCount.toString()}
                onInput={(e) => setFormData({ ...formData, leadCount: parseInt(e.detail.value) || 0 })}
                placeholder="请输入线索数"
              />
            </View>

            <View className={styles.modalButtons}>
              <Button className={styles.cancelButton} onClick={handleCloseModal}>
                <Text className={styles.cancelButtonText}>取消</Text>
              </Button>
              <Button className={styles.submitButton} onClick={handleSubmit}>
                <Text className={styles.submitButtonText}>保存</Text>
              </Button>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default ArchivePage;