import BaseModel from './BaseModel';

export interface ISetting {
  id?: number;
  key: string;
  value: string;
  type?: 'string' | 'number' | 'boolean' | 'json';
  description?: string | null;
  created_at?: string;
  updated_at?: string;
}

class Setting extends BaseModel<ISetting> {
  constructor() {
    super('settings');
  }

  async findByKey(key: string): Promise<ISetting | undefined> {
    if (!key) return undefined;
    return this.db(this.tableName)
      .where({ key })
      .whereNull('deleted_at')
      .first();
  }

  async getValue(key: string, defaultValue?: any): Promise<any> {
    const setting = await this.findByKey(key);
    if (!setting) return defaultValue;

    try {
      switch (setting.type) {
        case 'number':
          return Number(setting.value);
        case 'boolean':
          return setting.value.toLowerCase() === 'true';
        case 'json':
          return JSON.parse(setting.value);
        case 'string':
        default:
          return setting.value;
      }
    } catch (error) {
      console.error(`Error parsing setting value for key "${key}":`, error);
      return defaultValue;
    }
  }

  async setValue(key: string, value: any, type?: 'string' | 'number' | 'boolean' | 'json'): Promise<boolean> {
    if (!key) return false;

    let stringValue: string;
    let settingType = type;

    // Auto-detect type if not provided
    if (!settingType) {
      if (typeof value === 'number') {
        settingType = 'number';
      } else if (typeof value === 'boolean') {
        settingType = 'boolean';
      } else if (typeof value === 'object') {
        settingType = 'json';
      } else {
        settingType = 'string';
      }
    }

    // Convert value to string
    try {
      if (settingType === 'json') {
        stringValue = JSON.stringify(value);
      } else {
        stringValue = String(value);
      }
    } catch (error) {
      console.error(`Error serializing value for key "${key}":`, error);
      return false;
    }

    const existing = await this.findByKey(key);
    
    if (existing) {
      const result = await this.db(this.tableName)
        .where({ key })
        .whereNull('deleted_at')
        .update({
          value: stringValue,
          type: settingType,
          updated_at: new Date()
        });
      return result > 0;
    } else {
      const created = await this.create({
        key,
        value: stringValue,
        type: settingType
      });
      return !!created;
    }
  }

  async findByType(type: 'string' | 'number' | 'boolean' | 'json'): Promise<ISetting[]> {
    return this.db(this.tableName)
      .where({ type })
      .whereNull('deleted_at')
      .orderBy('key', 'asc')
      .select('*');
  }

  async getAppSettings(): Promise<Record<string, any>> {
    const settings = await this.getAll();
    const result: Record<string, any> = {};
    
    for (const setting of settings) {
      try {
        result[setting.key] = await this.getValue(setting.key);
      } catch (error) {
        console.error(`Error parsing setting "${setting.key}":`, error);
        result[setting.key] = setting.value;
      }
    }
    
    return result;
  }

  async updateMultipleSettings(settings: { key: string; value: any; type?: 'string' | 'number' | 'boolean' | 'json' }[]): Promise<number> {
    let updateCount = 0;
    
    for (const setting of settings) {
      const success = await this.setValue(setting.key, setting.value, setting.type);
      if (success) updateCount++;
    }
    
    return updateCount;
  }

  async deleteSetting(key: string): Promise<boolean> {
    if (!key) return false;
    const result = await this.db(this.tableName)
      .where({ key })
      .whereNull('deleted_at')
      .update({
        deleted_at: new Date(),
        updated_at: new Date()
      });
    
    return result > 0;
  }

  async getSettingsByPattern(pattern: string): Promise<ISetting[]> {
    if (!pattern) return [];
    return this.db(this.tableName)
      .where('key', 'like', `%${pattern}%`)
      .whereNull('deleted_at')
      .orderBy('key', 'asc')
      .select('*');
  }

  async keyExists(key: string): Promise<boolean> {
    if (!key) return false;
    const result = await this.db(this.tableName)
      .where({ key })
      .whereNull('deleted_at')
      .count('* as count')
      .first();
    
    return Number(result?.count || 0) > 0;
  }

  async getSettingsCount(): Promise<number> {
    const result = await this.db(this.tableName)
      .whereNull('deleted_at')
      .count('* as count')
      .first();
    
    return Number(result?.count || 0);
  }

  // Métodos helper para configurações comuns
  async getSystemSetting(key: string, defaultValue?: any): Promise<any> {
    return this.getValue(`system.${key}`, defaultValue);
  }

  async setSystemSetting(key: string, value: any): Promise<boolean> {
    return this.setValue(`system.${key}`, value);
  }

  async getUserSetting(userId: number, key: string, defaultValue?: any): Promise<any> {
    return this.getValue(`user.${userId}.${key}`, defaultValue);
  }

  async setUserSetting(userId: number, key: string, value: any): Promise<boolean> {
    return this.setValue(`user.${userId}.${key}`, value);
  }

  async getCompanySetting(companyId: number, key: string, defaultValue?: any): Promise<any> {
    return this.getValue(`company.${companyId}.${key}`, defaultValue);
  }

  async setCompanySetting(companyId: number, key: string, value: any): Promise<boolean> {
    return this.setValue(`company.${companyId}.${key}`, value);
  }
}

export default new Setting();