import { UserSummary } from './user.model';

export type TicketStatus = 'TO_DO' | 'IN_PROGRESS' | 'DONE';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Ticket {
  id: number;
  title: string;
  description?: string;
  status: TicketStatus;
  priority: TicketPriority;
  assignee?: UserSummary | null;
  creator?: UserSummary | null;
  creatorName?: string | null;
  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicketRequest {
  title: string;
  description?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  assigneeId?: number | null;
  dueDate?: string | null;
}

export interface UpdateTicketRequest {
  title: string;
  description?: string;
  status: TicketStatus;
  priority: TicketPriority;
  assigneeId?: number | null;
  dueDate?: string | null;
}
