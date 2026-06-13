import { Question } from '@/types/question';

export const mockQuestions: Question[] = [
  {
    id: '1',
    content: 'AI大模型在企业中如何实现商业化落地？有哪些成功案例可以参考？',
    source: '公众号留言',
    proposalId: '1',
    proposalTitle: '2024年AI行业发展趋势深度解析',
    status: 'processing',
    createdAt: '2024-03-12'
  },
  {
    id: '2',
    content: '中小企业如何选择适合自己的SaaS产品？有哪些关键指标需要关注？',
    source: '社群提问',
    status: 'pending',
    createdAt: '2024-03-11'
  },
  {
    id: '3',
    content: '远程办公如何保证团队沟通效率？有什么好的工具推荐？',
    source: '公众号留言',
    proposalId: '5',
    proposalTitle: '远程团队的协作效率提升指南',
    status: 'pending',
    createdAt: '2024-03-10'
  },
  {
    id: '4',
    content: '产品经理如何平衡用户需求和商业目标？有什么方法论吗？',
    source: '社群提问',
    status: 'pending',
    createdAt: '2024-03-09'
  },
  {
    id: '5',
    content: '创业初期如何快速验证产品想法？需要多长时间？',
    source: '公众号留言',
    proposalId: '6',
    proposalTitle: '从0到1：一个创业公司的产品迭代之路',
    status: 'resolved',
    createdAt: '2024-03-08'
  },
  {
    id: '6',
    content: '技术团队如何建立有效的代码审查机制？',
    source: '社群提问',
    status: 'pending',
    createdAt: '2024-03-08'
  },
  {
    id: '7',
    content: 'LLM应用的token成本如何控制？有没有优化方案？',
    source: '公众号留言',
    proposalId: '2',
    proposalTitle: '大语言模型在企业场景的落地实践',
    status: 'processing',
    createdAt: '2024-03-07'
  },
  {
    id: '8',
    content: '用户增长团队如何与产品团队协作？有什么好的流程吗？',
    source: '社群提问',
    proposalId: '8',
    proposalTitle: '数据驱动增长实战',
    status: 'pending',
    createdAt: '2024-03-06'
  },
  {
    id: '9',
    content: '如何建立数据驱动的产品决策机制？',
    source: '公众号留言',
    status: 'pending',
    createdAt: '2024-03-05'
  },
  {
    id: '10',
    content: '团队扩张时如何保持文化和价值观的一致性？',
    source: '社群提问',
    status: 'pending',
    createdAt: '2024-03-04'
  }
];