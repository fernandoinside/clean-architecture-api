import BaseService from './BaseService';
import Ticket, { ITicket, TicketWithRelations } from '../models/Ticket';

interface TicketFilters {
  search?: string;
  status?: 'open' | 'in_progress' | 'pending' | 'resolved' | 'closed';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  category?: 'support' | 'contact' | 'technical' | 'billing' | 'feature_request' | 'bug_report';
  user_id?: number;
  assigned_to?: number;
  company_id?: number;
}

export class TicketService extends BaseService<ITicket> {
  private ticketModel: Ticket;

  constructor() {
    const ticketModel = new Ticket();
    super(ticketModel);
    this.ticketModel = ticketModel;
  }

  async findWithFilters(
    filters: TicketFilters = {},
    options: {
      page?: number;
      limit?: number;
      orderBy?: string;
      orderDirection?: 'ASC' | 'DESC';
    } = {}
  ): Promise<{
    items: TicketWithRelations[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }> {
    return await this.ticketModel.findWithFilters(filters, options);
  }

  async findByIdWithDetails(id: number): Promise<TicketWithRelations | undefined> {
    return await this.ticketModel.findByIdWithDetails(id);
  }

  async createTicket(data: Omit<ITicket, 'id' | 'created_at' | 'updated_at'>): Promise<ITicket | undefined> {
    // Definir valores padrão
    const ticketData = {
      ...data,
      status: data.status || 'open' as const,
      priority: data.priority || 'medium' as const,
      attachments: data.attachments || [],
      metadata: data.metadata || {}
    };

    return await this.create(ticketData);
  }

  async updateTicket(id: number, data: Partial<Omit<ITicket, 'id' | 'created_at' | 'updated_at'>>): Promise<ITicket | undefined> {
    return await this.update(id, data);
  }

  async assignTicket(ticketId: number, userId: number | null): Promise<ITicket | undefined> {
    return await this.updateTicket(ticketId, { assigned_to: userId });
  }

  async changeStatus(ticketId: number, status: ITicket['status']): Promise<ITicket | undefined> {
    return await this.updateTicket(ticketId, { status });
  }

  async getTicketsByUser(userId: number, options: {
    page?: number;
    limit?: number;
    orderBy?: string;
    orderDirection?: 'ASC' | 'DESC';
  } = {}): Promise<{
    items: TicketWithRelations[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }> {
    return this.findWithFilters({ user_id: userId }, options);
  }

  async getTicketsByAssignee(assigneeId: number, options: {
    page?: number;
    limit?: number;
    orderBy?: string;
    orderDirection?: 'ASC' | 'DESC';
  } = {}): Promise<{
    items: TicketWithRelations[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }> {
    return this.findWithFilters({ assigned_to: assigneeId }, options);
  }

  async getTicketsByCompany(companyId: number, options: {
    page?: number;
    limit?: number;
    orderBy?: string;
    orderDirection?: 'ASC' | 'DESC';
  } = {}): Promise<{
    items: TicketWithRelations[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }> {
    return this.findWithFilters({ company_id: companyId }, options);
  }

  async getTicketStats(filters: TicketFilters = {}): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
    byCategory: Record<string, number>;
  }> {
    return await this.ticketModel.getStats(filters);
  }
}