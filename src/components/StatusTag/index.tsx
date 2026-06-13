import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

interface StatusTagProps {
  status: 'pending' | 'approved' | 'rejected' | 'scheduled' | 'published' | 'drafting' | 'reviewing' | 'finalizing' | 'ready' | 'processing' | 'resolved';
  size?: 'small' | 'medium';
}

const STATUS_CONFIG = {
  pending: { text: '待审核', className: 'pending' },
  approved: { text: '已通过', className: 'approved' },
  rejected: { text: '已拒绝', className: 'rejected' },
  scheduled: { text: '已排期', className: 'scheduled' },
  published: { text: '已发布', className: 'published' },
  drafting: { text: '撰写中', className: 'drafting' },
  reviewing: { text: '审核中', className: 'reviewing' },
  finalizing: { text: '定稿中', className: 'finalizing' },
  ready: { text: '待发布', className: 'ready' },
  processing: { text: '处理中', className: 'processing' },
  resolved: { text: '已解决', className: 'resolved' }
};

const StatusTag: React.FC<StatusTagProps> = ({ status, size = 'small' }) => {
  const config = STATUS_CONFIG[status] || { text: '未知', className: 'pending' };

  return (
    <View className={classnames(styles.tag, styles[config.className], styles[size])}>
      <Text className={styles.text}>{config.text}</Text>
    </View>
  );
};

export default StatusTag;