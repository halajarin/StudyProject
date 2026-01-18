export enum CarpoolStatus {
  Pending = 'Pending',
  InProgress = 'InProgress',
  Completed = 'Completed',
  Cancelled = 'Cancelled'
}

export interface Carpool {
  carpoolId: number;
  userId: number;  // Driver user ID
  departureDate: Date;
  departureTime: string;
  departureLocation: string;
  departureCity: string;
  arrivalDate: Date;
  arrivalTime: string;
  arrivalLocation: string;
  arrivalCity: string;
  status: CarpoolStatus;
  totalSeats: number;
  availableSeats: number;
  pricePerPerson: number;
  estimatedDurationMinutes?: number;
  isEcological: boolean;
  driverUsername: string;
  driverPhoto?: Uint8Array;
  driverAverageRating: number;
  vehicleModel: string;
  vehicleBrand: string;
  vehicleEnergyType: string;
  vehicleColor: string;
}

export interface SearchCarpool {
  departureCity: string;
  arrivalCity: string;
  departureDate?: string; // ISO date string (YYYY-MM-DD), optional
  isEcological?: boolean;
  maxPrice?: number;
  maxDurationMinutes?: number;
  minimumRating?: number;
}

export interface CreateCarpool {
  departureDate: Date;
  departureTime: string;
  departureLocation: string;
  departureCity: string;
  arrivalDate: Date;
  arrivalTime: string;
  arrivalLocation: string;
  arrivalCity: string;
  totalSeats: number;
  pricePerPerson: number;
  vehicleId: number;
  estimatedDurationMinutes?: number;
}
