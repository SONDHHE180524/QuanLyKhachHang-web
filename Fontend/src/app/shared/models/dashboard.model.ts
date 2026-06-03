export interface StatCard {
  title: string;
  value: string;
  change: number;
  icon: string;
  color: string;
  trendData: number[];
}

export interface Transaction {
  id: number;
  date: Date;
  customerName: string;
  itemName: string;
  type: 'SanPham' | 'DichVu' | 'LieuTrinh';
  amount: number;
  paid: number;
  debt: number;
  status: 'Completed' | 'Pending' | 'Canceled';
}

export interface CustomerProgress {
  id: number;
  name: string;
  service: string;
  currentSession: number;
  totalSessions: number;
  lastVisit: Date;
}

export interface DashboardData {
  totalRevenue: number;
  serviceRevenue: number;
  productRevenue: number;
  refundAmount: number;
  monthlyExpense: number;
  profit: number;
  debt: number;
  barChartData: DailyRevenue[];
  serviceDistribution: ServiceDistribution[];
  recentTransactions: Transaction[];
  customerProgress: CustomerProgress[];
  customersServed: CustomerServed[];
}

export interface CustomerServed {
  customerId?: number;
  customerName: string;
  serviceName: string;
  date: Date;
  revenue: number;
  type: string;
}

export interface DailyRevenue {
  day: string;
  revenue: number;
}

export interface ServiceDistribution {
  label: string;
  count: number;
  percentage: number;
  color: string;
}
