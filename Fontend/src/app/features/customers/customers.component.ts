import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { ManagementService } from '../../services/management.service';
import { TransactionService } from '../../services/transaction.service';
import { WorkService } from '../../services/work.service';
import { CustomerDto, CreateCustomerRequest } from '../../shared/models/customer.model';
import { TransactionDto } from '../../shared/models/transaction.model';
import { WorkLogDto } from '../../services/work.service';
import { RefundCalculationDto } from '../../shared/models/management.model';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    MatTableModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './customers.component.html',
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
export class CustomersComponent implements OnInit {
  customers: CustomerDto[] = [];
  filteredCustomers: CustomerDto[] = [];
  searchTerm: string = '';

  showAddModal = false;
  customerForm: FormGroup;
  isSubmitting = false;
  selectedCustomer: CustomerDto | null = null;

  toastMessage: string | null = null;
  toastType: 'success' | 'error' = 'success';

  // Refund
  showRefundModal = false;
  refundCalc: RefundCalculationDto | null = null;
  isProcessingRefund = false;
  refundNotes = '';
  refundType: 'single' | 'package' = 'single';

  // History
  showHistoryModal = false;
  isLoadingHistory = false;
  customerHistory: { transactions: TransactionDto[], workLogs: WorkLogDto[] } = { transactions: [], workLogs: [] };
  historyCustomerName = '';

  get calculatedUsedCost(): number {
    if (!this.refundCalc) return 0;
    if (this.refundType === 'single') {
      return this.refundCalc.sessionsDone * this.refundCalc.singlePrice;
    } else {
      const pricePerSession = this.refundCalc.totalSessions > 0 
        ? this.refundCalc.packagePrice / this.refundCalc.totalSessions 
        : 0;
      return this.refundCalc.sessionsDone * pricePerSession;
    }
  }

  get calculatedRefundAmount(): number {
    if (!this.refundCalc) return 0;
    const refund = this.refundCalc.paidAmount - this.calculatedUsedCost;
    return refund > 0 ? refund : 0;
  }

