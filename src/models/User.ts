export class User {
  constructor(
    public email: string,
    public name: string,
  ) {}

  public getIdentifier(): string {
    return `${this.name} <${this.email}>`;
  }
}
