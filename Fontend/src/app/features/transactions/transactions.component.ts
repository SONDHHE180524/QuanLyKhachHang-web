import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { TransactionService } from '../../services/transaction.service';
import { ManagementService } from '../../services/management.service';
import { ExportService } from '../../services/export.service';
import { TransactionDto, ExpenseDto, CreateTransactionRequest, CreateExpenseRequest } from '../../shared/models/transaction.model';
import { CustomerDto } from '../../shared/models/customer.model';
import { ServiceDto, ProductDto } from '../../shared/models/management.model';
import { WorkService, WorkLogDto } from '../../services/work.service';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './transactions.component.html',
  styles: [`
    :host { display: block; }
    .tab-active { @apply text-primary-600 border-b-2 border-primary-600; }
  `]
})
export class TransactionsComponent implements OnInit {
  activeTab: 'revenue' | 'expense' = 'revenue';
  transactions: TransactionDto[] = [];
  expenses: ExpenseDto[] = [];
  workLogs: WorkLogDto[] = [];

  // Lists for dropdowns
  customers: CustomerDto[] = [];
  services: ServiceDto[] = [];
  products: ProductDto[] = [];

  showSaleModal = false;
  showExpenseModal = false;

  saleForm: FormGroup;
  expenseForm: FormGroup;
  isSubmitting = false;

