import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { WorkService, WorkLogDto } from '../../services/work.service';
import { DashboardService } from '../../services/dashboard.service';
import { ManagementService } from '../../services/management.service';
import { TransactionService } from '../../services/transaction.service';
import { TransactionDto } from '../../shared/models/transaction.model';
import { CustomerDto } from '../../shared/models/customer.model';
import { ServiceDto } from '../../shared/models/management.model';
import { ExportService } from '../../services/export.service';

@Component({
  selector: 'app-work-logs',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule, FormsModule],
  templateUrl: './work-logs.component.html'
})
export class WorkLogsComponent implements OnInit {
  workLogs: WorkLogDto[] = [];
  transactions: TransactionDto[] = [];
  customers: CustomerDto[] = [];
  services: ServiceDto[] = [];
  products: any[] = [];
  unifiedLogs: any[] = [];

  checkInForm: FormGroup;
  activeTab: string = 'today';
  isSubmitting = false;
  
  startDate: string = '';
  endDate: string = '';
  filterType: string = 'month';
  selectedFilterDate: string = '';

  // Period revenue card state
  revenuePeriod: 'today' | 'month' | 'year' = 'today';
  todayRevenueSum = 0;
  monthRevenueSum = 0;
  yearRevenueSum = 0;

  bodyRegions:string[] = ['Cổ vai gáy', 'Lưng', 'Giảm mỡ', 'Mặt', 'Tay/Chân', 'Toàn thân'];
  selectedRegions: string[] = [];
  isGuest = false;
  formMode: 'service' | 'product' | 'package' = 'service';
  
  // Manual date filter
  filterDay: number = new Date().getDate();
  filterMonth: number = new Date().getMonth() + 1;
  filterYear: number = new Date().getFullYear();
  
  days = Array.from({ length: 31 }, (_, i) => i + 1);
  months = Array.from({ length: 12 }, (_, i) => i + 1);
  years = this.generateYearList();

  generateYearList(): number[] {
    const currentYear = new Date().getFullYear();
    const startYear = 2020;
    const endYear = currentYear + 5;
    const years = [];
    for (let y = startYear; y <= endYear; y++) {
      years.push(y);
    }
    return years;
  }

  // Toast
  toastMessage: string | null = null;
  toastType: 'success' | 'error' = 'success';

  // Debt Payment
  showPayDebtModal = false;
  debtList: any[] = [];
  selectedDebtCustomer: any = null;
  payDebtAmount: number = 0;
  payDebtMethod: string = 'Tiền mặt';
  payDebtNotes: string = '';

  // View Note
  showNoteModal = false;
  currentNoteContent = '';

  // Fullscreen
  isFullscreen = false;

  selectedCustomer: CustomerDto | null = null;
  customerHasTreatment = false;
  maxDate: string = this.getNowForInput();
  currentTreatmentProgress = '';
  currentTreatmentName = '';

  constructor(
    private fb: FormBuilder,
    private workService: WorkService,
    private managementService: ManagementService,
    private transactionService: TransactionService,
    private exportService: ExportService,
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef
  ) {
    this.checkInForm = this.fb.group({
      customerId: [null, Validators.required],
      serviceId: [null],
      isTreatment: [false],
      isFreeSession: [false],
      guestName: [''],
      paymentMethod: ['Tiền mặt'],
      paidAmount: [0],
      totalAmount: [0],
      debt: [0],
      productId: [null],
      packageId: [null],
      notes: [''],
      consultantType: ['None'],
      otherConsultantName: [''],
      isConsultedByPA: [false],
      useCustomDate: [false],
      customDate: [new Date().toISOString().slice(0, 16)]
    });
  }

