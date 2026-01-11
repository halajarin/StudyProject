export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalCarpools: number;
  activeCarpools: number;
  totalCreditsCirculating: number;
  platformCreditsEarned: number;
  carpoolsCountByDate?: { [date: string]: number };
  platformCreditsByDate?: { [date: string]: number };
}
