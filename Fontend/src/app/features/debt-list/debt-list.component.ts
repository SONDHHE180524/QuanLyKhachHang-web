import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { ManagementService } from '../../services/management.service';
import { CustomerDebtDto, PayDebtRequest } from '../../shared/models/management.model';
import { TransactionDto } from '../../shared/models/transaction.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-debt-list',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule],
  template: `
    <div class="p-8 animate-fade-in">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 class="text-3xl font-bold text-slate-900 tracking-tight">Danh sách nợ</h1>
          <p class="text-slate-500 mt-1">Theo dõi và quản lý công nợ khách hàng</p>
        </div>
        
        <div class="flex items-center gap-3">
          
          <button (click)="loadDebtList()" class="p-2 text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
            <lucide-icon [name]="'refresh-cw'" class="w-4 h-4"></lucide-icon>
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="glass-effect p-6 rounded-2xl border border-rose-100 shadow-sm">
          <div class="flex items-center gap-4">
            <div class="p-3 bg-rose-50 rounded-xl text-rose-600">
              <lucide-icon [name]="'wallet'" class="w-6 h-6"></lucide-icon>
            </div>
            <div>
              <p class="text-sm font-medium text-slate-500">Tổng công nợ</p>
              <h3 class="text-2xl font-bold text-slate-900">{{ totalDebt | number:'1.0-0' }}đ</h3>
            </div>
          </div>
        </div>
        
        <div class="glass-effect p-6 rounded-2xl border border-amber-100 shadow-sm">
          <div class="flex items-center gap-4">
            <div class="p-3 bg-amber-50 rounded-xl text-amber-600">
              <lucide-icon [name]="'users'" class="w-6 h-6"></lucide-icon>
            </div>
            <div>
              <p class="text-sm font-medium text-slate-500">Khách hàng nợ</p>
              <h3 class="text-2xl font-bold text-slate-900">{{ debtList.length }} khách</h3>
            </div>
          </div>
        </div>

        <div class="glass-effect p-6 rounded-2xl border border-primary-100 shadow-sm">
          <div class="flex items-center gap-4">
            <div class="p-3 bg-primary-50 rounded-xl text-primary-600">
              <lucide-icon [name]="'calendar'" class="w-6 h-6"></lucide-icon>
            </div>
            <div>
              <p class="text-sm font-medium text-slate-500">Nợ phát sinh gần nhất</p>
              <h3 class="text-lg font-bold text-slate-900">{{ lastDebtUpdate | date:'dd/MM/yyyy' }}</h3>
            </div>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="glass-effect rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead>
              <tr class="border-b border-slate-100 bg-slate-50/50">
                <th class="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Khách hàng</th>
                <th class="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Số điện thoại</th>
                <th class="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Tổng nợ</th>
                <th class="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ngày giao dịch cuối</th>
                <th class="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr *ngIf="isLoading">
                <td colspan="5" class="px-6 py-12 text-center">
                  <div class="flex flex-col items-center gap-3">
                    <lucide-icon [name]="'refresh-cw'" class="w-8 h-8 text-primary-500 animate-spin"></lucide-icon>
                    <p class="text-slate-500 font-medium">Đang tải dữ liệu...</p>
                  </div>
                </td>
              </tr>

              <ng-container *ngIf="!isLoading">
                <tr *ngFor="let item of filteredDebtList" class="hover:bg-slate-50/50 transition-colors group">
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                        {{ item.customerName.charAt(0).toUpperCase() }}
                      </div>
                      <div>
                        <p class="font-bold text-slate-900">{{ item.customerName }}</p>
                        <p class="text-xs text-slate-500">ID: #{{ item.customerId || 'N/A' }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-slate-600">
                    {{ item.phoneNumber || '---' }}
                  </td>
                  <td class="px-6 py-4 text-right">
                    <span class="inline-flex px-3 py-1 rounded-full bg-rose-50 text-rose-600 font-bold text-sm">
                      {{ item.totalDebt | number:'1.0-0' }}đ
                    </span>
                  </td>
                  <td class="px-6 py-4 text-slate-600">
                    {{ item.lastTransactionDate | date:'dd/MM/yyyy' }}
                  </td>
                  <td class="px-6 py-4 text-right">
                    <button (click)="viewTransactions(item)" class="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all" title="Xem chi tiết">
                      <lucide-icon [name]="'eye'" class="w-5 h-5"></lucide-icon>
                    </button>
                    <button (click)="openPaymentModal(item)" class="p-2 text-slate-400 hover:text-secondary-600 hover:bg-secondary-50 rounded-lg transition-all" title="Thu nợ">
                      <lucide-icon [name]="'badge-dollar-sign'" class="w-5 h-5"></lucide-icon>
                    </button>
                  </td>
                </tr>
                
                <tr *ngIf="filteredDebtList.length === 0">
                  <td colspan="5" class="px-6 py-12 text-center text-slate-500">
                    <div class="flex flex-col items-center gap-2">
                      <lucide-icon [name]="'info'" class="w-8 h-8 opacity-20"></lucide-icon>
                      <p>Không có dữ liệu nợ khách hàng.</p>
                    </div>
                  </td>
                </tr>
              </ng-container>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Detail Modal -->
      <div *ngIf="showDetailsModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
        <div (click)="showDetailsModal = false" class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></div>
        <div class="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
          <div class="flex items-center justify-between p-6 border-b border-slate-100">
            <div>
              <h2 class="text-xl font-bold text-slate-900">Chi tiết nợ: {{ selectedCustomerName }}</h2>
              <p class="text-sm text-slate-500">Danh sách các giao dịch chưa thanh toán hết</p>
            </div>
            <button (click)="showDetailsModal = false" class="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <lucide-icon [name]="'x'" class="w-6 h-6 text-slate-400"></lucide-icon>
            </button>
          </div>

          <div class="p-6 max-h-[70vh] overflow-y-auto">
            <div *ngIf="isLoadingDetails" class="py-12 text-center">
              <lucide-icon [name]="'refresh-cw'" class="w-8 h-8 text-primary-500 animate-spin mx-auto mb-4"></lucide-icon>
              <p class="text-slate-500 font-medium">Đang tải chi tiết...</p>
            </div>

            <div *ngIf="!isLoadingDetails" class="space-y-4">
              <div *ngFor="let t of selectedCustomerTransactions" class="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 gap-4">
                <div class="flex items-center gap-4">
                  <div class="p-3 bg-white rounded-xl shadow-sm">
                    <lucide-icon [name]="t.type === 'Product' ? 'package' : 'sparkles'" class="w-5 h-5 text-primary-500"></lucide-icon>
                  </div>
                  <div>
                    <h4 class="font-bold text-slate-900">{{ t.itemName }}</h4>
                    <div class="flex items-center gap-2 text-xs text-slate-500">
                      <span>{{ t.date | date:'dd/MM/yyyy' }}</span>
                      <span>•</span>
                      <span class="uppercase tracking-wide font-bold text-[10px]">{{ t.type }}</span>
                    </div>
                  </div>
                </div>

                <div class="flex items-center gap-8">
                  <div class="text-right">
                    <p class="text-xs text-slate-500">Tổng tiền</p>
                    <p class="font-bold text-slate-900">{{ t.totalAmount | number:'1.0-0' }}đ</p>
                  </div>
                  <div class="text-right">
                    <p class="text-xs text-slate-500">Đã trả</p>
                    <p class="font-bold text-emerald-600">{{ t.paidAmount | number:'1.0-0' }}đ</p>
                  </div>
                  <div class="text-right px-4 py-2 bg-rose-50 rounded-xl">
                    <p class="text-xs text-rose-500 font-bold">Cần thu</p>
                    <p class="font-bold text-rose-600">{{ t.debt | number:'1.0-0' }}đ</p>
                  </div>
                </div>
              </div>

              <div *ngIf="selectedCustomerTransactions.length === 0" class="py-12 text-center text-slate-500">
                <p>Không tìm thấy giao dịch nợ nào cho khách hàng này.</p>
              </div>
            </div>
          </div>

          <div class="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end">
            <button (click)="showDetailsModal = false" class="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors">
              Đóng
            </button>
          </div>
        </div>
      </div>

      <!-- Payment Modal -->
      <div *ngIf="showPaymentModal" class="fixed inset-0 z-[110] flex items-center justify-center p-4 animate-in fade-in duration-300">
        <div (click)="showPaymentModal = false" class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></div>
        <div class="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
          <div class="p-8">
            <h2 class="text-2xl font-bold text-slate-900 mb-2">Thu nợ khách hàng</h2>
            <p class="text-slate-500 text-sm mb-6">Nhập số tiền khách thanh toán cho {{ selectedCustomer?.customerName }}</p>
            
            <div class="space-y-6">
              <div class="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex justify-between items-center">
                <span class="text-sm font-medium text-amber-700">Tổng nợ hiện tại:</span>
                <span class="text-lg font-bold text-amber-900">{{ selectedCustomer?.totalDebt | number:'1.0-0' }}đ</span>
              </div>

              <div class="space-y-2">
                <label class="text-sm font-bold text-slate-700">Số tiền thanh toán (đ)</label>
                <div class="relative">
                  <input type="number" 
                         [(ngModel)]="paymentAmount"
                         class="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xl font-bold text-primary-600 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none">
                  <div class="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
                    <button (click)="paymentAmount = selectedCustomer?.totalDebt || 0" 
                            class="text-xs font-bold text-primary-600 hover:underline">Trả hết</button>
                  </div>
                </div>
              </div>

              <div class="flex gap-3 pt-4">
                <button (click)="showPaymentModal = false" 
                        class="flex-1 px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors">
                  Hủy
                </button>
                <button (click)="submitPayment()"
                        [disabled]="isSubmittingPayment || paymentAmount <= 0"
                        class="flex-1 px-6 py-3 bg-secondary-600 text-white rounded-xl font-bold shadow-lg shadow-secondary-500/30 hover:bg-secondary-700 transition-all disabled:opacity-50">
                  {{ isSubmittingPayment ? 'Đang lưu...' : 'Xác nhận' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Toast Notification -->
      <div *ngIf="toastMessage" 
           [class.bg-emerald-500]="toastType === 'success'"
           [class.bg-rose-500]="toastType === 'error'"
           class="fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 text-white rounded-2xl shadow-2xl z-[200] flex items-center gap-3 animate-in slide-in-from-bottom-8 duration-300">
        <lucide-icon [name]="toastType === 'success' ? 'check-circle-2' : 'alert-circle'" class="w-5 h-5"></lucide-icon>
        <span class="font-bold text-sm">{{ toastMessage }}</span>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .glass-effect {
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.3);
    }
  `]
})
export class DebtListComponent implements OnInit {
  debtList: CustomerDebtDto[] = [];
  filteredDebtList: CustomerDebtDto[] = [];
  searchTerm: string = '';
  totalDebt: number = 0;
  lastDebtUpdate: Date | null = null;
  isLoading: boolean = false;

