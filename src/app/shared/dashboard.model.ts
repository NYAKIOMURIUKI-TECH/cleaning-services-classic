export interface DashboardStats {
  totalBookings?: number;
  pendingBookings?: number;
  completedBookings?: number;
  totalEarnings?: number;
  totalPayments?: number;
  pendingPayments?: number;
  averageRating?: number;
  totalUsers?: number;
  totalCleaners?: number;
  totalClients?: number;
}

export interface RecentActivity {
  id: number;
  type: 'booking' | 'payment' | 'rating';
  title: string;
  description: string;
  date: string;
  status?: string;
  amount?: number;
}

export interface QuickAction {
  title: string;
  description: string;
  route: string;
  icon: string;
  color: string;
}
