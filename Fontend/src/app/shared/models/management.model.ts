export interface ServiceDto {
  id: number;
  name: string;
  priceSingle: number;
  pricePackage: number;
  isTreatment: boolean;
  defaultSessions: number;
}

export interface ProductDto {
  id: number;
  name: string;
  price: number;
  stock: number;
}

export interface CustomerDebtDto {
  customerId: number | null;
  customerName: string;
  phoneNumber: string | null;
  totalDebt: number;
  lastTransactionDate: string | null;
}

export interface PayDebtRequest {
  customerId: number | null;
  customerName: string;
  amount: number;
  paymentMethod?: string;
  notes?: string;
}

export interface CreateServiceRequest {
  name: string;
  priceSingle: number;
  pricePackage: number;
  isTreatment: boolean;
  defaultSessions: number;
}

export interface CreateProductRequest {
  name: string;
  price: number;
  stock: number;
}

export interface RefundCalculationDto {
  customerName: string;
  serviceName: string;
  sessionsDone: number;
  totalSessions: number;
  singlePrice: number;
  packagePrice: number;
  paidAmount: number;
  usedCost: number;
  refundAmount: number;
}

export interface ProcessRefundRequest {
  refundAmount: number;
  notes?: string;
}
