import { ScheduleItem } from '@/types/schedule';

export const mockSchedule: ScheduleItem[] = [
  {
    id: '1',
    proposalId: '1',
    proposalTitle: '2024年AI行业发展趋势深度解析',
    columnName: '行业洞察',
    author: '张编辑',
    assignee: '李讲师',
    urgency: 'high',
    deadline: '2024-03-20',
    status: 'reviewing',
    weekNumber: 11,
    dayOfWeek: 3,
    createdAt: '2024-03-12'
  },
  {
    id: '2',
    proposalId: '2',
    proposalTitle: '大语言模型在企业场景的落地实践',
    columnName: '技术前沿',
    author: '李讲师',
    assignee: '张编辑',
    urgency: 'medium',
    deadline: '2024-03-25',
    status: 'drafting',
    weekNumber: 12,
    dayOfWeek: 1,
    createdAt: '2024-03-11'
  },
  {
    id: '3',
    proposalId: '4',
    proposalTitle: 'SaaS企业如何突破增长瓶颈',
    columnName: '行业洞察',
    author: '张编辑',
    assignee: '王运营',
    urgency: 'medium',
    deadline: '2024-03-22',
    status: 'finalizing',
    weekNumber: 12,
    dayOfWeek: 5,
    createdAt: '2024-03-10'
  },
  {
    id: '4',
    proposalId: '8',
    proposalTitle: '数据驱动增长实战',
    columnName: '产品实战',
    author: '王运营',
    assignee: '张编辑',
    urgency: 'high',
    deadline: '2024-03-18',
    status: 'ready',
    weekNumber: 11,
    dayOfWeek: 1,
    createdAt: '2024-03-09'
  },
  {
    id: '5',
    proposalId: '3',
    proposalTitle: '如何设计一个高转化的用户引导流程',
    columnName: '产品实战',
    author: '王运营',
    assignee: '',
    urgency: 'low',
    deadline: '2024-03-30',
    status: 'drafting',
    weekNumber: 13,
    dayOfWeek: 6,
    createdAt: '2024-03-12'
  },
  {
    id: '6',
    proposalId: '5',
    proposalTitle: '远程团队的协作效率提升指南',
    columnName: '团队管理',
    author: '赵主编',
    assignee: '',
    urgency: 'low',
    deadline: '2024-04-01',
    status: 'drafting',
    weekNumber: 14,
    dayOfWeek: 1,
    createdAt: '2024-03-11'
  }
];