import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../shared/models/api-response.model';
import { CustomerDto, CreateCustomerRequest } from '../shared/models/customer.model';
import { ServiceDto, ProductDto, CustomerDebtDto, PayDebtRequest, CreateServiceRequest, CreateProductRequest, RefundCalculationDto, ProcessRefundRequest } from '../shared/models/management.model';
import { TransactionDto } from '../shared/models/transaction.model';

@Injectable({
  providedIn: 'root'
})
export class ManagementService {
  private apiUrl = 'https://localhost:7196/api/Management';

  constructor(private http: HttpClient) { }

  getCustomers(): Observable<ApiResponse<CustomerDto[]>> {
    return this.http.get<ApiResponse<CustomerDto[]>>(`${this.apiUrl}/customers`);
  }

  createCustomer(request: CreateCustomerRequest): Observable<ApiResponse<CustomerDto>> {
    return this.http.post<ApiResponse<CustomerDto>>(`${this.apiUrl}/customers`, request);
  }

  updateCustomer(id: number, request: CreateCustomerRequest): Observable<ApiResponse<CustomerDto>> {
    return this.http.put<ApiResponse<CustomerDto>>(`${this.apiUrl}/customers/${id}`, request);
  }

  deleteCustomer(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/customers/${id}`);
  }

  getServices(): Observable<ApiResponse<ServiceDto[]>> {
    return this.http.get<ApiResponse<ServiceDto[]>>(`${this.apiUrl}/services`);
  }

  createService(request: CreateServiceRequest): Observable<ApiResponse<ServiceDto>> {
    return this.http.post<ApiResponse<ServiceDto>>(`${this.apiUrl}/services`, request);
  }

  updateService(id: number, request: CreateServiceRequest): Observable<ApiResponse<ServiceDto>> {
    return this.http.put<ApiResponse<ServiceDto>>(`${this.apiUrl}/services/${id}`, request);
  }

  deleteService(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/services/${id}`);
  }

  getProducts(): Observable<ApiResponse<ProductDto[]>> {
    return this.http.get<ApiResponse<ProductDto[]>>(`${this.apiUrl}/products`);
  }

  createProduct(request: CreateProductRequest): Observable<ApiResponse<ProductDto>> {
    return this.http.post<ApiResponse<ProductDto>>(`${this.apiUrl}/products`, request);
  }

  updateProduct(id: number, request: CreateProductRequest): Observable<ApiResponse<ProductDto>> {
    return this.http.put<ApiResponse<ProductDto>>(`${this.apiUrl}/products/${id}`, request);
  }

  deleteProduct(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/products/${id}`);
  }

  getDebtList(): Observable<ApiResponse<CustomerDebtDto[]>> {
    return this.http.get<ApiResponse<CustomerDebtDto[]>>(`${this.apiUrl}/debt-list`);
  }

  getCustomerUnpaidTransactions(customerId: number | null, customerName: string): Observable<ApiResponse<TransactionDto[]>> {
    const params: any = { customerName };
    if (customerId) params.customerId = customerId;
    return this.http.get<ApiResponse<TransactionDto[]>>(`${this.apiUrl}/customer-unpaid-transactions`, { params });
  }

  payDebt(request: PayDebtRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/pay-debt`, request);
  }

  finishTreatment(customerId: number): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/customers/${customerId}/finish-treatment`, {});
  }

  calculateRefund(customerId: number): Observable<ApiResponse<RefundCalculationDto>> {
    return this.http.get<ApiResponse<RefundCalculationDto>>(`${this.apiUrl}/customers/${customerId}/calculate-refund`);
  }

  processRefund(customerId: number, request: ProcessRefundRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/customers/${customerId}/process-refund`, request);
  }

  getRefundList(): Observable<ApiResponse<TransactionDto[]>> {
    return this.http.get<ApiResponse<TransactionDto[]>>(`${this.apiUrl}/refund-list`);
  }
}
