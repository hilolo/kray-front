import type { User } from '../user/user.model';
import type { JwtToken } from './jwt-token.model';

/**
 * Login response data structure
 */
export interface LoginResponseData {
  user: User;
  jwt: JwtToken;
}

