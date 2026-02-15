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
  createdAt?: string;
  deactivatedAt?: string | null;
  vehicles?: UserVehicle[];
}

export interface UserVehicle {
  vehicleId: number;
  brand: string;
  model: string;
  registrationNumber: string;
  energyType: string;
  color: string;
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
