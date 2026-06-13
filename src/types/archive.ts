export interface ArchiveItem {
  id: string;
  proposalId: string;
  title: string;
  columnName: string;
  author: string;
  publishDate: string;
  readCount: number;
  shareCount: number;
  leadCount: number;
  tags: string[];
  createdAt: string;
}

export interface ArchiveFormData {
  proposalId: string;
  readCount: number;
  shareCount: number;
  leadCount: number;
  tags: string[];
}