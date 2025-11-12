import type { User } from './user.model';
import type { JwtToken } from './jwt-token.model';

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

/**
 * Login response data structure
 */
export interface LoginResponseData {
  user: User;
  jwt: JwtToken;
}

