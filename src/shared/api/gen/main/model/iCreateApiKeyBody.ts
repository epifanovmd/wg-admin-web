export interface ICreateApiKeyBody {
  /**
   * @minLength 1
   * @maxLength 100
   */
  name: string;
  /** Разрешения: `integration:sync`, `integration:*`. */
  scopes: string[];
  /** Срок действия; без него ключ бессрочный. */
  expiresAt?: string;
}
