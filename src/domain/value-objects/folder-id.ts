export class FolderId {
  private readonly _value: string;

  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('FolderId cannot be empty');
    }
    this._value = value;
  }

  static generate(): FolderId {
    return new FolderId(crypto.randomUUID());
  }

  static default(): FolderId {
    return new FolderId('default');
  }

  get value(): string {
    return this._value;
  }

  equals(other: FolderId): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
