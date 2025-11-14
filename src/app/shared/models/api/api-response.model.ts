/**
 * Standard backend API response structure
 */
export interface ApiResponse<T = any> {
  data: T;
  status: string;
  message: string;
  code: string;
  errors: string[];
  metaData: Record<string, any>;
}

