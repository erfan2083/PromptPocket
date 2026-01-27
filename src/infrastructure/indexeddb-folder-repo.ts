import { IFolderRepository } from '@application/ports/output/IFolderRepository';
import { Folder, FolderDTO } from '@domain/entities/Folder';
import { FolderId } from '@domain/value-objects/FolderId';
import { IndexedDBService } from '../storage/IndexedDBService';

export class IndexedDBFolderRepository implements IFolderRepository {
  private readonly storeName = 'folders';

  constructor(private readonly storage: IndexedDBService) {}

  async save(folder: Folder): Promise<void> {
    const dto = folder.toDTO();
    await this.storage.set(this.storeName, dto);
  }

  async findById(id: FolderId): Promise<Folder | null> {
    const dto = await this.storage.get<FolderDTO>(this.storeName, id.value);
    return dto ? Folder.reconstitute(dto) : null;
  }

  async findAll(): Promise<Folder[]> {
    const dtos = await this.storage.getAll<FolderDTO>(this.storeName);
    return dtos.map(dto => Folder.reconstitute(dto));
  }

  async delete(id: FolderId): Promise<void> {
    await this.storage.delete(this.storeName, id.value);
  }

  async exists(id: FolderId): Promise<boolean> {
    const folder = await this.findById(id);
    return folder !== null;
  }
}
