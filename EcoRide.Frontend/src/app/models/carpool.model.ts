export interface Carpool {
  carpoolId: number;
  departureDate: Date;
  departureTime: string;
  departureLocation: string;
  departureCity: string;
  arrivalDate: Date;
  arrivalTime: string;
  arrivalLocation: string;
  arrivalCity: string;
  status: string;
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
  departureDate: Date;
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
