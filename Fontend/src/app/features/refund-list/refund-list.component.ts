import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { ManagementService } from '../../services/management.service';
import { ExportService } from '../../services/export.service';
import { TransactionDto } from '../../shared/models/transaction.model';

@Component({
  selector: 'app-refund-list',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="p-8 animate-fade-in">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 class="text-3xl font-bold text-slate-900 tracking-tight">Danh sách hoàn tiền</h1>
          <p class="text-slate-500 mt-1">Theo dõi các khoản chi trả khi dừng liệu trình sớm</p>
        </div>
        
        <div class="flex items-center gap-3">
          <button (click)="exportExcel()" 
            class="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all">
            <lucide-icon name="file-spreadsheet" [size]="18"></lucide-icon>
            Xuất Excel
          </button>
          
          <button (click)="loadRefunds()" class="p-2 text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
            <lucide-icon [name]="'refresh-cw'" class="w-4 h-4" [class.animate-spin]="isLoading"></lucide-icon>
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="glass-effect p-6 rounded-2xl border border-emerald-100 shadow-sm">
          <div class="flex items-center gap-4">
            <div class="p-3 bg-emerald-50 rounded-xl text-emerald-600">
              <lucide-icon [name]="'refresh-cw'" class="w-6 h-6"></lucide-icon>
            </div>
            <div>
              <p class="text-sm font-medium text-slate-500">Tổng tiền đã hoàn</p>
              <h3 class="text-2xl font-bold text-slate-900">{{ totalRefund | number:'1.0-0' }}đ</h3>
            </div>
          </div>
        </div>
        
        <div class="glass-effect p-6 rounded-2xl border border-primary-100 shadow-sm">
          <div class="flex items-center gap-4">
            <div class="p-3 bg-primary-50 rounded-xl text-primary-600">
              <lucide-icon [name]="'users'" class="w-6 h-6"></lucide-icon>
            </div>
            <div>
              <p class="text-sm font-medium text-slate-500">Số lượt dừng sớm</p>
              <h3 class="text-2xl font-bold text-slate-900">{{ refunds.length }} lượt</h3>
            </div>
          </div>
        </div>
      </div>

      <div class="glass-effect rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead>
              <tr class="border-b border-slate-100 bg-slate-50/50">
                <th class="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ngày thực hiện</th>
                <th class="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Khách hàng</th>
                <th class="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Liệu trình</th>
                <th class="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Số tiền hoàn</th>
                <th class="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Trạng thái</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr *ngFor="let item of refunds" class="hover:bg-slate-50/50 transition-colors group">
                <td class="px-6 py-4 text-sm text-slate-600">
                  {{ item.date | date:'dd/MM/yyyy' }}
                </td>
                <td class="px-6 py-4 font-bold text-slate-900">
                  {{ item.customerName }}
                </td>
                <td class="px-6 py-4 text-slate-600">
                  {{ item.itemName }}
                </td>
                <td class="px-6 py-4 text-right">
                  <span class="font-bold text-emerald-600">
                    {{ item.paidAmount | number:'1.0-0' }}đ
                  </span>
                </td>
                <td class="px-6 py-4">
                  <span class="px-3 py-1 text-xs font-bold bg-emerald-50 text-emerald-600 rounded-full">
                    Đã tất toán
                  </span>
                </td>
              </tr>
              
              <tr *ngIf="refunds.length === 0 && !isLoading">
                <td colspan="5" class="px-6 py-12 text-center text-slate-500">
                  Không có dữ liệu hoàn tiền.
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
    .glass-effect {
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.3);
    }
  `]
})
export class RefundListComponent implements OnInit {
  refunds: TransactionDto[] = [];
  isLoading = false;
  totalRefund = 0;

  constructor(
    private managementService: ManagementService,
    private exportService: ExportService,
    private cdr: ChangeDetectorRef
  ) {}

  exportExcel(): void {
    const columns = [
      { header: 'NGÀY THỰC HIỆN', key: 'date', width: 25 },
      { header: 'KHÁCH HÀNG', key: 'customer', width: 30 },
      { header: 'LIỆU TRÌNH DỪNG', key: 'item', width: 50 },
      { header: 'SỐ TIỀN HOÀN', key: 'amount', width: 25 },
      { header: 'TRẠNG THÁI', key: 'status', width: 20 }
    ];

    const data = this.refunds.map(r => ({
      date: new Date(r.date!).toLocaleDateString('vi-VN'),
      customer: r.customerName,
      item: r.itemName,
      amount: (r.paidAmount || 0).toLocaleString('vi-VN') + 'đ',
      status: 'Đã tất toán'
    }));

    this.exportService.exportExcel(data, columns, 'Bao_cao_hoan_tien');
  }

  ngOnInit(): void {
    this.loadRefunds();
  }

  loadRefunds(): void {
    this.isLoading = true;
    this.managementService.getRefundList().subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success && response.data) {
          this.refunds = response.data;
          this.totalRefund = this.refunds.reduce((sum, r) => sum + r.paidAmount, 0);
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