  exportExcel(): void {
    const columns = [
      { header: 'THỜI GIAN', key: 'time', width: 20 },
      { header: 'KHÁCH HÀNG', key: 'customer', width: 30 },
      { header: 'NỘI DUNG', key: 'service', width: 40 },
      { header: 'DOANH THU', key: 'revenue', width: 15 },
      { header: 'THANH TOÁN', key: 'type', width: 15 },
      { header: 'NỢ', key: 'debt', width: 15 },
      { header: 'GHI CHÚ', key: 'notes', width: 40 }
    ];

    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    end.setHours(23, 59, 59);

    const filteredTransactions = this.transactions.filter((t: TransactionDto) => {
      if (!t.date) return false;
      const d = new Date(t.date);
      return d >= start && d <= end;
    });

    const refundedCustomerNames = new Set(
      filteredTransactions.filter((t: TransactionDto) => t.type === 'Refund').map((t: TransactionDto) => t.customerName)
    );

    // SHEET 1: CÔNG VIỆC
    const workRetail = this.workLogs
      .filter((log: WorkLogDto) => !log.isTreatment)
      .map((log: WorkLogDto) => ({
        time: new Date(log.date).toLocaleDateString('vi-VN'),
        customer: log.customerName,
        service: log.serviceName,
        revenue: (log.revenue || 0).toLocaleString('vi-VN') + 'đ',
        type: log.paymentMethod || 'Tiền mặt',
        debt: (log.customerDebt || 0) > 0 ? (log.customerDebt || 0).toLocaleString('vi-VN') + 'đ' : '-',
        notes: log.notes || '-'
      }));

    const workTreatments = this.workLogs
      .filter((log: WorkLogDto) => log.isTreatment)
      .map((log: WorkLogDto) => ({
        time: new Date(log.date).toLocaleDateString('vi-VN'),
        customer: log.customerName,
        service: log.serviceName,
        revenue: '0đ',
        type: 'Liệu trình',
        debt: '-',
        notes: log.notes || '-'
      }));

    // SHEET 2: MUA HÀNG
    const transactionPackages = filteredTransactions
      .filter((t: TransactionDto) => t.type === 'Package' || t.type === 'Liệu trình')
      .map((t: TransactionDto) => {
        const isStopped = refundedCustomerNames.has(t.customerName);
        return {
          time: new Date(t.date!).toLocaleDateString('vi-VN'),
          customer: t.customerName,
          service: t.itemName,
          notes: 'Đăng ký gói mới',
          revenue: (t.paidAmount || 0).toLocaleString('vi-VN') + 'đ',
          type: 'Khách mua liệu trình',
          _cellStyle: isStopped ? { customer: { color: 'FFFF0000' } } : null
        };
      });

    const transactionProducts = filteredTransactions
      .filter((t: TransactionDto) => t.type === 'Product')
      .map((t: TransactionDto) => ({
        time: new Date(t.date!).toLocaleDateString('vi-VN'),
        customer: t.customerName,
        service: t.itemName,
        notes: 'Mua tại quầy',
        revenue: (t.paidAmount || 0).toLocaleString('vi-VN') + 'đ',
        type: 'Khách mua sản phẩm'
      }));

    // SHEET 3: HOÀN TIỀN
    const refunds = filteredTransactions
      .filter((t: TransactionDto) => t.type === 'Refund')
      .map((t: TransactionDto) => ({
        time: new Date(t.date!).toLocaleDateString('vi-VN'),
        customer: t.customerName,
        service: t.itemName,
        notes: 'Hoàn trả tiền',
        revenue: (t.paidAmount || 0).toLocaleString('vi-VN') + 'đ',
        type: 'Hoàn tiền',
        _rowStyle: { color: 'FFFF0000' }
      }));

    const sheets = [
      { name: 'Công việc', columns, data: [...workRetail, ...workTreatments] },
      { name: 'Mua hàng', columns, data: [...transactionPackages, ...transactionProducts] },
      { name: 'Hoàn tiền', columns, data: refunds }
    ];

    this.exportService.exportMultiSheetExcel(sheets, 'Bao_cao_tong_hop_3_sheet');
  }

  ngOnInit(): void {
    this.loadData();
    this.setFilter('month');
    this.loadPeriodRevenues();
  }

  loadData(): void {
    this.managementService.getCustomers().subscribe(res => {
      if (res.success) {
        this.customers = res.data || [];
        this.cdr.detectChanges();
      }
    });
    this.managementService.getServices().subscribe(res => {
      if (res.success) {
        this.services = res.data || [];
        this.cdr.detectChanges();
      }
    });
    this.managementService.getProducts().subscribe(res => {
      if (res.success) {
        this.products = res.data || [];
        this.cdr.detectChanges();
      }
    });
  }

