export interface ReviewDashboardItem {
  reviewId: number;
  comment: string;
  note: number;
  status: string;
  createdAt: string;
  authorUsername: string;
  targetUsername: string;
  carpoolId: number | null;
  departureCity: string;
  arrivalCity: string;
  departureDate: string | null;
  driverUsername: string;
  vehicleBrand: string;
  vehicleModel: string;
}
