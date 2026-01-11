export interface User {
  userId: number;
  username: string;
  email: string;
  lastName?: string;
  firstName?: string;
  phone?: string;
  address?: string;
  birthDate?: Date;
  photo?: Uint8Array;
  credits: number;
  roles: string[];
  averageRating: number;
  reviewCount: number;
  isActive?: boolean;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  lastName?: string;
  firstName?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  user: {
    userId: number;
    username: string;
    email: string;
    credits: number;
    roles: string[];
    averageRating: number;
    reviewCount: number;
  };
  token: string;
}
