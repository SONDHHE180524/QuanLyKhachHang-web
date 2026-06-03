export interface CustomerDto {
  id: number;
  fullName: string;
  phoneNumber?: string;
  address?: string;
  treatmentProgress?: string;
  createdAt?: string;
}

export interface CreateCustomerRequest {
  fullName: string;
  phoneNumber?: string;
  address?: string;
}
