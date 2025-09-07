import BaseModel from './BaseModel';
import { IUser } from './User';
import { ICompany } from './Company';

export interface ITicket {
  id?: number;
  title: string;
  description: string;
  status?: 'open' | 'in_progress' | 'pending' | 'resolved' | 'closed';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  category: 'support' | 'contact' | 'technical' | 'billing' | 'feature_request' | 'bug_report';
  user_id: number;
  assigned_to?: number | null;
  company_id?: number | null;
  attachments?: string[];
  metadata?: Record<string, any>;
  created_at?: Date;
  updated_at?: Date;
}

export interface TicketUser {
  id: number;
  username: string;
  email: string;
}

export interface TicketCompany {
  id: number;
  name: string;
}

export interface TicketWithRelations extends ITicket {
  user?: TicketUser;
  assigned_user?: TicketUser;
  company?: TicketCompany;
}

class Ticket extends BaseModel<ITicket> {
  constructor() {
    super('tickets');
  }

  /**
   * Busca tickets com filtros específicos
   */
  async findWithFilters(filters: {
    search?: string;
    status?: 'open' | 'in_progress' | 'pending' | 'resolved' | 'closed';
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    category?: 'support' | 'contact' | 'technical' | 'billing' | 'feature_request' | 'bug_report';
    user_id?: number;
    assigned_to?: number;
    company_id?: number;
  }, options: {
    page?: number;
    limit?: number;
    orderBy?: string;
    orderDirection?: 'ASC' | 'DESC';
  } = {}): Promise<{ items: TicketWithRelations[], total: number, page: number, limit: number, pages: number }> {
    const {
      page = 1,
      limit = 10,
      orderBy = 'created_at',
      orderDirection = 'DESC'
    } = options;

    const offset = (page - 1) * limit;
    let query = this.db(this.tableName);

    // Aplicar filtros
    if (filters.search) {
      query = query.where(function() {
        this.whereILike('title', `%${filters.search}%`)
            .orWhereILike('description', `%${filters.search}%`);
      });
    }

    if (filters.status) {
      query = query.where('status', filters.status);
    }

    if (filters.priority) {
      query = query.where('priority', filters.priority);
    }

    if (filters.category) {
      query = query.where('category', filters.category);
    }

    if (filters.user_id) {
      query = query.where('user_id', filters.user_id);
    }

    if (filters.assigned_to !== undefined) {
      query = query.where('assigned_to', filters.assigned_to);
    }

    if (filters.company_id) {
      query = query.where('company_id', filters.company_id);
    }

    // Contar total
    const totalResult = await query.clone().count('id as count');
    const total = Number(totalResult[0]?.count || 0);

    // Buscar itens com relacionamentos
    const items = await query
      .leftJoin('users as creator', 'tickets.user_id', 'creator.id')
      .leftJoin('users as assignee', 'tickets.assigned_to', 'assignee.id')
      .leftJoin('companies', 'tickets.company_id', 'companies.id')
      .select(
        'tickets.*',
        'creator.id as creator_id',
        'creator.username as creator_name',
        'creator.email as creator_email',
        'assignee.id as assignee_id',
        'assignee.username as assignee_name',
        'assignee.email as assignee_email',
        'companies.id as company_id_rel',
        'companies.name as company_name'
      )
      .orderBy(orderBy, orderDirection)
      .limit(limit)
      .offset(offset);

    // Mapear resultados
    const mappedItems: TicketWithRelations[] = items.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      status: item.status,
      priority: item.priority,
      category: item.category,
      user_id: item.user_id,
      assigned_to: item.assigned_to,
      company_id: item.company_id,
      attachments: item.attachments,
      metadata: item.metadata,
      created_at: item.created_at,
      updated_at: item.updated_at,
      user: item.creator_id ? {
        id: item.creator_id,
        username: item.creator_name,
        email: item.creator_email
      } : undefined,
      assigned_user: item.assignee_id ? {
        id: item.assignee_id,
        username: item.assignee_name,
        email: item.assignee_email
      } : undefined,
      company: item.company_id_rel ? {
        id: item.company_id_rel,
        name: item.company_name
      } : undefined
    }));

    return {
      items: mappedItems,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    };
  }

  /**
   * Busca ticket por ID com relacionamentos
   */
  async findByIdWithDetails(id: number): Promise<TicketWithRelations | undefined> {
    const result = await this.db(this.tableName)
      .leftJoin('users as creator', 'tickets.user_id', 'creator.id')
      .leftJoin('users as assignee', 'tickets.assigned_to', 'assignee.id')
      .leftJoin('companies', 'tickets.company_id', 'companies.id')
      .select(
        'tickets.*',
        'creator.id as creator_id',
        'creator.username as creator_name',
        'creator.email as creator_email',
        'assignee.id as assignee_id',
        'assignee.username as assignee_name',
        'assignee.email as assignee_email',
        'companies.id as company_id_rel',
        'companies.name as company_name'
      )
      .where('tickets.id', id)
      .first();

    if (!result) return undefined;

    return {
      id: result.id,
      title: result.title,
      description: result.description,
      status: result.status,
      priority: result.priority,
      category: result.category,
      user_id: result.user_id,
      assigned_to: result.assigned_to,
      company_id: result.company_id,
      attachments: result.attachments,
      metadata: result.metadata,
      created_at: result.created_at,
      updated_at: result.updated_at,
      user: result.creator_id ? {
        id: result.creator_id,
        username: result.creator_name,
        email: result.creator_email
      } : undefined,
      assigned_user: result.assignee_id ? {
        id: result.assignee_id,
        username: result.assignee_name,
        email: result.assignee_email
      } : undefined,
      company: result.company_id_rel ? {
        id: result.company_id_rel,
        name: result.company_name
      } : undefined
    };
  }

  /**
   * Obtém estatísticas dos tickets
   */
  async getStats(filters: {
    user_id?: number;
    assigned_to?: number;
    company_id?: number;
  } = {}): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
    byCategory: Record<string, number>;
  }> {
    let query = this.db(this.tableName);

    // Aplicar filtros
    if (filters.user_id) {
      query = query.where('user_id', filters.user_id);
    }

    if (filters.assigned_to !== undefined) {
      query = query.where('assigned_to', filters.assigned_to);
    }

    if (filters.company_id) {
      query = query.where('company_id', filters.company_id);
    }

    const tickets = await query.select('status', 'priority', 'category');

    const stats = {
      total: tickets.length,
      byStatus: {} as Record<string, number>,
      byPriority: {} as Record<string, number>,
      byCategory: {} as Record<string, number>
    };

    tickets.forEach(ticket => {
      // Status
      stats.byStatus[ticket.status] = (stats.byStatus[ticket.status] || 0) + 1;
      
      // Priority
      stats.byPriority[ticket.priority] = (stats.byPriority[ticket.priority] || 0) + 1;
      
      // Category
      stats.byCategory[ticket.category] = (stats.byCategory[ticket.category] || 0) + 1;
    });

    return stats;
  }
}

export default Ticket;