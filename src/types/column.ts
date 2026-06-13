export interface Column {
  id: string;
  name: string;
  description: string;
  owner: string;
  proposalCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ColumnFormData {
  name: string;
  description: string;
  owner: string;
}