export class Tag {
  private readonly _value: string;

  private constructor(value: string) {
    this.validate(value);
    this._value = value.toLowerCase().trim();
  }

  static fromString(value: string): Tag {
    return new Tag(value);
  }

  get value(): string {
    return this._value;
  }

  equals(other: Tag): boolean {
    return this._value === other._value;
  }

  private validate(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new Error('Tag cannot be empty');
    }
    
    if (value.length > 30) {
      throw new Error('Tag must be 1-30 characters');
    }
    
    if (!/^[a-z0-9-_\s]+$/i.test(value)) {
      throw new Error('Tag can only contain letters, numbers, hyphens, underscores, and spaces');
    }
  }

  toString(): string {
    return this._value;
  }
}
