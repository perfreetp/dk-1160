export interface ScheduleItem {
  id: string;
  proposalId: string;
  proposalTitle: string;
  columnName: string;
  author: string;
  assignee: string;
  urgency: 'low' | 'medium' | 'high';
  deadline: string;
  status: 'drafting' | 'reviewing' | 'finalizing' | 'ready';
  weekNumber: number;
  dayOfWeek: number;
  createdAt: string;
}

export type ScheduleStatus = 'drafting' | 'reviewing' | 'finalizing' | 'ready';