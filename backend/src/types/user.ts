/**
 * User entity stored in DynamoDB
 */
export interface User {
  userId: string;
  username: string;
  email: string;
  name?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Public user info (returned in API responses)
 */
export interface PublicUserInfo {
  username: string;
  name?: string;
  avatar?: string;
  createdAt: string;
}
