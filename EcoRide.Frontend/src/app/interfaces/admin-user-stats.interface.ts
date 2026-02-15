export interface AdminUserDetailStats {
  isDriver: boolean;
  isPassenger: boolean;
  driverStats?: DriverStats;
  passengerStats?: PassengerStats;
  driverRatings: RatingStats;
  passengerRatings: RatingStats;
  reviewsGiven: ReviewsGivenStats;
}

export interface DriverStats {
  totalCreated: number;
  pending: number;
  inProgress: number;
  completed: number;
  cancelled: number;
}

export interface PassengerStats {
  totalParticipations: number;
  confirmed: number;
  validated: number;
  cancelled: number;
}

export interface RatingStats {
  count: number;
  averageRating: number;
}

export interface ReviewsGivenStats {
  count: number;
  averageNoteGiven: number;
}
