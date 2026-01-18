export interface Review {
  reviewId: number;
  comment: string;
  rating: number;
  status: string;
  createdAt: Date;
  authorUsername: string;
  targetUsername: string;
}

export interface CreateReview {
  comment: string;
  note: number;
  targetUserId: number;
  carpoolId?: number;
}
