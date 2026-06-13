import React from 'react';
import { View, Text, Button } from '@tarojs/components';
import { Question } from '@/types/question';
import StatusTag from '@/components/StatusTag';
import styles from './index.module.scss';

interface QuestionCardProps {
  question: Question;
  onLink?: () => void;
  onClick?: () => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, onLink, onClick }) => {
  return (
    <View className={styles.card} onClick={onClick}>
      <View className={styles.header}>
        <View className={styles.sourceTag}>
          <Text className={styles.sourceText}>{question.source}</Text>
        </View>
        <StatusTag status={question.status} />
      </View>

      <Text className={styles.content}>{question.content}</Text>

      {question.proposalTitle && (
        <View className={styles.linkInfo}>
          <Text className={styles.linkLabel}>关联选题：</Text>
          <Text className={styles.linkTitle}>{question.proposalTitle}</Text>
        </View>
      )}

      <View className={styles.footer}>
        <Text className={styles.time}>{question.createdAt}</Text>
        {!question.proposalId && question.status !== 'resolved' && (
          <Button className={styles.linkButton} onClick={onLink}>
            <Text className={styles.linkButtonText}>关联选题</Text>
          </Button>
        )}
      </View>
    </View>
  );
};

export default QuestionCard;