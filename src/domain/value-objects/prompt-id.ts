export class PromptId {
  private readonly _value: string;

  constructor(value: string) {
    if (!this.isValid(value)) {
      throw new Error('Invalid PromptId format');
    }
    this._value = value;
  }

  static generate(): PromptId {
    return new PromptId(crypto.randomUUID());
  }

  get value(): string {
    return this._value;
  }

  equals(other: PromptId): boolean {
    return this._value === other._value;
  }

  private isValid(value: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
  }

  toString(): string {
    return this._value;
  }
}
