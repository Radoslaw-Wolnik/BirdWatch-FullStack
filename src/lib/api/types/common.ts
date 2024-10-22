// src/lib/api/types/common.ts
export type ApiResponse<T> = {
    data?: T;
    error?: string;
  };
  
  export type PaginatedResponse<T> = {
    data: T[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
    };
  };