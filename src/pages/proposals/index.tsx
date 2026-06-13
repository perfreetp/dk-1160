import React, { useState } from 'react';
import { View, Text, Button, ScrollView, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import ProposalCard from '@/components/ProposalCard';
import EmptyState from '@/components/EmptyState';
import { Proposal, ProposalFormData } from '@/types/proposal';
import { Column } from '@/types/column';
import { mockProposals } from '@/data/proposals';
import { mockColumns } from '@/data/columns';
import styles from './index.module.scss';

const FILTERS = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待审核' },
  { key: 'approved', label: '已通过' },
  { key: 'scheduled', label: '已排期' },
  { key: 'published', label: '已发布' }
];

const ProposalsPage: React.FC = () => {
  const [proposals, setProposals] = useState<Proposal[]>(mockProposals);
  const [columns] = useState<Column[]>(mockColumns);
  const [activeFilter, setActiveFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<ProposalFormData>({
    columnId: '',
    title: '',
    targetReader: '',
    coreViewpoint: '',
    references: []
  });

  const filteredProposals = activeFilter === 'all' 
    ? proposals 
    : proposals.filter(p => p.status === activeFilter);

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    console.log('[ProposalsPage] 切换筛选:', filter);
  };

  const handleAddProposal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({ columnId: '', title: '', targetReader: '', coreViewpoint: '', references: [] });
  };

  const handleSubmit = () => {
    if (!formData.columnId) {
      Taro.showToast({ title: '请选择栏目', icon: 'none' });
      return;
    }
    if (!formData.title.trim()) {
      Taro.showToast({ title: '请输入选题标题', icon: 'none' });
      return;
    }
    if (!formData.coreViewpoint.trim()) {
      Taro.showToast({ title: '请输入核心观点', icon: 'none' });
      return;
    }

    const selectedColumn = columns.find(c => c.id === formData.columnId);
    const newProposal: Proposal = {
      id: Date.now().toString(),
      columnId: formData.columnId,
      columnName: selectedColumn?.name || '',
      title: formData.title.trim(),
      targetReader: formData.targetReader.trim(),
      coreViewpoint: formData.coreViewpoint.trim(),
      references: formData.references,
      author: '当前用户',
      votes: 0,
      comments: 0,
      status: 'pending',
      urgency: 'low',
      deadline: '',
      assignee: '',
      outline: '',
      interviewees: [],
      isDuplicate: false,
      hasSensitiveWords: false,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    setProposals([newProposal, ...proposals]);
    handleCloseModal();
    Taro.showToast({ title: '提交成功', icon: 'success' });
    console.log('[ProposalsPage] 新增选题:', newProposal);
  };

  const handleVote = (proposalId: string) => {
    setProposals(proposals.map(p => 
      p.id === proposalId ? { ...p, votes: p.votes + 1 } : p
    ));
    Taro.showToast({ title: '已投票', icon: 'success' });
    console.log('[ProposalsPage] 投票:', proposalId);
  };

  const handleCardClick = (proposal: Proposal) => {
    Taro.showToast({ title: `查看${proposal.title}`, icon: 'none' });
    console.log('[ProposalsPage] 点击选题:', proposal);
  };

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <View className={styles.headerTop}>
          <Text className={styles.title}>选题提案</Text>
          <Button className={styles.addButton} onClick={handleAddProposal}>
            <Text className={styles.addButtonText}>提交选题</Text>
          </Button>
        </View>
        <View className={styles.filterBar}>
          {FILTERS.map(filter => (
            <Button 
              key={filter.key}
              className={`${styles.filterTag} ${activeFilter === filter.key ? styles.filterTagActive : ''}`}
              onClick={() => handleFilterChange(filter.key)}
            >
              <Text className={`${styles.filterText} ${activeFilter === filter.key ? styles.filterTextActive : ''}`}>
                {filter.label}
              </Text>
            </Button>
          ))}
        </View>
      </View>

      <ScrollView className={styles.list} scrollY>
        {filteredProposals.length === 0 ? (
          <EmptyState message="暂无选题" />
        ) : (
          filteredProposals.map(proposal => (
            <ProposalCard
              key={proposal.id}
              proposal={proposal}
              onVote={() => handleVote(proposal.id)}
              onClick={() => handleCardClick(proposal)}
            />
          ))
        )}
      </ScrollView>

      {showModal && (
        <View className={styles.modalOverlay} onClick={handleCloseModal}>
          <View className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <Text className={styles.modalTitle}>提交选题</Text>
            
            <View className={styles.formGroup}>
              <Text className={styles.label}>所属栏目 *</Text>
              <Input
                className={styles.input}
                value={formData.columnId}
                onInput={(e) => {
                  const column = columns.find(c => c.name === e.detail.value);
                  if (column) {
                    setFormData({ ...formData, columnId: column.id });
                  }
                }}
                placeholder="请输入栏目名称（如：行业洞察）"
              />
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.label}>选题标题 *</Text>
              <Input
                className={styles.input}
                value={formData.title}
                onInput={(e) => setFormData({ ...formData, title: e.detail.value })}
                placeholder="请输入选题标题"
              />
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.label}>目标读者</Text>
              <Input
                className={styles.input}
                value={formData.targetReader}
                onInput={(e) => setFormData({ ...formData, targetReader: e.detail.value })}
                placeholder="请输入目标读者群体"
              />
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.label}>核心观点 *</Text>
              <Input
                className={styles.textarea}
                value={formData.coreViewpoint}
                onInput={(e) => setFormData({ ...formData, coreViewpoint: e.detail.value })}
                placeholder="请输入核心观点"
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

export default ProposalsPage;