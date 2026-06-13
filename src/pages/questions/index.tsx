import React, { useState } from 'react';
import { View, Text, Button, ScrollView, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import QuestionCard from '@/components/QuestionCard';
import EmptyState from '@/components/EmptyState';
import { Question, QuestionFormData } from '@/types/question';
import { mockQuestions } from '@/data/questions';
import styles from './index.module.scss';

const FILTERS = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待处理' },
  { key: 'processing', label: '处理中' },
  { key: 'resolved', label: '已解决' }
];

const QuestionsPage: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>(mockQuestions);
  const [activeFilter, setActiveFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<QuestionFormData>({
    content: '',
    source: '公众号留言'
  });

  const filteredQuestions = activeFilter === 'all' 
    ? questions 
    : questions.filter(q => q.status === activeFilter);

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

  const handleSubmit = () => {
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

    setQuestions([newQuestion, ...questions]);
    handleCloseModal();
    Taro.showToast({ title: '添加成功', icon: 'success' });
    console.log('[QuestionsPage] 新增问题:', newQuestion);
  };

  const handleLink = (questionId: string) => {
    Taro.showToast({ title: '关联选题功能开发中', icon: 'none' });
    console.log('[QuestionsPage] 关联选题:', questionId);
  };

  const handleCardClick = (question: Question) => {
    if (question.status === 'pending') {
      setQuestions(questions.map(q => 
        q.id === question.id ? { ...q, status: 'processing' } : q
      ));
      Taro.showToast({ title: '已标记为处理中', icon: 'success' });
      console.log('[QuestionsPage] 更新状态:', question.id, 'processing');
    }
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
              onLink={() => handleLink(question.id)}
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
    </View>
  );
};

export default QuestionsPage;