  constructor(
    private managementService: ManagementService,
    private transactionService: TransactionService,
    private workService: WorkService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.customerForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      phoneNumber: ['', [Validators.pattern(/^[0-9]{10}$/)]],
      address: ['']
    });
  }

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.managementService.getCustomers().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.customers = response.data;
          this.filterCustomers();
        }
      },
      error: (err) => console.error('Lỗi khi tải danh sách khách hàng:', err)
    });
  }

  filterCustomers(): void {
    if (!this.searchTerm) {
      this.filteredCustomers = [...this.customers];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredCustomers = this.customers.filter(c =>
        c.fullName.toLowerCase().includes(term) ||
        c.phoneNumber?.includes(term) ||
        c.address?.toLowerCase().includes(term)
      );
    }
    this.cdr.detectChanges();
  }

  onSubmit(): void {
    if (this.customerForm.valid) {
      this.isSubmitting = true;
      const request: CreateCustomerRequest = this.customerForm.value;

      const operation = this.selectedCustomer
        ? this.managementService.updateCustomer(this.selectedCustomer.id, request)
        : this.managementService.createCustomer(request);

      operation.subscribe({
        next: (response) => {
          if (response.success) {
            this.showToast(this.selectedCustomer ? 'Cập nhật thông tin thành công!' : 'Thêm khách hàng thành công!', 'success');
            this.toggleAddModal();
            this.loadCustomers();
          } else {
            this.showToast('Có lỗi xảy ra, vui lòng thử lại!', 'error');
          }
          this.isSubmitting = false;
        },
        error: (err) => {
          console.error('Lỗi khi lưu khách hàng:', err);
          this.showToast('Lưu thông tin thất bại!', 'error');
          this.isSubmitting = false;
        }
      });
    }
  }

  editCustomer(customer: CustomerDto): void {
    this.selectedCustomer = customer;
    this.customerForm.patchValue({
      fullName: customer.fullName,
      phoneNumber: customer.phoneNumber,
      address: customer.address
    });
    this.showAddModal = true;
  }

  deleteCustomer(id: number): void {
    if (confirm('Bạn có chắc chắn muốn xóa khách hàng này?')) {
      this.managementService.deleteCustomer(id).subscribe({
        next: (response) => {
          if (response.success) {
            this.showToast('Xóa khách hàng thành công!', 'success');
            this.loadCustomers();
          }
        },
        error: (err) => {
          console.error('Lỗi khi xóa khách hàng:', err);
          this.showToast('Xóa khách hàng thất bại!', 'error');
        }
      });
    }
  }

  toggleAddModal(): void {
    this.showAddModal = !this.showAddModal;
    if (!this.showAddModal) {
      this.customerForm.reset();
      this.selectedCustomer = null;
    }
  }

  finishTreatment(id: number): void {
    if (confirm('Bạn có chắc chắn muốn kết thúc liệu trình này?')) {
      this.managementService.finishTreatment(id).subscribe({
        next: (response) => {
          if (response.success) {
            this.showToast('Kết thúc liệu trình thành công!', 'success');
            this.loadCustomers();
          }
        }
      });
    }
  }

  startRefund(customerId: number): void {
    this.managementService.calculateRefund(customerId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.refundCalc = response.data;
          this.selectedCustomer = this.customers.find(c => c.id === customerId) || null;
          this.showRefundModal = true;
          this.refundNotes = 'Dừng liệu trình sớm và hoàn tiền';
          this.refundType = 'single'; // Mặc định tính theo giá lẻ
          this.cdr.detectChanges();
        }
      }
    });
  }

  confirmRefund(): void {
    if (!this.selectedCustomer || !this.refundCalc) return;

    this.isProcessingRefund = true;
    this.managementService.processRefund(this.selectedCustomer.id, {
      refundAmount: this.calculatedRefundAmount,
      notes: this.refundNotes
    }).subscribe({
      next: (response) => {
        this.isProcessingRefund = false;
        if (response.success) {
          this.showToast('Đã dừng liệu trình và tính tiền hoàn lại!', 'success');
          this.showRefundModal = false;
          this.loadCustomers();
        }
      },
      error: () => {
        this.isProcessingRefund = false;
        this.showToast('Có lỗi xảy ra khi xử lý.', 'error');
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

  hasTreatment(progress: string | null | undefined): boolean {
    if (!progress) return false;
    const p = progress.trim().toLowerCase();
    return p !== 'chưa đăng ký' && p !== 'không sử dụng liệu trình' && p !== 'chưa bắt đầu' && p !== '';
  }

  getTreatmentPercentage(progress: string | null | undefined): number {
    if (!this.hasTreatment(progress) || !progress) return 0;

    if (progress.includes('/')) {
      const parts = progress.split('/');
      if (parts.length === 2) {
        const current = parseInt(parts[0].trim(), 10);
        const total = parseInt(parts[1].trim(), 10);
        if (!isNaN(current) && !isNaN(total) && total > 0) {
          return Math.min(100, Math.round((current / total) * 100));
        }
      }
    }

    return 100;
  }

  viewCustomerHistory(customerId: number): void {
    const customer = this.customers.find(c => c.id === customerId);
    if (!customer) return;

    this.historyCustomerName = customer.fullName;
    this.isLoadingHistory = true;
    this.showHistoryModal = true;
    this.customerHistory = { transactions: [], workLogs: [] };

    // Tải giao dịch (Tài chính)
    this.transactionService.getTransactions(1000).subscribe(res => {
      if (res.success && res.data) {
        this.customerHistory.transactions = res.data.filter(t => 
          (t.customerId && t.customerId === customerId) || 
          (t.customerName === this.historyCustomerName)
        );
        this.cdr.detectChanges();
      }
    });

    // Tải nhật ký công việc (Hoạt động)
    this.workService.getWorkLogs().subscribe(res => {
      if (res.success && res.data) {
        this.customerHistory.workLogs = res.data.filter(w => w.customerId === customerId);
        this.isLoadingHistory = false;
        this.cdr.detectChanges();
      }
    });
  }

  get combinedHistory(): any[] {
    const items: any[] = [];

    this.customerHistory.transactions.forEach(t => {
      items.push({
        date: t.date,
        type: 'Financial',
        label: t.type === 'Package' ? 'Mua gói liệu trình' : 
               t.type === 'Product' ? 'Mua sản phẩm' : 
               t.type === 'Refund' ? 'Hoàn tiền' : 'Giao dịch lẻ',
        itemName: t.itemName,
        amount: t.paidAmount,
        paymentMethod: t.paymentMethod,
        debtAmount: t.debt,
        status: t.status,
        color: t.type === 'Refund' ? 'rose' : (t.type === 'Package' ? 'primary' : 'emerald')
      });
    });

    this.customerHistory.workLogs.forEach(w => {
      items.push({
        date: w.date,
        type: 'Operational',
        label: w.isTreatment ? 'Làm liệu trình' : 'Làm dịch vụ lẻ',
        itemName: w.serviceName,
        amount: 0,
        paymentMethod: w.paymentMethod,
        notes: w.notes,
        color: 'indigo'
      });
    });

    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
}
