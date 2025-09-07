import BaseModel from './BaseModel';

export interface IFile {
  id?: number;
  userId: number;
  fileName: string;
  mimeType: string;
  fileSize: number;
  filePath: string;
  entityType?: string | null;
  entityId?: number | null;
  created_at?: string;
  updated_at?: string;
}

export class File extends BaseModel<IFile> {
  constructor() {
    super('files');
  }
}

export default new File();