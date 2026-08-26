export interface PaginatedResponse<T> {
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export type ApiParams = Record<string, string | number | boolean | null | undefined>;
