export interface AdminCarpool {
  carpoolId: number;
  departureCity: string;
  arrivalCity: string;
  departureDate: string;
  departureTime: string;
  arrivalDate: string;
  arrivalTime: string;
  status: string;
  totalSeats: number;
  availableSeats: number;
  pricePerPerson: number;
  estimatedDurationMinutes?: number;
  driverUsername: string;
  driverId: number;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleRegistration: string;
  vehicleColor: string;
  vehicleEnergyType: string;
  isEcological: boolean;
  createdAt: string;
}
