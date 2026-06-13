import React, { useState } from 'react';
import { View, Text, Button, ScrollView, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import ColumnCard from '@/components/ColumnCard';
import EmptyState from '@/components/EmptyState';
import { Column, ColumnFormData } from '@/types/column';
import { mockColumns } from '@/data/columns';
import styles from './index.module.scss';

const ColumnsPage: React.FC = () => {
  const [columns, setColumns] = useState<Column[]>(mockColumns);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<ColumnFormData>({
    name: '',
    description: '',
    owner: ''
  });

  const handleAddColumn = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({ name: '', description: '', owner: '' });
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      Taro.showToast({ title: '请输入栏目名称', icon: 'none' });
      return;
    }
    if (!formData.owner.trim()) {
      Taro.showToast({ title: '请输入负责人', icon: 'none' });
      return;
    }

    const newColumn: Column = {
      id: Date.now().toString(),
      name: formData.name.trim(),
      description: formData.description.trim(),
      owner: formData.owner.trim(),
      proposalCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    setColumns([newColumn, ...columns]);
    handleCloseModal();
    Taro.showToast({ title: '创建成功', icon: 'success' });
    console.log('[ColumnsPage] 新增栏目:', newColumn);
  };

  const handleCardClick = (column: Column) => {
    Taro.showToast({ title: `查看${column.name}详情`, icon: 'none' });
    console.log('[ColumnsPage] 点击栏目:', column);
  };

  const handleCardLongPress = (column: Column) => {
    Taro.showModal({
      title: '删除栏目',
      content: `确定删除"${column.name}"栏目吗？`,
      success: (res) => {
        if (res.confirm) {
          setColumns(columns.filter(c => c.id !== column.id));
          Taro.showToast({ title: '删除成功', icon: 'success' });
          console.log('[ColumnsPage] 删除栏目:', column.id);
        }
      }
    });
  };

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.title}>栏目管理</Text>
        <Button className={styles.addButton} onClick={handleAddColumn}>
          <Text className={styles.addButtonText}>新增栏目</Text>
        </Button>
      </View>

      <ScrollView className={styles.list} scrollY>
        {columns.length === 0 ? (
          <EmptyState message="暂无栏目，点击上方按钮创建" />
        ) : (
          columns.map(column => (
            <ColumnCard
              key={column.id}
              column={column}
              onClick={() => handleCardClick(column)}
              onLongPress={() => handleCardLongPress(column)}
            />
          ))
        )}
      </ScrollView>

      {showModal && (
        <View className={styles.modalOverlay} onClick={handleCloseModal}>
          <View className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <Text className={styles.modalTitle}>新增栏目</Text>
            
            <View className={styles.formGroup}>
              <Text className={styles.label}>栏目名称 *</Text>
              <Input
                className={styles.input}
                value={formData.name}
                onInput={(e) => setFormData({ ...formData, name: e.detail.value })}
                placeholder="请输入栏目名称"
              />
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.label}>栏目描述</Text>
              <Input
                className={styles.textarea}
                value={formData.description}
                onInput={(e) => setFormData({ ...formData, description: e.detail.value })}
                placeholder="请输入栏目描述"
              />
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.label}>负责人 *</Text>
              <Input
                className={styles.input}
                value={formData.owner}
                onInput={(e) => setFormData({ ...formData, owner: e.detail.value })}
                placeholder="请输入负责人姓名"
              />
            </View>

            <View className={styles.modalButtons}>
              <Button className={styles.cancelButton} onClick={handleCloseModal}>
                <Text className={styles.cancelButtonText}>取消</Text>
              </Button>
              <Button className={styles.submitButton} onClick={handleSubmit}>
                <Text className={styles.submitButtonText}>提交</Text>
              </Button>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default ColumnsPage;