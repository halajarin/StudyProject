export interface Review {
  reviewId: number;
  comment: string;
  note: number;
  status: string;
  createdAt: Date;
  authorUsername: string;
  targetUsername: string;
}
