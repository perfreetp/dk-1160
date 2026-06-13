import React, { useState, useEffect } from 'react';
import { View, Text, Button, ScrollView, Input, Picker, Textarea } from '@tarojs/components';
import Taro from '@tarojs/taro';
import ProposalCard from '@/components/ProposalCard';
import EmptyState from '@/components/EmptyState';
import { Proposal, ProposalFormData } from '@/types/proposal';
import { Column } from '@/types/column';
import { mockProposals } from '@/data/proposals';
import { mockColumns } from '@/data/columns';
import { storage, STORAGE_KEYS, checkDuplicateTitle, checkSensitiveWords } from '@/utils/index';
import styles from './index.module.scss';

const FILTERS = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待审核' },
  { key: 'approved', label: '已通过' },
  { key: 'scheduled', label: '已排期' },
  { key: 'published', label: '已发布' }
];

const ProposalsPage: React.FC = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [columns, setColumns] = useState<Column[]>(mockColumns);
  const [activeFilter, setActiveFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [formData, setFormData] = useState<ProposalFormData>({
    columnId: '',
    title: '',
    targetReader: '',
    coreViewpoint: '',
    references: []
  });
  const [referenceInput, setReferenceInput] = useState('');
  const [selectedColumnIndex, setSelectedColumnIndex] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const savedProposals = await storage.get<Proposal[]>(STORAGE_KEYS.PROPOSALS, mockProposals);
    const savedColumns = await storage.get<Column[]>(STORAGE_KEYS.COLUMNS, mockColumns);
    setProposals(savedProposals);
    setColumns(savedColumns);
    console.log('[ProposalsPage] 数据加载完成:', savedProposals.length, '条选题');
  };

  const saveData = async (data: Proposal[]) => {
    await storage.set(STORAGE_KEYS.PROPOSALS, data);
    setProposals(data);
  };

  const filteredProposals = activeFilter === 'all' 
    ? proposals 
    : proposals.filter(p => p.status === activeFilter);

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    console.log('[ProposalsPage] 切换筛选:', filter);
  };

  const handleAddProposal = () => {
    if (columns.length > 0) {
      setFormData({
        columnId: columns[0].id,
        title: '',
        targetReader: '',
        coreViewpoint: '',
        references: []
      });
      setSelectedColumnIndex(0);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({ columnId: '', title: '', targetReader: '', coreViewpoint: '', references: [] });
    setReferenceInput('');
    setSelectedColumnIndex(0);
  };

  const handleColumnChange = (e) => {
    const index = e.detail.value;
    setSelectedColumnIndex(index);
    setFormData({ ...formData, columnId: columns[index]?.id || '' });
  };

  const handleAddReference = () => {
    if (referenceInput.trim()) {
      setFormData({
        ...formData,
        references: [...formData.references, referenceInput.trim()]
      });
      setReferenceInput('');
    }
  };

  const handleRemoveReference = (index: number) => {
    const newReferences = formData.references.filter((_, i) => i !== index);
    setFormData({ ...formData, references: newReferences });
  };

  const handleSubmit = async () => {
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

    const existingTitles = proposals.map(p => p.title);
    const isDuplicate = checkDuplicateTitle(formData.title, existingTitles);
    
    const sensitiveCheck = checkSensitiveWords(formData.title + ' ' + formData.coreViewpoint);
    
    if (isDuplicate) {
      const res = await Taro.showModal({
        title: '重复选题提醒',
        content: '该标题与已有选题重复或高度相似，是否继续提交？',
        confirmText: '继续提交',
        cancelText: '修改'
      });
      if (!res.confirm) return;
    }
    
    if (sensitiveCheck.hasSensitive) {
      const res = await Taro.showModal({
        title: '敏感词提醒',
        content: `内容包含敏感词：${sensitiveCheck.words.join(', ')}，是否继续提交？`,
        confirmText: '继续提交',
        cancelText: '修改'
      });
      if (!res.confirm) return;
    }

    const selectedColumn = columns.find(c => c.id === formData.columnId);
    const finalReferences = referenceInput.trim() 
      ? [...formData.references, referenceInput.trim()]
      : formData.references;
    const newProposal: Proposal = {
      id: Date.now().toString(),
      columnId: formData.columnId,
      columnName: selectedColumn?.name || '',
      title: formData.title.trim(),
      targetReader: formData.targetReader.trim(),
      coreViewpoint: formData.coreViewpoint.trim(),
      references: finalReferences,
      author: '当前用户',
      votes: 0,
      comments: 0,
      status: 'pending',
      urgency: 'low',
      deadline: '',
      assignee: '',
      outline: '',
      interviewees: [],
      isDuplicate,
      hasSensitiveWords: sensitiveCheck.hasSensitive,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    const updatedProposals = [newProposal, ...proposals];
    await saveData(updatedProposals);
    handleCloseModal();
    
    const message = isDuplicate || sensitiveCheck.hasSensitive 
      ? '提交成功（含标记）' 
      : '提交成功';
    Taro.showToast({ title: message, icon: 'success' });
    console.log('[ProposalsPage] 新增选题:', newProposal);
  };

  const handleVote = async (proposalId: string) => {
    const updatedProposals = proposals.map(p => 
      p.id === proposalId ? { ...p, votes: p.votes + 1 } : p
    );
    await saveData(updatedProposals);
    Taro.showToast({ title: '已投票', icon: 'success' });
    console.log('[ProposalsPage] 投票:', proposalId);
  };

  const handleCardClick = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setShowDetailModal(true);
    console.log('[ProposalsPage] 查看详情:', proposal);
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
              <Picker 
                mode='selector' 
                range={columns.map(c => c.name)} 
                value={selectedColumnIndex}
                onChange={handleColumnChange}
              >
                <View className={styles.picker}>
                  <Text className={styles.pickerText}>
                    {columns[selectedColumnIndex]?.name || '请选择栏目'}
                  </Text>
                  <Text className={styles.pickerArrow}>▼</Text>
                </View>
              </Picker>
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
              <Textarea
                className={styles.textarea}
                value={formData.coreViewpoint}
                onInput={(e) => setFormData({ ...formData, coreViewpoint: e.detail.value })}
                placeholder="请输入核心观点"
              />
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.label}>参考资料</Text>
              <View className={styles.referenceInputRow}>
                <Input
                  className={styles.referenceInput}
                  value={referenceInput}
                  onInput={(e) => setReferenceInput(e.detail.value)}
                  placeholder="输入链接或描述"
                />
                <Button className={styles.addRefButton} onClick={handleAddReference}>
                  <Text className={styles.addRefButtonText}>+</Text>
                </Button>
              </View>
              {formData.references.length > 0 && (
                <View className={styles.referenceList}>
                  {formData.references.map((ref, index) => (
                    <View key={index} className={styles.referenceItem}>
                      <Text className={styles.referenceText}>{ref}</Text>
                      <Button 
                        className={styles.removeRefButton} 
                        onClick={() => handleRemoveReference(index)}
                      >
                        <Text className={styles.removeRefButtonText}>×</Text>
                      </Button>
                    </View>
                  ))}
                </View>
              )}
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

      {showDetailModal && selectedProposal && (
        <View className={styles.modalOverlay} onClick={() => setShowDetailModal(false)}>
          <View className={styles.detailModal} onClick={(e) => e.stopPropagation()}>
            <Text className={styles.modalTitle}>选题详情</Text>
            
            <View className={styles.detailGroup}>
              <Text className={styles.detailLabel}>栏目</Text>
              <Text className={styles.detailValue}>{selectedProposal.columnName}</Text>
            </View>
            
            <View className={styles.detailGroup}>
              <Text className={styles.detailLabel}>标题</Text>
              <Text className={styles.detailValue}>{selectedProposal.title}</Text>
            </View>
            
            <View className={styles.detailGroup}>
              <Text className={styles.detailLabel}>目标读者</Text>
              <Text className={styles.detailValue}>{selectedProposal.targetReader || '未填写'}</Text>
            </View>
            
            <View className={styles.detailGroup}>
              <Text className={styles.detailLabel}>核心观点</Text>
              <Text className={styles.detailValue}>{selectedProposal.coreViewpoint}</Text>
            </View>
            
            {selectedProposal.references.length > 0 && (
              <View className={styles.detailGroup}>
                <Text className={styles.detailLabel}>参考资料</Text>
                <View className={styles.referenceList}>
                  {selectedProposal.references.map((ref, index) => (
                    <Text key={index} className={styles.referenceText}>{ref}</Text>
                  ))}
                </View>
              </View>
            )}
            
            <View className={styles.detailGroup}>
              <Text className={styles.detailLabel}>作者</Text>
              <Text className={styles.detailValue}>{selectedProposal.author}</Text>
            </View>
            
            <View className={styles.detailGroup}>
              <Text className={styles.detailLabel}>投票数</Text>
              <Text className={styles.detailValue}>{selectedProposal.votes}</Text>
            </View>
            
            <View className={styles.detailGroup}>
              <Text className={styles.detailLabel}>评论数</Text>
              <Text className={styles.detailValue}>{selectedProposal.comments}</Text>
            </View>
            
            <Button className={styles.closeButton} onClick={() => setShowDetailModal(false)}>
              <Text className={styles.closeButtonText}>关闭</Text>
            </Button>
          </View>
        </View>
      )}
    </View>
  );
};

export default ProposalsPage;