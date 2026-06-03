import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../shared/models/api-response.model';
import {
  TransactionDto,
  CreateTransactionRequest,
  ExpenseDto,
  CreateExpenseRequest
} from '../shared/models/transaction.model';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private apiUrl = 'https://localhost:7196/api/Transaction';

  constructor(private http: HttpClient) { }

  getTransactions(count: number = 50): Observable<ApiResponse<TransactionDto[]>> {
    return this.http.get<ApiResponse<TransactionDto[]>>(`${this.apiUrl}?count=${count}`);
  }

  createTransaction(request: CreateTransactionRequest): Observable<ApiResponse<TransactionDto>> {
    return this.http.post<ApiResponse<TransactionDto>>(this.apiUrl, request);
  }

  getExpenses(): Observable<ApiResponse<ExpenseDto[]>> {
    return this.http.get<ApiResponse<ExpenseDto[]>>(`${this.apiUrl}/expenses`);
  }

  createExpense(request: CreateExpenseRequest): Observable<ApiResponse<ExpenseDto>> {
    return this.http.post<ApiResponse<ExpenseDto>>(`${this.apiUrl}/expenses`, request);
  }
}
