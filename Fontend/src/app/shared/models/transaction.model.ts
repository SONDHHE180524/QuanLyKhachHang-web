export interface TransactionDto {
  id: number;
  date?: string;
  customerId?: number;
  customerName: string;
  itemName: string;
  type: string;
  totalAmount: number;
  paidAmount: number;
  debt: number;
  status: 'Completed' | 'Pending' | 'Canceled';
  isTreatmentPackage?: boolean;
  paymentMethod?: string;
  notes?: string;
  isConsultedByPA?: boolean;
  consultantName?: string;
}

export interface CreateTransactionRequest {
  customerId?: number;
  customerName: string;
  productId?: number;
  serviceId?: number;
  itemName: string;
  type: string;
  totalAmount: number;
  paidAmount: number;
  paymentMethod?: string;
  notes?: string;
  isTreatmentPackage?: boolean;
  isConsultedByPA?: boolean;
  consultantName?: string;
}

export interface ExpenseDto {
  id: number;
  date?: string;
  content: string;
  amount: number;
}

export interface CreateExpenseRequest {
  content: string;
  amount: number;
}