  constructor(
    private transactionService: TransactionService,
    private managementService: ManagementService,
    private workService: WorkService,
    private exportService: ExportService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.saleForm = this.fb.group({
      customerId: [null],
      customerName: ['', Validators.required],
      itemType: ['Service', Validators.required],
      itemId: [null, Validators.required],
      itemName: ['', Validators.required],
      isTreatmentPackage: [true],
      totalAmount: [0, [Validators.required, Validators.min(0)]],
      paidAmount: [0, [Validators.required, Validators.min(0)]],
      paymentMethod: ['Tiền mặt'],
      notes: ['']
    });

    this.expenseForm = this.fb.group({
      content: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(0)]]
    });
  }

  exportRevenueExcel(): void {
    const columns = [
      { header: 'NGÀY GIAO DỊCH', key: 'date', width: 25 },
      { header: 'KHÁCH HÀNG', key: 'customer', width: 30 },
      { header: 'NỘI DUNG', key: 'item', width: 50 },
      { header: 'LOẠI', key: 'type', width: 20 },
      { header: 'TỔNG TIỀN', key: 'total', width: 20 },
      { header: 'ĐÃ THANH TOÁN', key: 'paid', width: 20 },
      { header: 'HÌNH THỨC', key: 'method', width: 15 }
    ];

    const validTransactions = this.transactions.filter(t => 
      t.type === 'Package' || t.type === 'Product' || t.type === 'Refund' || t.type === 'Liệu trình' || t.type === 'Service' || t.isTreatmentPackage
    );

    // Xác định các khách hàng đã hoàn tiền (dừng liệu trình) để in đỏ
    const refundedCustomerNames = new Set(
      validTransactions.filter(t => t.type === 'Refund').map(t => t.customerName)
    );

    // --- SHEET 1: CÔNG VIỆC ---
    // 1. Khách làm Dịch vụ lẻ (Từ Công việc)
    const workRetail = this.workLogs
      .filter(w => !w.isTreatment)
      .sort((a, b) => new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime())
      .map(w => ({
        date: new Date(w.date || '').toLocaleDateString('vi-VN'),
        customer: w.customerName,
        item: w.serviceName,
        type: 'Dịch vụ lẻ',
        total: (w.revenue || 0).toLocaleString('vi-VN') + 'đ',
        paid: (w.revenue || 0).toLocaleString('vi-VN') + 'đ',
        method: '-'
      }));

    // 2. Khách làm theo liệu trình (Từ Công việc)
    const workSessions = this.workLogs
      .filter(w => w.isTreatment)
      .sort((a, b) => new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime())
      .map(w => ({
        date: new Date(w.date || '').toLocaleDateString('vi-VN'),
        customer: w.customerName,
        item: w.serviceName + (w.notes ? ' (' + w.notes + ')' : ''),
        type: 'Làm liệu trình',
        total: '0đ',
        paid: '0đ',
        method: '-'
      }));

    // --- SHEET 2: MUA HÀNG ---
    // 1. Danh sách khách mua liệu trình
    const packagePurchases = validTransactions
      .filter(t => t.type === 'Package' || t.type === 'Liệu trình' || t.isTreatmentPackage)
      .sort((a, b) => new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime())
      .map(t => {
        const isStopped = refundedCustomerNames.has(t.customerName);
        return {
          date: new Date(t.date || '').toLocaleDateString('vi-VN'),
          customer: t.customerName,
          item: t.itemName + ' (Mua gói)',
          type: 'Gói liệu trình',
          total: (t.totalAmount || 0).toLocaleString('vi-VN') + 'đ',
          paid: (t.paidAmount || 0).toLocaleString('vi-VN') + 'đ',
          method: t.paymentMethod || '-',
          _cellStyle: isStopped ? { customer: { color: 'FFFF0000' } } : null
        };
      });

    // 2. Danh sách mua sản phẩm
    const products = validTransactions
      .filter(t => t.type === 'Product')
      .sort((a, b) => new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime())
      .map(t => ({
        date: new Date(t.date || '').toLocaleDateString('vi-VN'),
        customer: t.customerName,
        item: t.itemName,
        type: 'Sản phẩm',
        total: (t.totalAmount || 0).toLocaleString('vi-VN') + 'đ',
        paid: (t.paidAmount || 0).toLocaleString('vi-VN') + 'đ',
        method: t.paymentMethod || '-'
      }));

    // --- SHEET 3: HOÀN TIỀN ---
    const refunds = validTransactions
      .filter(t => t.type === 'Refund')
      .sort((a, b) => new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime())
      .map(t => ({
        date: new Date(t.date || '').toLocaleDateString('vi-VN'),
        customer: t.customerName,
        item: t.itemName,
        type: 'Hoàn tiền',
        total: (t.totalAmount || 0).toLocaleString('vi-VN') + 'đ',
        paid: (t.paidAmount || 0).toLocaleString('vi-VN') + 'đ',
        method: t.paymentMethod || '-',
        _rowStyle: { color: 'FFFF0000' } // In đỏ cả dòng hoàn tiền
      }));

    const sheets = [
      { name: 'Công việc', columns, data: [...workRetail, ...workSessions] },
      { name: 'Mua hàng', columns, data: [...packagePurchases, ...products] },
      { name: 'Hoàn tiền', columns, data: refunds }
    ];

    this.exportService.exportMultiSheetExcel(sheets, 'Bao_cao_tong_hop_3_sheet');
  }

  loadWorkLogs(): void {
    this.workService.getWorkLogs().subscribe(res => {
      if (res.success && res.data) {
        this.workLogs = res.data;
        this.cdr.detectChanges();
      }
    });
  }

  exportExpenseExcel(): void {
    const columns = [
      { header: 'NGÀY CHI', key: 'date', width: 25 },
      { header: 'NỘI DUNG CHI', key: 'content', width: 60 },
      { header: 'SỐ TIỀN', key: 'amount', width: 25 }
    ];

    const data = this.expenses.map(e => ({
      date: new Date(e.date || '').toLocaleDateString('vi-VN'),
      content: e.content,
      amount: (e.amount || 0).toLocaleString('vi-VN') + 'đ'
    }));

    this.exportService.exportExcel(data, columns, 'Bao_cao_chi_phi');
  }

  ngOnInit(): void {
    this.loadDropdownData();
    // Luôn tải cả ba để có số liệu cho Dashboard và Export
    this.loadTransactions();
    this.loadExpenses();
    this.loadWorkLogs();
  }

  loadData(): void {
    if (this.activeTab === 'revenue') {
      this.loadTransactions();
    } else {
      this.loadExpenses();
    }
  }

  loadTransactions(): void {
    this.transactionService.getTransactions().subscribe(res => {
      if (res.success && res.data != null) {
        this.transactions = res.data;
        this.cdr.detectChanges();
      }
    });
  }

  loadExpenses(): void {
    this.transactionService.getExpenses().subscribe(res => {
      if (res.success && res.data != null) {
        this.expenses = res.data;
        this.cdr.detectChanges();
      }
    });
  }

  loadDropdownData(): void {
    this.managementService.getCustomers().subscribe(res => {
      if (res.success && res.data) {
        this.customers = res.data;
        this.cdr.detectChanges();
      }
    });
    this.managementService.getServices().subscribe(res => {
      if (res.success && res.data) {
        this.services = res.data;
        this.cdr.detectChanges();
      }
    });
    this.managementService.getProducts().subscribe(res => {
      if (res.success && res.data) {
        this.products = res.data;
        this.cdr.detectChanges();
      }
    });
  }

  onTabChange(tab: 'revenue' | 'expense'): void {
    this.activeTab = tab;
    this.loadData();
  }

  onSaleSubmit(): void {
    if (this.saleForm.valid) {
      this.isSubmitting = true;
      const formVal = this.saleForm.value;
      const request: CreateTransactionRequest = {
        customerId: formVal.customerId,
        customerName: formVal.customerName,
        productId: formVal.itemType === 'Product' ? formVal.itemId : undefined,
        serviceId: formVal.itemType === 'Service' ? formVal.itemId : undefined,
        itemName: formVal.itemName,
        type: (formVal.itemType === 'Service' && formVal.isTreatmentPackage) ? 'Package' : formVal.itemType,
        totalAmount: formVal.totalAmount,
        paidAmount: formVal.paidAmount,
        paymentMethod: formVal.paymentMethod,
        notes: formVal.notes,
        isTreatmentPackage: formVal.isTreatmentPackage
      };

      this.transactionService.createTransaction(request).subscribe({
        next: (res) => {
          if (res.success) {
            this.showSaleModal = false;
            this.saleForm.reset({ totalAmount: 0, paidAmount: 0, paymentMethod: 'Tiền mặt', itemType: 'Service', isTreatmentPackage: true });
            // Thêm ngay vào đầu danh sách để hiển thị tức thì
            if (res.data) {
              this.transactions = [res.data, ...this.transactions];
              this.cdr.detectChanges();
            }
            // Sau đó reload lại để đồng bộ với DB
            this.loadTransactions();
          }
          this.isSubmitting = false;
        },
        error: () => this.isSubmitting = false
      });
    }
  }

  onExpenseSubmit(): void {
    if (this.expenseForm.valid) {
      this.isSubmitting = true;
      this.transactionService.createExpense(this.expenseForm.value).subscribe({
        next: (res) => {
          if (res.success) {
            this.showExpenseModal = false;
            this.expenseForm.reset({ amount: 0 });
            // Thêm ngay vào đầu danh sách
            if (res.data) {
              this.expenses = [res.data, ...this.expenses];
              this.cdr.detectChanges();
            }
            this.loadExpenses(); // Tải lại chi phí
          }
          this.isSubmitting = false;
        },
        error: () => this.isSubmitting = false
      });
    }
  }

  onItemTypeChange(type: 'Service' | 'Product'): void {
    this.saleForm.patchValue({
      itemType: type,
      itemId: null,
      itemName: '',
      isTreatmentPackage: type === 'Service',
      totalAmount: 0,
      paidAmount: 0
    });
  }

  formatCurrency(value: number): string {
    if (!value && value !== 0) return '';
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  }

  onAmountInput(event: any, field: string): void {
    let rawValue = event.target.value.replace(/\s/g, ''); 
    if (isNaN(Number(rawValue))) {
      rawValue = rawValue.replace(/[^0-9]/g, '');
    }
    const numericValue = Number(rawValue);
    this.saleForm.patchValue({ [field]: numericValue }, { emitEvent: false });
    event.target.value = this.formatCurrency(numericValue);
  }

  // Helpers for form
  onCustomerSelect(event: any): void {
    const customer = this.customers.find(c => c.id === +event.target.value);
    if (customer) {
      this.saleForm.patchValue({ customerName: customer.fullName });
    }
  }

  onItemSelect(event?: any): void {
    const id = this.saleForm.get('itemId')?.value;
    if (!id) return;

    const type = this.saleForm.get('itemType')?.value;
    const isPackage = this.saleForm.get('isTreatmentPackage')?.value;

    if (type === 'Service') {
      const item = this.services.find(s => s.id === +id);
      if (item) {
        const price = isPackage ? item.pricePackage : item.priceSingle;
        this.saleForm.patchValue({ itemName: item.name, totalAmount: price, paidAmount: price });
      }
    } else {
      const item = this.products.find(p => p.id === +id);
      if (item) {
        this.saleForm.patchValue({ itemName: item.name, totalAmount: item.price, paidAmount: item.price });
      }
    }
  }

  onTreatmentChange(): void {
    this.onItemSelect();
  }

  // Getters cho Dashboard
  get totalServiceAmount(): number {
    return this.transactions
      .filter(t => t.type === 'Service')
      .reduce((sum, t) => sum + (t.paidAmount || 0), 0);
  }

  get totalProductAmount(): number {
    return this.transactions
      .filter(t => t.type === 'Product')
      .reduce((sum, t) => sum + (t.paidAmount || 0), 0);
  }

  get totalExpenseAmount(): number {
    return this.expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  }
}
