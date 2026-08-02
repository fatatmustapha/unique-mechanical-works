export interface ApiSuccessResponse<T> {
  success: true;
  message?: string;
  data: T;
}

export interface PaginationMetadata {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiPaginatedResponse<T> {
  success: true;
  message?: string;
  data: T[];
  pagination: PaginationMetadata;
}

export interface ApiErrorBody {
  code: string;
  message: string;
  details: unknown[];
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorBody;
}