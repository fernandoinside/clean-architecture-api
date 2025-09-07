import BaseModel from './BaseModel';

export interface IPageStatic {
  id?: number;
  key: string;
  title: string;
  content?: string | null;
  type?: 'page' | 'section' | 'banner' | 'config';
  is_active?: boolean;
  order?: number;
  metadata?: Record<string, any> | null;
  created_at?: string;
  updated_at?: string;
}

class PageStatic extends BaseModel<IPageStatic> {
  constructor() {
    super('page_statics');
  }

  async findById(id: number): Promise<IPageStatic | undefined> {
    if (!id) return undefined;
    return this.db(this.tableName)
      .where({ id })
      .whereNull('deleted_at')
      .first();
  }

  async findByKey(key: string): Promise<IPageStatic | undefined> {
    if (!key) return undefined;
    return this.db(this.tableName)
      .where({ key })
      .whereNull('deleted_at')
      .first();
  }

  async findActivePages(): Promise<IPageStatic[]> {
    return this.db(this.tableName)
      .where({ is_active: true })
      .whereNull('deleted_at')
      .orderBy('order', 'asc')
      .orderBy('title', 'asc')
      .select('*');
  }

  async findByType(type: 'page' | 'section' | 'banner' | 'config'): Promise<IPageStatic[]> {
    return this.db(this.tableName)
      .where({ type })
      .whereNull('deleted_at')
      .orderBy('order', 'asc')
      .orderBy('title', 'asc')
      .select('*');
  }

  async findActiveByType(type: 'page' | 'section' | 'banner' | 'config'): Promise<IPageStatic[]> {
    return this.db(this.tableName)
      .where({ type, is_active: true })
      .whereNull('deleted_at')
      .orderBy('order', 'asc')
      .orderBy('title', 'asc')
      .select('*');
  }

  async findPublicContent(): Promise<IPageStatic[]> {
    return this.db(this.tableName)
      .where({ is_active: true })
      .whereNull('deleted_at')
      .orderBy('order', 'asc')
      .orderBy('title', 'asc')
      .select(['id', 'key', 'title', 'content', 'type', 'order', 'metadata']);
  }

  async activatePage(id: number): Promise<boolean> {
    if (!id) return false;
    const result = await this.db(this.tableName)
      .where({ id })
      .whereNull('deleted_at')
      .update({
        is_active: true,
        updated_at: new Date()
      });
    
    return result > 0;
  }

  async deactivatePage(id: number): Promise<boolean> {
    if (!id) return false;
    const result = await this.db(this.tableName)
      .where({ id })
      .whereNull('deleted_at')
      .update({
        is_active: false,
        updated_at: new Date()
      });
    
    return result > 0;
  }

  async updateOrder(id: number, order: number): Promise<boolean> {
    if (!id) return false;
    const result = await this.db(this.tableName)
      .where({ id })
      .whereNull('deleted_at')
      .update({
        order,
        updated_at: new Date()
      });
    
    return result > 0;
  }

  async findByTitle(title: string): Promise<IPageStatic | undefined> {
    if (!title) return undefined;
    return this.db(this.tableName)
      .where({ title })
      .whereNull('deleted_at')
      .first();
  }

  async findBanners(): Promise<IPageStatic[]> {
    return this.findActiveByType('banner');
  }

  async findSections(): Promise<IPageStatic[]> {
    return this.findActiveByType('section');
  }

  async findConfigs(): Promise<IPageStatic[]> {
    return this.findActiveByType('config');
  }

  async findPages(): Promise<IPageStatic[]> {
    return this.findActiveByType('page');
  }

  async searchByContent(searchTerm: string): Promise<IPageStatic[]> {
    if (!searchTerm) return [];
    return this.db(this.tableName)
      .where(function() {
        this.where('title', 'ilike', `%${searchTerm}%`)
            .orWhere('content', 'ilike', `%${searchTerm}%`)
            .orWhere('key', 'ilike', `%${searchTerm}%`);
      })
      .whereNull('deleted_at')
      .orderBy('is_active', 'desc')
      .orderBy('order', 'asc')
      .select('*');
  }

  async bulkUpdateStatus(ids: number[], is_active: boolean): Promise<number> {
    if (!ids || ids.length === 0) return 0;
    
    return this.db(this.tableName)
      .whereIn('id', ids)
      .whereNull('deleted_at')
      .update({
        is_active,
        updated_at: new Date()
      });
  }

  async getStatistics(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byType: Record<string, number>;
  }> {
    const total = await this.db(this.tableName)
      .whereNull('deleted_at')
      .count('* as count')
      .first();

    const active = await this.db(this.tableName)
      .where({ is_active: true })
      .whereNull('deleted_at')
      .count('* as count')
      .first();

    const inactive = await this.db(this.tableName)
      .where({ is_active: false })
      .whereNull('deleted_at')
      .count('* as count')
      .first();

    const typeStats = await this.db(this.tableName)
      .select('type')
      .count('* as count')
      .whereNull('deleted_at')
      .groupBy('type');

    const byType: Record<string, number> = {};
    typeStats.forEach(stat => {
      if (stat.type) {
        byType[stat.type] = Number(stat.count);
      }
    });

    return {
      total: Number(total?.count || 0),
      active: Number(active?.count || 0),
      inactive: Number(inactive?.count || 0),
      byType
    };
  }

  async duplicate(id: number, newKey: string, newTitle: string): Promise<IPageStatic | undefined> {
    if (!id || !newKey || !newTitle) return undefined;
    
    const original = await this.findById(id);
    if (!original) return undefined;

    const duplicateData: Omit<IPageStatic, 'id' | 'created_at' | 'updated_at'> = {
      key: newKey,
      title: newTitle,
      content: original.content,
      type: original.type,
      is_active: false, // Duplicata criada como inativa por padrão
      order: original.order || 0,
      metadata: original.metadata
    };

    return this.create(duplicateData);
  }
}

export default new PageStatic();