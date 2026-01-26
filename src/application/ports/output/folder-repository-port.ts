import { Folder } from '@domain/entities/Folder';
import { FolderId } from '@domain/value-objects/FolderId';

export interface IFolderRepository {
  save(folder: Folder): Promise<void>;
  findById(id: FolderId): Promise<Folder | null>;
  findAll(): Promise<Folder[]>;
  delete(id: FolderId): Promise<void>;
  exists(id: FolderId): Promise<boolean>;
}
