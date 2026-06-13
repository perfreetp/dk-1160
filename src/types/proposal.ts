export interface Proposal {
  id: string;
  columnId: string;
  columnName: string;
  title: string;
  targetReader: string;
  coreViewpoint: string;
  references: string[];
  author: string;
  votes: number;
  comments: number;
  status: 'pending' | 'approved' | 'rejected' | 'scheduled' | 'published';
  urgency: 'low' | 'medium' | 'high';
  deadline: string;
  assignee: string;
  outline: string;
  interviewees: string[];
  isDuplicate: boolean;
  hasSensitiveWords: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProposalFormData {
  columnId: string;
  title: string;
  targetReader: string;
  coreViewpoint: string;
  references: string[];
}