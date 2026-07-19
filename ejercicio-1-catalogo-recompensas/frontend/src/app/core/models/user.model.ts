export interface User {
  id: number;
  email: string;
  name: string;
  pointsBalance: number;
  createdAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}
