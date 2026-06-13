import React from 'react';
import { View, Text, Button } from '@tarojs/components';
import { Proposal } from '@/types/proposal';
import StatusTag from '@/components/StatusTag';
import styles from './index.module.scss';

interface ProposalCardProps {
  proposal: Proposal;
  onVote?: () => void;
  onClick?: () => void;
}

const ProposalCard: React.FC<ProposalCardProps> = ({ proposal, onVote, onClick }) => {
  return (
    <View className={styles.card} onClick={onClick}>
      <View className={styles.header}>
        <View className={styles.columnTag}>
          <Text className={styles.columnText}>{proposal.columnName}</Text>
        </View>
        <StatusTag status={proposal.status} />
      </View>

      <Text className={styles.title}>{proposal.title}</Text>
      <Text className={styles.viewpoint}>{proposal.coreViewpoint}</Text>

      <View className={styles.meta}>
        <Text className={styles.author}>作者：{proposal.author}</Text>
        <View className={styles.warningTags}>
          {proposal.isDuplicate && (
            <View className={styles.duplicateTag}>
              <Text className={styles.duplicateText}>重复选题</Text>
            </View>
          )}
          {proposal.hasSensitiveWords && (
            <View className={styles.sensitiveTag}>
              <Text className={styles.sensitiveText}>含敏感词</Text>
            </View>
          )}
        </View>
      </View>

      <View className={styles.footer}>
        <View className={styles.stats}>
          <Button className={styles.voteButton} onClick={onVote}>
            <Text className={styles.voteIcon}>👍</Text>
            <Text className={styles.voteCount}>{proposal.votes}</Text>
          </Button>
          <View className={styles.commentStat}>
            <Text className={styles.commentIcon}>💬</Text>
            <Text className={styles.commentCount}>{proposal.comments}</Text>
          </View>
        </View>
        {proposal.urgency === 'high' && (
          <View className={styles.urgentTag}>
            <Text className={styles.urgentText}>紧急</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default ProposalCard;