  loadWorkLogs(): void {
    const workObs = this.workService.getWorkLogs(this.startDate, this.endDate);
    const transObs = this.transactionService.getTransactions(500);

    import('rxjs').then(({ forkJoin }) => {
      forkJoin([workObs, transObs]).subscribe(([workRes, transRes]) => {
        const unified: any[] = [];

        // 1. Add Work Logs
        if (workRes.success && workRes.data) {
          this.workLogs = workRes.data;
          workRes.data.forEach((log: WorkLogDto) => {
            unified.push({
              id: 'work-' + log.id,
              date: log.date,
              customerName: log.customerName,
              itemName: log.serviceName,
              type: log.isTreatment ? 'Liệu trình' : 'Buổi lẻ',
              revenue: log.revenue,
              paymentMethod: log.paymentMethod || '-',
              debtAmount: log.customerDebt || 0,
              notes: log.notes || (log as any).Notes || '',
              isConsultedByPA: log.isConsultedByPA === true || (log as any).IsConsultedByPA === true || (log as any).isConsultedByPA === true || (log as any).IsConsultedByPA === 1 || (log as any).isconsultedbypa === true,
              consultantName: log.consultantName || (log as any).ConsultantName || '',
              raw: log
            });
          });
        }

        // 2. Add Transactions
        if (transRes.success && transRes.data) {
          this.transactions = transRes.data;
          const start = new Date(this.startDate + 'T00:00:00');
          const end = new Date(this.endDate + 'T23:59:59');

          transRes.data.forEach((t: TransactionDto) => {
            if (!t.date) return;
            const d = new Date(t.date);
            if (d >= start && d <= end) {
              if (t.type === 'Package' || t.type === 'Product' || t.type === 'Refund' || t.type === 'Service' || t.type === 'Liệu trình' || t.isTreatmentPackage || t.type === 'PayDebt') {
                // Tránh duplicate với WorkLog tạo ra từ check-in (cùng lúc, cùng khách)
                const isDuplicate = unified.some(u => 
                  u.id.startsWith('work-') &&
                  u.customerName === (t.customerName || 'Khách lẻ') &&
                  Math.abs(new Date(u.date).getTime() - new Date(t.date!).getTime()) < 5000
                );

                if (!isDuplicate) {
                  unified.push({
                    id: 'trans-' + t.id,
                    date: t.date,
                    customerName: t.customerName || 'Khách lẻ',
                    itemName: t.itemName || 'N/A',
                    type: t.type === 'Package' || t.type === 'Liệu trình' || t.isTreatmentPackage ? 'Mua gói' : 
                          (t.type === 'Refund' ? 'Hoàn tiền' : 
                          (t.type === 'PayDebt' ? 'Thu nợ' :
                          (t.type === 'Service' ? 'Dịch vụ' : 'Sản phẩm'))),
                    revenue: t.paidAmount || 0,
                    paymentMethod: t.paymentMethod || 'Tiền mặt',
                    debtAmount: t.debt || 0,
                    notes: t.notes || (t as any).Notes || '',
                    isConsultedByPA: t.isConsultedByPA === true || (t as any).IsConsultedByPA === true || (t as any).isConsultedByPA === true || (t as any).IsConsultedByPA === 1 || (t as any).isconsultedbypa === true,
                    consultantName: t.consultantName || (t as any).ConsultantName || '',
                    raw: t
                  });
                }
              }
            }
          });
        }

        this.unifiedLogs = unified.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        this.cdr.detectChanges();
      });
    });
  }

