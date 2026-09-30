export type ListWgForwardsParams = {
  /**
   * Только свои пробросы (владелец или создатель) при любой области прав
   */
  mine?: boolean;
  offset?: number;
  limit?: number;
};
