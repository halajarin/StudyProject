export interface CreateCarpoolForm {
  departureCity: string;
  departureLocation: string;
  departureDate: string;
  departureTime: string;
  arrivalCity: string;
  arrivalLocation: string;
  arrivalDate: string;
  arrivalTime: string;
  totalSeats: number;
  pricePerPerson: number;
  vehicleId: number;
  estimatedDurationMinutes?: number;
}