  // Transaction details modal
  showDetailsModal: boolean = false;
  selectedCustomerName: string = '';
  selectedCustomerTransactions: TransactionDto[] = [];
  isLoadingDetails: boolean = false;

  // Payment modal
  showPaymentModal: boolean = false;
  paymentAmount: number = 0;
  selectedCustomer: CustomerDebtDto | null = null;
  isSubmittingPayment: boolean = false;

  // Toast
  toastMessage: string | null = null;
  toastType: 'success' | 'error' = 'success';

  constructor(
    private managementService: ManagementService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadDebtList();
  }

  loadDebtList(): void {
    this.isLoading = true;
    this.managementService.getDebtList().subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success && response.data) {
          this.debtList = response.data;
          this.calculateStats();
          this.filterDebtList();
        }
      },
      error: (err) => {
        console.error('Lỗi khi tải danh sách nợ:', err);
        this.isLoading = false;
      }
    });
  }

  viewTransactions(item: CustomerDebtDto): void {
    this.selectedCustomerName = item.customerName;
    this.showDetailsModal = true;
    this.isLoadingDetails = true;
    this.selectedCustomerTransactions = [];

    this.managementService.getCustomerUnpaidTransactions(item.customerId, item.customerName).subscribe({
      next: (response) => {
        this.isLoadingDetails = false;
        if (response.success && response.data) {
          this.selectedCustomerTransactions = response.data;
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Lỗi khi tải chi tiết nợ:', err);
        this.isLoadingDetails = false;
        this.cdr.detectChanges();
      }
    });
  }

  openPaymentModal(item: CustomerDebtDto): void {
    this.selectedCustomer = item;
    this.paymentAmount = item.totalDebt; // Default to full amount
    this.showPaymentModal = true;
  }

  submitPayment(): void {
    if (!this.selectedCustomer || this.paymentAmount <= 0) return;

    this.isSubmittingPayment = true;
    const request: PayDebtRequest = {
      customerId: this.selectedCustomer.customerId,
      customerName: this.selectedCustomer.customerName,
      amount: this.paymentAmount
    };

    this.managementService.payDebt(request).subscribe({
      next: (response) => {
        this.isSubmittingPayment = false;
        if (response.success) {
          this.showToast('Thanh toán nợ thành công!', 'success');
          this.showPaymentModal = false;
          this.loadDebtList(); // Refresh list

          // Also refresh details if open
          if (this.showDetailsModal && this.selectedCustomerName === this.selectedCustomer?.customerName) {
            this.viewTransactions(this.selectedCustomer);
          }
        } else {
          this.showToast(response.message || 'Có lỗi xảy ra khi thanh toán.', 'error');
        }
      },
      error: (err) => {
        this.isSubmittingPayment = false;
        this.showToast('Lỗi kết nối máy chủ.', 'error');
      }
    });
  }

  showToast(message: string, type: 'success' | 'error' = 'success'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.toastMessage = null;
      this.cdr.detectChanges();
    }, 3000);
  }

  calculateStats(): void {
    this.totalDebt = this.debtList.reduce((sum, item) => sum + item.totalDebt, 0);
    if (this.debtList.length > 0) {
      const dates = this.debtList
        .map(d => d.lastTransactionDate ? new Date(d.lastTransactionDate).getTime() : 0)
        .filter(t => t > 0);
      if (dates.length > 0) {
        this.lastDebtUpdate = new Date(Math.max(...dates));
      }
    }
  }

  filterDebtList(): void {
    if (!this.searchTerm) {
      this.filteredDebtList = [...this.debtList];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredDebtList = this.debtList.filter(d =>
        d.customerName.toLowerCase().includes(term) ||
        d.phoneNumber?.includes(term)
      );
    }
    this.cdr.detectChanges();
  }
}