  setFilter(type: string): void {
    this.filterType = type;
    const now = new Date();
    let start = new Date();
    let end = new Date();

    if (type === 'week') {
      const diff = (7 + (now.getDay() - 1)) % 7;
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diff);
      end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6);
      this.selectedFilterDate = '';
    } else if (type === 'month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      this.selectedFilterDate = '';
    } else if (type === 'today') {
      start = new Date();
      end = new Date();
      this.selectedFilterDate = this.formatDateForInput(start);
    }

    this.startDate = this.formatDateForInput(start);
    this.endDate = this.formatDateForInput(end);

    // Sync manual filter
    this.filterDay = start.getDate();
    this.filterMonth = start.getMonth() + 1;
    this.filterYear = start.getFullYear();

    this.loadWorkLogs();
  }

  onStartDateChange(dateStr: string): void {
    if (!dateStr) return;
    this.startDate = dateStr;
    this.filterType = 'custom-range';
    this.selectedFilterDate = '';

    if (this.endDate && this.startDate > this.endDate) {
      this.endDate = this.startDate;
    }

    // Sync manual dropdown filters
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      this.filterYear = Number(parts[0]);
      this.filterMonth = Number(parts[1]);
      this.filterDay = Number(parts[2]);
    }

    this.loadWorkLogs();
    this.cdr.detectChanges();
  }

  onEndDateChange(dateStr: string): void {
    if (!dateStr) return;
    this.endDate = dateStr;
    this.filterType = 'custom-range';
    this.selectedFilterDate = '';

    if (this.startDate && this.endDate < this.startDate) {
      this.startDate = this.endDate;
    }

    this.loadWorkLogs();
    this.cdr.detectChanges();
  }

  onFilterChange(): void {
    this.filterType = 'custom';
    this.loadWorkLogs();
  }

  onManualFilterChange(event?: any): void {
    this.filterType = 'custom';
    
    // Nếu có event, cập nhật giá trị model ngay lập tức
    if (event && event.target) {
      const val = Number(event.target.value);
      const name = event.target.getAttribute('name');
      if (name === 'day') this.filterDay = val;
      if (name === 'month') this.filterMonth = val;
      if (name === 'year') this.filterYear = val;
    }

    const year = Number(this.filterYear);
    const month = Number(this.filterMonth);
    const day = Number(this.filterDay);

    let start: Date;
    let end: Date;

    if (month === 0) {
      start = new Date(year, 0, 1);
      end = new Date(year, 11, 31);
    } else if (day === 0) {
      start = new Date(year, month - 1, 1);
      end = new Date(year, month, 0);
    } else {
      start = new Date(year, month - 1, day);
      end = new Date(year, month - 1, day);
    }

    this.startDate = this.formatDateForInput(start);
    this.endDate = this.formatDateForInput(end);
    this.loadWorkLogs();
    this.cdr.detectChanges();
  }

  private formatDateForInput(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  onTabChange(tab: string): void {
    this.activeTab = tab;
    this.loadWorkLogs();
  }

  get periodRevenue(): number {
    if (this.revenuePeriod === 'month') return this.monthRevenueSum;
    if (this.revenuePeriod === 'year') return this.yearRevenueSum;
    return this.todayRevenueSum;
  }

  setRevenuePeriod(period: 'today' | 'month' | 'year'): void {
    this.revenuePeriod = period;
    this.cdr.detectChanges();
  }

  loadPeriodRevenues(): void {
    const now = new Date();
    const todayStr = this.formatDateForInput(now);
    
    // 1. Today
    this.dashboardService.getDashboardData(todayStr, todayStr).subscribe(res => {
      if (res.success && res.data) {
        this.todayRevenueSum = res.data.totalRevenue;
        this.cdr.detectChanges();
      }
    });

    // 2. Month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    this.dashboardService.getDashboardData(this.formatDateForInput(startOfMonth), this.formatDateForInput(endOfMonth)).subscribe(res => {
      if (res.success && res.data) {
        this.monthRevenueSum = res.data.totalRevenue;
        this.cdr.detectChanges();
      }
    });

    // 3. Year
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const endOfYear = new Date(now.getFullYear(), 11, 31);
    this.dashboardService.getDashboardData(this.formatDateForInput(startOfYear), this.formatDateForInput(endOfYear)).subscribe(res => {
      if (res.success && res.data) {
        this.yearRevenueSum = res.data.totalRevenue;
        this.cdr.detectChanges();
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

  get totalRevenue(): number {
    return this.unifiedLogs.reduce((sum: number, log: any) => sum + (log.revenue || 0), 0);
  }

  onProductSelect(event: any): void {
    const productId = +event.target.value;
    const product = this.products.find(p => p.id === productId);
    if (product) {
      this.checkInForm.patchValue({
        totalAmount: product.price,
        paidAmount: product.price,
        debt: 0
      });
    }
  }

  onPackageSelect(event: any): void {
    const serviceId = +event.target.value;
    const service = this.services.find(s => s.id === serviceId);
    if (service) {
      this.checkInForm.patchValue({
        totalAmount: service.pricePackage,
        paidAmount: service.pricePackage,
        debt: 0
      });
    }
  }

  calculateDebt(): void {
    const total = this.checkInForm.get('totalAmount')?.value || 0;
    const paid = this.checkInForm.get('paidAmount')?.value || 0;
    this.checkInForm.patchValue({ debt: Math.max(0, total - paid) }, { emitEvent: false });
  }

  formatCurrency(value: number): string {
    if (!value && value !== 0) return '';
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  }

  onAmountInput(event: any, field: string): void {
    let rawValue = event.target.value.replace(/\s/g, ''); // Xóa dấu cách
    if (isNaN(Number(rawValue))) {
      rawValue = rawValue.replace(/[^0-9]/g, '');
    }
    const numericValue = Number(rawValue);
    
    this.checkInForm.patchValue({ [field]: numericValue }, { emitEvent: false });
    event.target.value = this.formatCurrency(numericValue);
    this.calculateDebt();
  }

  onCustomerSelect(event: any): void {
    const customerId = +event.target.value;
    
    if (customerId === 0) {
      this.isGuest = true;
      this.selectedCustomer = null;
      this.customerHasTreatment = false;
      this.checkInForm.patchValue({ isTreatment: false, serviceId: null, guestName: '' });
      this.checkInForm.get('guestName')?.setValidators([Validators.required]);
      this.checkInForm.get('guestName')?.updateValueAndValidity();
      this.cdr.detectChanges();
      return;
    }

    this.isGuest = false;
    this.checkInForm.get('guestName')?.clearValidators();
    this.checkInForm.get('guestName')?.updateValueAndValidity();
    this.selectedCustomer = this.customers.find(c => c.id === customerId) || null;
    this.cdr.detectChanges();

    if (this.selectedCustomer && this.selectedCustomer.treatmentProgress && this.selectedCustomer.treatmentProgress !== 'Chưa đăng ký') {
      // Parse treatment progress: e.g. "1/10 - Chăm sóc da"
      const progressStr = this.selectedCustomer.treatmentProgress;
      const parts = progressStr.split('-');

      this.customerHasTreatment = true;
      this.currentTreatmentProgress = parts[0].trim();
      this.currentTreatmentName = parts.length > 1 ? parts.slice(1).join('-').trim() : 'Liệu trình ẩn danh';

      // Auto select service if we can match the name, or just let backend handle via isTreatment
      const matchedService = this.services.find(s => s.name.toLowerCase() === this.currentTreatmentName.toLowerCase());

      this.checkInForm.patchValue({
        serviceId: matchedService ? matchedService.id : null,
        isTreatment: true
      });
    } else {
      this.customerHasTreatment = false;
      this.currentTreatmentProgress = '';
      this.currentTreatmentName = '';
      this.checkInForm.patchValue({
        serviceId: null,
        isTreatment: false,
        isFreeSession: false
      });
    }
  }

  toggleRegion(region: string): void {
    const index = this.selectedRegions.indexOf(region);
    if (index > -1) {
      this.selectedRegions.splice(index, 1);
    } else {
      this.selectedRegions.push(region);
    }
  }

  onSubmit(): void {
    if (this.checkInForm.invalid) return;

    this.isSubmitting = true;
    const formVal = this.checkInForm.value;

    let finalConsultantName = '';
    let isConsultedByPA = false;
    if (formVal.consultantType === 'PA') {
      finalConsultantName = 'PA';
      isConsultedByPA = true;
    } else if (formVal.consultantType === 'Other') {
      finalConsultantName = formVal.otherConsultantName || '';
    }

    if (this.formMode === 'service') {
      const customer = this.isGuest ? null : this.customers.find(c => c.id === +formVal.customerId);
      const service = this.services.find(s => s.id === +formVal.serviceId);

      const request = {
        customerId: this.isGuest ? null : (customer?.id ?? null),
        customerName: this.isGuest ? formVal.guestName : (customer?.fullName || 'Khách lẻ'),
        serviceId: service ? service.id : null,
        serviceName: service ? service.name : this.currentTreatmentName,
        isTreatment: formVal.isTreatment === true || formVal.isTreatment === 'true',
        isFreeSession: formVal.isFreeSession === true || formVal.isFreeSession === 'true',
        notes: (formVal.notes || '').trim(),
        isConsultedByPA: isConsultedByPA,
        consultantName: finalConsultantName,
        paymentMethod: formVal.isTreatment ? '-' : (formVal.paymentMethod || 'Tiền mặt'),
        date: formVal.useCustomDate ? formVal.customDate : null
      };

      this.workService.checkIn(request).subscribe({
        next: (res) => {
          if (res.success) {
            this.showToast('Ghi nhận dịch vụ thành công!');
            this.resetForm();
          } else {
            this.showToast('Thất bại: ' + res.message, 'error');
          }
          this.isSubmitting = false;
        }
      });
    } else if (this.formMode === 'product') {
      // PRODUCT MODE
      const customer = this.isGuest ? null : this.customers.find(c => c.id === +formVal.customerId);
      const product = this.products.find(p => p.id === +formVal.productId);

      if (!product) {
        this.showToast('Vui lòng chọn sản phẩm!', 'error');
        this.isSubmitting = false;
        return;
      }

      const request: any = {
        customerId: this.isGuest ? null : customer?.id,
        customerName: this.isGuest ? formVal.guestName : (customer?.fullName || 'Khách lẻ'),
        productId: product.id,
        itemName: product.name,
        type: 'Product',
        totalAmount: formVal.totalAmount,
        paidAmount: formVal.paidAmount,
        paymentMethod: formVal.paymentMethod,
        notes: formVal.notes,
        isConsultedByPA: isConsultedByPA,
        consultantName: finalConsultantName,
        date: formVal.useCustomDate ? formVal.customDate : null
      };

      this.transactionService.createTransaction(request).subscribe({
        next: (res) => {
          if (res.success) {
            this.showToast('Bán sản phẩm thành công!');
            this.resetForm();
          } else {
            this.showToast('Thất bại: ' + res.message, 'error');
          }
          this.isSubmitting = false;
        }
      });
    } else if (this.formMode === 'package') {
      // PACKAGE PURCHASE MODE
      const customer = this.isGuest ? null : this.customers.find(c => c.id === +formVal.customerId);
      const service = this.services.find(s => s.id === +formVal.packageId);

      if ((!customer && !this.isGuest) || !service) {
        this.showToast('Vui lòng chọn khách hàng và gói liệu trình!', 'error');
        this.isSubmitting = false;
        return;
      }

      const request: any = {
        customerId: this.isGuest ? null : customer?.id,
        customerName: this.isGuest ? formVal.guestName : (customer?.fullName || 'Khách lẻ'),
        serviceId: service.id,
        itemName: service.name,
        type: 'Package',
        totalAmount: formVal.totalAmount,
        paidAmount: formVal.paidAmount,
        paymentMethod: formVal.paymentMethod,
        notes: formVal.notes,
        isConsultedByPA: isConsultedByPA,
        consultantName: finalConsultantName,
        isTreatmentPackage: true, // IMPORTANT: Backend needs this to update customer progress
        date: formVal.useCustomDate ? formVal.customDate : null
      };

      this.transactionService.createTransaction(request).subscribe({
        next: (res) => {
          if (res.success) {
            this.showToast('Đăng ký gói liệu trình thành công!');
            this.resetForm();
          } else {
            this.showToast('Thất bại: ' + res.message, 'error');
          }
          this.isSubmitting = false;
        }
      });
    }
  }

  private resetForm(): void {
    this.checkInForm.reset({
      isTreatment: false,
      isFreeSession: false,
      useCustomDate: true,
      customDate: this.getNowForInput(),
      paymentMethod: 'Tiền mặt',
      paidAmount: 0,
      totalAmount: 0,
      debt: 0,
      notes: '',
      consultantType: 'None',
      otherConsultantName: '',
      isConsultedByPA: false
    });
    this.selectedRegions = [];
    this.selectedCustomer = null;
    this.customerHasTreatment = false;
    this.isGuest = false;
    this.loadData();
    this.loadWorkLogs();
    this.loadPeriodRevenues();
  }
  private getNowForInput(): string {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    return `${y}-${m}-${d}T${hh}:${mm}`;
  }

  // DEBT PAYMENT METHODS
  openPayDebtModal(): void {
    this.managementService.getDebtList().subscribe(res => {
      if (res.success) {
        this.debtList = res.data || [];
        this.showPayDebtModal = true;
        this.selectedDebtCustomer = null;
        this.payDebtAmount = 0;
        this.payDebtMethod = 'Tiền mặt';
        this.payDebtNotes = '';
        this.cdr.detectChanges();
      }
    });
  }

  onDebtCustomerSelect(): void {
    if (this.selectedDebtCustomer) {
      this.payDebtAmount = this.selectedDebtCustomer.totalDebt;
    }
  }

  confirmPayDebt(): void {
    if (!this.selectedDebtCustomer || this.payDebtAmount <= 0) return;

    const request = {
      customerId: this.selectedDebtCustomer.customerId,
      customerName: this.selectedDebtCustomer.customerName,
      amount: this.payDebtAmount,
      paymentMethod: this.payDebtMethod,
      notes: this.payDebtNotes
    };

    this.managementService.payDebt(request).subscribe({
      next: (res) => {
        if (res.success) {
          this.showToast('Thu nợ thành công!');
          this.showPayDebtModal = false;
          this.loadWorkLogs(); // Refresh log to update debt highlights
          this.loadData();     // Refresh customers
          this.loadPeriodRevenues();
        } else {
          this.showToast('Thất bại: ' + res.message, 'error');
        }
      }
    });
  }

  viewNote(note: string): void {
    if (!note) return;
    this.currentNoteContent = note;
    this.showNoteModal = true;
  }

  toggleFullscreen(): void {
    this.isFullscreen = !this.isFullscreen;
  }
}
