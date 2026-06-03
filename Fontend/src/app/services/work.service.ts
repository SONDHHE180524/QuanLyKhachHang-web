import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../shared/models/api-response.model';

export interface WorkLogDto {
  id: number;
  date: string;
  customerId: number | null;
  customerName: string;
  serviceId: number | null;
  serviceName: string;
  isTreatment: boolean;
  revenue: number;
  notes?: string;
  paymentMethod?: string;
  customerDebt?: number;
  dailyTotalRevenue?: number;
  isConsultedByPA?: boolean;
  consultantName?: string;
}

export interface CheckInRequest {
  customerId: number | null;
  customerName: string;
  serviceId: number | null;
  serviceName: string;
  isTreatment: boolean;
  isFreeSession?: boolean;
  notes?: string;
  paymentMethod?: string;
  date?: string;
  isConsultedByPA?: boolean;
  consultantName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class WorkService {
  private apiUrl = 'https://localhost:7196/api/Work';

  constructor(private http: HttpClient) {}

  getWorkLogs(from?: string, to?: string): Observable<ApiResponse<WorkLogDto[]>> {
    let url = this.apiUrl;
    if (from || to) {
      const params = new URLSearchParams();
      if (from) params.append('from', from);
      if (to) params.append('to', to);
      url += '?' + params.toString();
    }
    return this.http.get<ApiResponse<WorkLogDto[]>>(url);
  }

  checkIn(request: CheckInRequest): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.apiUrl}/checkin`, request);
  }
}
