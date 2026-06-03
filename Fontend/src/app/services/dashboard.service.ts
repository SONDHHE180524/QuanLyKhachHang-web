import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardData } from '../shared/models/dashboard.model';
import { ApiResponse } from '../shared/models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'https://localhost:7196/api/Dashboard';

  constructor(private http: HttpClient) {}

  getDashboardData(from?: string, to?: string): Observable<ApiResponse<DashboardData>> {
    let url = this.apiUrl;
    if (from || to) {
      const params = new URLSearchParams();
      if (from) params.append('from', from);
      if (to) params.append('to', to);
      url += '?' + params.toString();
    }
    return this.http.get<ApiResponse<DashboardData>>(url);
  }
}
