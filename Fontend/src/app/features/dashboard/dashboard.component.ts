import { Component, OnInit, ChangeDetectorRef, ViewChildren, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { DashboardService } from '../../services/dashboard.service';
import { StatCard, Transaction, CustomerProgress, DashboardData, CustomerServed } from '../../shared/models/dashboard.model';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ApiResponse } from '../../shared/models/api-response.model';
import { ExportService } from '../../services/export.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    BaseChartDirective,
    MatTableModule,
    MatProgressBarModule,
    FormsModule
  ],
  template: `
    <div id="dashboard-content" class="p-8 space-y-8 animate-in fade-in duration-700 bg-[#f0fdfa]">
      <!-- Header Section -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-black text-[#2c7a7b] tracking-tight flex items-center gap-2">
            <lucide-icon name="heart" class="text-[#4fd1c5] animate-soft-pulse"></lucide-icon>
            Báo cáo Phương Anh
          </h1>
          <p class="text-slate-400 mt-1 font-bold">Ngày mới rạng rỡ, thư giãn cùng Phương Anh nào! ✨</p>
        </div>

        <!-- Date Filter -->
        <div class="flex flex-wrap items-center gap-4 bg-white p-4 rounded-[2rem] border-2 border-teal-50 shadow-mint">
          <div class="flex items-center gap-2">
            <span class="text-[10px] font-black text-[#4fd1c5] uppercase tracking-widest">Từ</span>
            <input type="date" [(ngModel)]="startDate" (change)="onFilterChange()"
              class="px-4 py-2 bg-teal-50/30 border border-teal-100 rounded-2xl text-sm font-bold text-slate-600 focus:ring-4 focus:ring-teal-100 outline-none transition-all">
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[10px] font-black text-[#4fd1c5] uppercase tracking-widest">Đến</span>
            <input type="date" [(ngModel)]="endDate" (change)="onFilterChange()"
              class="px-4 py-2 bg-teal-50/30 border border-teal-100 rounded-2xl text-sm font-bold text-slate-600 focus:ring-4 focus:ring-teal-100 outline-none transition-all">
          </div>
          <div class="h-8 w-px bg-teal-100 mx-2 hidden md:block"></div>
          <div class="flex items-center gap-2">
            <button (click)="setFilter('thisMonth')" 
              class="px-4 py-2 text-xs font-black rounded-xl transition-all"
              [class.bg-[#4fd1c5]]="filterType === 'thisMonth'" [class.text-white]="filterType === 'thisMonth'" [class.text-teal-300]="filterType !== 'thisMonth'">Tháng này</button>
            <button (click)="setFilter('lastMonth')" 
              class="px-4 py-2 text-xs font-black rounded-xl transition-all"
              [class.bg-[#4fd1c5]]="filterType === 'lastMonth'" [class.text-white]="filterType === 'lastMonth'" [class.text-teal-300]="filterType !== 'lastMonth'">Tháng trước</button>
          </div>
          <button (click)="exportPdf()" 
            class="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#4fd1c5] to-[#319795] text-white rounded-2xl text-sm font-black shadow-lg shadow-teal-200 hover:scale-105 active:scale-95 transition-all">
            <lucide-icon name="heart" [size]="18"></lucide-icon>
            Xuất PDF
          </button>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-6">
        <div *ngFor="let card of statCards; let i = index" 
             class="relative overflow-hidden bg-white p-6 rounded-[2.5rem] border-2 border-slate-50 shadow-mint group hover:-translate-y-2 transition-all duration-500">
          <div class="flex items-start justify-between">
            <div [class]="card.color + ' p-3 rounded-2xl text-white shadow-lg shadow-opacity-20 transition-transform group-hover:scale-110'">
              <lucide-icon [name]="card.icon" class="w-6 h-6" [class.animate-soft-pulse]="true"></lucide-icon>
            </div>
            <div [class]="card.change > 0 ? 'text-emerald-500 bg-emerald-50' : 'text-rose-500 bg-rose-50'" 
                 class="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter">
              <span>{{ card.change > 0 ? '+' : '' }}{{ card.change }}%</span>
            </div>
          </div>
          <div class="mt-6">
            <h3 class="text-slate-400 text-[10px] font-black uppercase tracking-widest">{{ card.title }}</h3>
            <p class="text-xl font-black text-slate-700 mt-1">{{ card.value }}</p>
          </div>
          <!-- Mint Progress Bar -->
          <div class="mt-4 w-full h-1.5 bg-slate-50 rounded-full overflow-hidden">
             <div class="h-full transition-all duration-1000 rounded-full" [style.width]="'70%'" [class]="card.color"></div>
          </div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Revenue Chart -->
        <div class="lg:col-span-2 bg-white p-8 rounded-[3rem] border-2 border-teal-50 shadow-mint">
          <div class="flex items-center justify-between mb-8">
            <h3 class="text-lg font-black text-slate-700 flex items-center gap-2">
               <lucide-icon name="bar-chart-3" class="text-[#4fd1c5]"></lucide-icon>
               Doanh thu
            </h3>
          </div>
          <div class="h-[300px]">
            <canvas baseChart
              [data]="barChartData"
              [options]="barChartOptions"
              [type]="'bar'">
            </canvas>
          </div>
        </div>

        <!-- Service Distribution -->
        <div class="bg-white p-8 rounded-[3rem] border-2 border-teal-50 shadow-mint">
          <h3 class="text-lg font-black text-slate-700 mb-8 flex items-center gap-2">
             <lucide-icon name="pie-chart" class="text-[#38b2ac]"></lucide-icon>
             Cơ cấu dịch vụ
          </h3>
          <div class="h-[250px] relative">
            <canvas baseChart
              [data]="doughnutChartData"
              [options]="doughnutChartOptions"
              [type]="'doughnut'">
            </canvas>
          </div>
          <div class="mt-8 space-y-3">
             <div *ngFor="let item of serviceDist" class="flex items-center justify-between text-xs p-3 bg-teal-50/20 rounded-2xl border border-teal-50/50">
                <span class="flex items-center gap-2 font-bold text-slate-600">
                  <span [class]="item.color" class="w-3 h-3 rounded-full shadow-sm"></span>
                  {{ item.label }}
                </span>
                <span class="font-black text-slate-900">{{ item.value }}%</span>
             </div>
          </div>
        </div>
      </div>

      <!-- Customer Served Table -->
      <div class="bg-white rounded-3xl border border-slate-200 shadow-premium overflow-hidden">
        <div class="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 class="text-lg font-bold text-slate-900">Khách hàng đã phục vụ (trong kỳ lọc)</h3>
          <span class="px-3 py-1 bg-primary-50 text-primary-600 rounded-full text-xs font-bold">
            {{ customersServed.length }} khách
          </span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead>
              <tr class="bg-slate-50/50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th class="px-8 py-5">Ngày giờ</th>
                <th class="px-6 py-5">Khách hàng</th>
                <th class="px-6 py-5">Dịch vụ / Sản phẩm</th>
                <th class="px-6 py-5">Phân loại</th>
                <th class="px-8 py-5 text-right">Doanh thu</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr *ngIf="customersServed.length === 0">
                <td colspan="5" class="px-8 py-10 text-center text-slate-400 italic">Không có dữ liệu phục vụ trong khoảng thời gian này.</td>
              </tr>
              <tr *ngFor="let c of customersServed" class="hover:bg-slate-50/80 transition-colors">
                <td class="px-8 py-4 text-sm text-slate-500 tabular-nums">{{ c.date | date:'dd/MM/yyyy' }}</td>
                <td class="px-6 py-4 font-bold text-slate-900">{{ c.customerName }}</td>
                <td class="px-6 py-4 text-sm text-slate-700 font-medium">{{ c.serviceName }}</td>
                <td class="px-6 py-4">
                   <span [ngClass]="c.type === 'Liệu trình' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'"
                         class="px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                     {{ c.type }}
                   </span>
                </td>
                <td class="px-8 py-4 text-right font-bold text-primary-600">
                  {{ c.revenue > 0 ? (c.revenue | number:'1.0-0') + 'đ' : '-' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    ::ng-deep .mat-mdc-progress-bar {
      --mdc-linear-progress-active-indicator-color: #06b6d4;
      --mdc-linear-progress-track-color: #ecfeff;
    }
  `]
})
export class DashboardComponent implements OnInit {
  @ViewChildren(BaseChartDirective) charts: QueryList<BaseChartDirective> | undefined;
  statCards: StatCard[] = [];
  transactions: Transaction[] = [];
  progress: CustomerProgress[] = [];
  customersServed: CustomerServed[] = [];

