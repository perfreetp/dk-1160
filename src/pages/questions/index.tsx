import React, { useState, useEffect } from 'react';
import { View, Text, Button, ScrollView, Input, Picker } from '@tarojs/components';
import Taro from '@tarojs/taro';
import QuestionCard from '@/components/QuestionCard';
import EmptyState from '@/components/EmptyState';
import { Question, QuestionFormData } from '@/types/question';
import { Proposal } from '@/types/proposal';
import { mockQuestions } from '@/data/questions';
import { storage, STORAGE_KEYS } from '@/utils/index';
import styles from './index.module.scss';

const FILTERS = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待处理' },
  { key: 'processing', label: '处理中' },
  { key: 'resolved', label: '已解决' }
];

const QuestionsPage: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkingQuestion, setLinkingQuestion] = useState<Question | null>(null);
  const [selectedProposalIndex, setSelectedProposalIndex] = useState(0);
  const [formData, setFormData] = useState<QuestionFormData>({
    content: '',
    source: '公众号留言'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const savedQuestions = await storage.get<Question[]>(STORAGE_KEYS.QUESTIONS, mockQuestions);
    const savedProposals = await storage.get<Proposal[]>(STORAGE_KEYS.PROPOSALS, []);
    setQuestions(savedQuestions);
    setProposals(savedProposals);
    console.log('[QuestionsPage] 数据加载完成:', savedQuestions.length, '条问题');
  };

  const saveData = async (data: Question[]) => {
    await storage.set(STORAGE_KEYS.QUESTIONS, data);
    setQuestions(data);
  };

  const filteredQuestions = activeFilter === 'all' 
    ? questions 
    : questions.filter(q => q.status === activeFilter);

  const availableProposals = proposals.filter(p => 
    p.status === 'approved' || p.status === 'scheduled'
  );

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    console.log('[QuestionsPage] 切换筛选:', filter);
  };

  const handleAddQuestion = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({ content: '', source: '公众号留言' });
  };

  const handleSubmit = async () => {
    if (!formData.content.trim()) {
      Taro.showToast({ title: '请输入问题内容', icon: 'none' });
      return;
    }

    const newQuestion: Question = {
      id: Date.now().toString(),
      content: formData.content.trim(),
      source: formData.source,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0]
    };

    const updatedQuestions = [newQuestion, ...questions];
    await saveData(updatedQuestions);
    handleCloseModal();
    Taro.showToast({ title: '添加成功', icon: 'success' });
    console.log('[QuestionsPage] 新增问题:', newQuestion);
  };

  const handleLink = (question: Question) => {
    if (availableProposals.length === 0) {
      Taro.showToast({ title: '暂无可关联的选题', icon: 'none' });
      return;
    }
    setLinkingQuestion(question);
    setSelectedProposalIndex(0);
    setShowLinkModal(true);
    console.log('[QuestionsPage] 准备关联选题:', question.id);
  };

  const handleProposalChange = (e) => {
    setSelectedProposalIndex(e.detail.value);
  };

  const handleConfirmLink = async () => {
    if (!linkingQuestion) return;

    const selectedProposal = availableProposals[selectedProposalIndex];
    const updatedQuestions = questions.map(q => 
      q.id === linkingQuestion.id 
        ? { 
            ...q, 
            proposalId: selectedProposal.id,
            proposalTitle: selectedProposal.title,
            status: 'processing'
          }
        : q
    );

    await saveData(updatedQuestions);
    setShowLinkModal(false);
    setLinkingQuestion(null);
    Taro.showToast({ title: '关联成功', icon: 'success' });
    console.log('[QuestionsPage] 关联选题:', linkingQuestion.id, selectedProposal.id);
  };

  const handleCardClick = async (question: Question) => {
    let newStatus = question.status;
    if (question.status === 'pending') {
      newStatus = 'processing';
    } else if (question.status === 'processing') {
      newStatus = 'resolved';
    } else {
      return;
    }

    const updatedQuestions = questions.map(q => 
      q.id === question.id ? { ...q, status: newStatus } : q
    );
    await saveData(updatedQuestions);
    Taro.showToast({ title: `状态已更新为${newStatus}`, icon: 'success' });
    console.log('[QuestionsPage] 更新状态:', question.id, newStatus);
  };

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <View className={styles.headerTop}>
          <Text className={styles.title}>读者问题</Text>
          <Button className={styles.addButton} onClick={handleAddQuestion}>
            <Text className={styles.addButtonText}>新增问题</Text>
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
        {filteredQuestions.length === 0 ? (
          <EmptyState message="暂无问题" />
        ) : (
          filteredQuestions.map(question => (
            <QuestionCard
              key={question.id}
              question={question}
              onLink={() => handleLink(question)}
              onClick={() => handleCardClick(question)}
            />
          ))
        )}
      </ScrollView>

      {showModal && (
        <View className={styles.modalOverlay} onClick={handleCloseModal}>
          <View className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <Text className={styles.modalTitle}>新增问题</Text>
            
            <View className={styles.formGroup}>
              <Text className={styles.label}>问题内容 *</Text>
              <Input
                className={styles.textarea}
                value={formData.content}
                onInput={(e) => setFormData({ ...formData, content: e.detail.value })}
                placeholder="请输入读者提出的问题"
              />
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.label}>来源</Text>
              <Input
                className={styles.input}
                value={formData.source}
                onInput={(e) => setFormData({ ...formData, source: e.detail.value })}
                placeholder="公众号留言 / 社群提问"
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

      {showLinkModal && linkingQuestion && (
        <View className={styles.modalOverlay} onClick={() => setShowLinkModal(false)}>
          <View className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <Text className={styles.modalTitle}>关联选题</Text>
            
            <View className={styles.formGroup}>
              <Text className={styles.label}>当前问题</Text>
              <Text className={styles.questionContent}>{linkingQuestion.content}</Text>
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.label}>选择选题 *</Text>
              <Picker 
                mode='selector' 
                range={availableProposals.map(p => `${p.columnName} - ${p.title}`)} 
                value={selectedProposalIndex}
                onChange={handleProposalChange}
              >
                <View className={styles.picker}>
                  <Text className={styles.pickerText}>
                    {availableProposals[selectedProposalIndex] 
                      ? `${availableProposals[selectedProposalIndex].columnName} - ${availableProposals[selectedProposalIndex].title}`
                      : '请选择选题'
                    }
                  </Text>
                  <Text className={styles.pickerArrow}>▼</Text>
                </View>
              </Picker>
            </View>

            <View className={styles.modalButtons}>
              <Button className={styles.cancelButton} onClick={() => setShowLinkModal(false)}>
                <Text className={styles.cancelButtonText}>取消</Text>
              </Button>
              <Button className={styles.submitButton} onClick={handleConfirmLink}>
                <Text className={styles.submitButtonText}>确认关联</Text>
              </Button>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default QuestionsPage;