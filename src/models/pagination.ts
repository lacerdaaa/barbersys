interface PaginationParams {
  page: number;
  limit: number;
  order: 'asc' | 'desc';
  orderBy: string;
};