  startDate: string = '';
  endDate: string = '';
  filterType: string = 'thisMonth';
  serviceDist = [
    { label: 'Liệu trình', value: 45, color: 'bg-primary-500' },
    { label: 'Sản phẩm', value: 30, color: 'bg-secondary-400' },
    { label: 'Dịch vụ lẻ', value: 25, color: 'bg-cyan-400' },
  ];

  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        padding: 12,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        cornerRadius: 8,
        displayColors: false
      }
    },
    scales: {
      x: { grid: { display: false } },
      y: {
        beginAtZero: true,
        max: 100000000,
        ticks: {
          stepSize: 20000000,
          callback: (value) => (Number(value) / 1000000) + ' Tr'
        }
      }
    }
  };

  public barChartData: ChartData<'bar'> = {
    labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
    datasets: [
      {
        data: [65, 59, 80, 81, 56, 55, 40],
        backgroundColor: '#06b6d4',
        borderRadius: 8,
        barThickness: 24,
      }
    ]
  };

  public doughnutChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    }
  };

  public doughnutChartData: ChartData<'doughnut'> = {
    labels: ['Liệu trình', 'Sản phẩm', 'Dịch vụ lẻ'],
    datasets: [{
      data: [45, 30, 25],
      backgroundColor: ['#06b6d4', '#f43f5e', '#22d3ee'],
      borderWidth: 0,
      hoverOffset: 4
    }]
  };

  constructor(
    private dashboardService: DashboardService,
    private exportService: ExportService,
    private cdr: ChangeDetectorRef
  ) { }

  exportPdf(): void {
    this.exportService.exportPdf('dashboard-content', 'Bao_cao_dashboard');
  }

  ngOnInit(): void {
    this.setFilter('thisMonth');
  }

  setFilter(type: string): void {
    this.filterType = type;
    const now = new Date();
    let start = new Date(now.getFullYear(), now.getMonth(), 1);
    let end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    if (type === 'lastMonth') {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0);
    } else if (type === 'thisYear') {
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date();
    }

    this.startDate = this.formatDateForInput(start);
    this.endDate = this.formatDateForInput(end);
    this.loadDashboardData();
  }

  onFilterChange(): void {
    this.filterType = 'custom';
    this.loadDashboardData();
  }

  private formatDateForInput(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  private loadDashboardData(): void {
    this.dashboardService.getDashboardData(this.startDate, this.endDate).subscribe({
      next: (res: ApiResponse<DashboardData>) => {
        const data = res.data;
        if (!data) return;

        this.statCards = [
          {
            title: 'TỔNG DOANH THU',
            value: this.formatCurrency(data.totalRevenue),
            change: 0,
            icon: 'dollar-sign',
            color: 'bg-indigo-500',
            trendData: []
          },
          {
            title: 'Doanh thu Dịch vụ',
            value: this.formatCurrency(data.serviceRevenue),
            change: 0,
            icon: 'activity',
            color: 'bg-primary-500',
            trendData: []
          },
          {
            title: 'Doanh thu Sản phẩm',
            value: this.formatCurrency(data.productRevenue),
            change: 0,
            icon: 'shopping-cart',
            color: 'bg-secondary-400',
            trendData: []
          },
          {
            title: 'Hoàn tiền',
            value: this.formatCurrency(data.refundAmount),
            change: 0,
            icon: 'refresh-cw',
            color: 'bg-rose-500',
            trendData: []
          },
          {
            title: 'Chi phí tháng',
            value: this.formatCurrency(data.monthlyExpense),
            change: 0,
            icon: 'credit-card',
            color: 'bg-amber-400',
            trendData: []
          },
          {
            title: 'Lợi nhuận ròng',
            value: this.formatCurrency(data.profit),
            change: 0,
            icon: 'trending-up',
            color: 'bg-emerald-600',
            trendData: []
          }
        ];

        if (data.barChartData && Array.isArray(data.barChartData)) {
          this.barChartData = {
            labels: data.barChartData.map(d => d.day),
            datasets: [{
              ...this.barChartData.datasets[0],
              data: data.barChartData.map(d => d.revenue)
            }]
          };
        }

        this.serviceDist = data.serviceDistribution ? data.serviceDistribution.map(d => ({
          label: d.label,
          value: d.percentage,
          color: d.color
        })) : [];

        if (data.serviceDistribution && Array.isArray(data.serviceDistribution)) {
          this.doughnutChartData = {
            labels: data.serviceDistribution.map(d => d.label),
            datasets: [{
              ...this.doughnutChartData.datasets[0],
              data: data.serviceDistribution.map(d => d.percentage),
              backgroundColor: data.serviceDistribution.map(d => this.getColorHex(d.color))
            }]
          };
        }

        this.progress = data.customerProgress;
        this.customersServed = data.customersServed || [];

        this.cdr.detectChanges();
        this.charts?.forEach(c => c.update());
      },
      error: (err) => console.error('Lỗi khi tải dữ liệu dashboard:', err)
    });
  }

  private formatCurrency(value: any): string {
    const num = Number(value) || 0;
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(num);
  }

  private getColorHex(tailwindClass: string): string {
    const colors: { [key: string]: string } = {
      'bg-primary-500': '#06b6d4',
      'bg-secondary-400': '#f43f5e',
      'bg-cyan-400': '#22d3ee',
      'bg-amber-400': '#fbbf24',
      'bg-rose-400': '#fb7185'
    };
    return colors[tailwindClass] || '#cbd5e1';
  }
}
