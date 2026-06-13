export interface Question {
  id: string;
  content: string;
  source: string;
  proposalId?: string;
  proposalTitle?: string;
  status: 'pending' | 'processing' | 'resolved';
  createdAt: string;
}

export interface QuestionFormData {
  content: string;
  source: string;
}