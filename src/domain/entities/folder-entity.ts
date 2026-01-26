import { FolderId } from '../value-objects/FolderId';

export interface FolderDTO {
  id: string;
  name: string;
  parentId: string | null;
  color: string;
  createdAt: number;
}

export class Folder {
  private constructor(
    public readonly id: FolderId,
    public readonly name: string,
    public readonly parentId: FolderId | null,
    public readonly color: string,
    public readonly createdAt: number
  ) {
    this.validate();
    Object.freeze(this);
  }

  static create(name: string, parentId?: FolderId): Folder {
    return new Folder(
      FolderId.generate(),
      name,
      parentId || null,
      this.generateColor(),
      Date.now()
    );
  }

  static createDefault(): Folder {
    return new Folder(
      FolderId.default(),
      'Default',
      null,
      'blue',
      Date.now()
    );
  }

  static reconstitute(dto: FolderDTO): Folder {
    return new Folder(
      new FolderId(dto.id),
      dto.name,
      dto.parentId ? new FolderId(dto.parentId) : null,
      dto.color,
      dto.createdAt
    );
  }

  rename(newName: string): Folder {
    return new Folder(
      this.id,
      newName,
      this.parentId,
      this.color,
      this.createdAt
    );
  }

  changeColor(newColor: string): Folder {
    return new Folder(
      this.id,
      this.name,
      this.parentId,
      newColor,
      this.createdAt
    );
  }

  private validate(): void {
    if (!this.name || this.name.trim().length === 0) {
      throw new Error('Folder name cannot be empty');
    }
    
    if (this.name.length > 50) {
      throw new Error('Folder name too long (maximum 50 characters)');
    }
  }

  private static generateColor(): string {
    const colors = ['blue', 'green', 'purple', 'orange', 'pink', 'red', 'yellow', 'indigo'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  toDTO(): FolderDTO {
    return {
      id: this.id.value,
      name: this.name,
      parentId: this.parentId?.value || null,
      color: this.color,
      createdAt: this.createdAt
    };
  }
}
