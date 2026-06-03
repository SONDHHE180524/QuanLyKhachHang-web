import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { ManagementService } from '../../services/management.service';
import { ServiceDto, CreateServiceRequest } from '../../shared/models/management.model';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ExportService } from '../../services/export.service';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold text-slate-900 tracking-tight">Danh mục dịch vụ</h1>
          <p class="text-slate-500 mt-1">Quản lý các gói liệu trình và dịch vụ chăm sóc tại Spa.</p>
        </div>
        <div class="flex items-center gap-4">
          <button (click)="exportExcel()" class="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200">
            <lucide-icon [name]="'file-spreadsheet'" class="w-4 h-4"></lucide-icon>
            <span>Xuất Excel</span>
          </button>
          <button (click)="openAddModal()" class="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 active:scale-95">
            <lucide-icon [name]="'plus'" class="w-4 h-4"></lucide-icon>
            <span>Thêm mới</span>
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let s of filteredServices" class="bg-white p-6 rounded-3xl border border-slate-200 shadow-premium group hover:border-primary-300 transition-all hover:-translate-y-1 relative">
          <div class="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button (click)="editService(s)" class="p-2 bg-white border border-slate-100 text-slate-400 hover:text-primary-600 hover:border-primary-100 rounded-xl transition-colors shadow-sm">
              <lucide-icon [name]="'edit-2'" class="w-4 h-4"></lucide-icon>
            </button>
            <button (click)="deleteService(s.id)" class="p-2 bg-white border border-slate-100 text-slate-400 hover:text-rose-600 hover:border-rose-100 rounded-xl transition-colors shadow-sm">
              <lucide-icon [name]="'trash-2'" class="w-4 h-4"></lucide-icon>
            </button>
          </div>

          <div class="flex items-start justify-between">
            <div class="p-3 bg-primary-100 text-primary-600 rounded-2xl">
              <lucide-icon [name]="s.isTreatment ? 'users' : 'package'" class="w-6 h-6"></lucide-icon>
            </div>
            <span *ngIf="s.isTreatment" class="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-bold uppercase">Liệu trình</span>
          </div>
          <div class="mt-4">
            <h3 class="text-lg font-bold text-slate-900 line-clamp-1">{{ s.name }}</h3>
            <p class="text-sm text-slate-500 mt-1">Số buổi: {{ s.defaultSessions }} buổi</p>
          </div>
          <div class="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
            <div class="flex flex-col">
              <span class="text-[10px] font-bold text-slate-400 uppercase">Giá trọn gói</span>
              <span class="text-lg font-bold text-primary-600 tabular-nums">{{ s.pricePackage | number:'1.0-0' }}đ</span>
            </div>
            <div class="flex flex-col items-end">
              <span class="text-[10px] font-bold text-slate-400 uppercase">Giá buổi lẻ</span>
              <span class="text-sm font-bold text-slate-900 tabular-nums">{{ s.priceSingle | number:'1.0-0' }}đ</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div *ngIf="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div class="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div class="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 class="text-xl font-bold text-slate-900">{{ isEditing ? 'Cập nhật dịch vụ' : 'Thêm dịch vụ mới' }}</h2>
            <p class="text-sm text-slate-500 mt-1">Nhập thông tin chi tiết cho dịch vụ của bạn.</p>
          </div>
          <button (click)="closeModal()" class="p-2 hover:bg-slate-200 rounded-xl transition-colors text-slate-400">
            <lucide-icon [name]="'x'" class="w-5 h-5"></lucide-icon>
          </button>
        </div>

        <form [formGroup]="serviceForm" (ngSubmit)="onSubmit()" class="p-8 space-y-6">
          <div class="space-y-2">
            <label class="text-sm font-bold text-slate-700 ml-1">Tên dịch vụ</label>
            <input 
              type="text" 
              formControlName="name"
              placeholder="VD: Chăm sóc da mặt cơ bản"
              class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="text-sm font-bold text-slate-700 ml-1">Giá buổi lẻ (đ)</label>
              <input 
                type="number" 
                formControlName="priceSingle"
                class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
              />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-bold text-slate-700 ml-1">Giá trọn gói (đ)</label>
              <input 
                type="number" 
                formControlName="pricePackage"
                class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4 items-end">
            <div class="space-y-2">
              <label class="text-sm font-bold text-slate-700 ml-1">Số buổi mặc định</label>
              <input 
                type="number" 
                formControlName="defaultSessions"
                class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
              />
            </div>
            <div class="flex items-center gap-3 h-[50px] px-4 bg-slate-50 border border-slate-200 rounded-xl">
              <input 
                type="checkbox" 
                formControlName="isTreatment"
                id="isTreatment"
                class="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <label for="isTreatment" class="text-sm font-bold text-slate-700 cursor-pointer">Là liệu trình</label>
            </div>
          </div>

          <div class="pt-4 flex gap-3">
            <button 
              type="button"
              (click)="closeModal()"
              class="flex-1 px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all"
            >
              Hủy bỏ
            </button>
            <button 
              type="submit"
              [disabled]="serviceForm.invalid || isSubmitting"
              class="flex-1 px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isSubmitting ? 'Đang lưu...' : (isEditing ? 'Cập nhật' : 'Thêm mới') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Toast Notification (Simple) -->
    <div *ngIf="toastMessage" 
         [ngClass]="toastType === 'success' ? 'bg-emerald-500' : 'bg-rose-500'"
         class="fixed bottom-8 right-8 px-6 py-3 text-white rounded-2xl shadow-2xl animate-in slide-in-from-right-full duration-300 z-[100] font-bold">
      {{ toastMessage }}
    </div>
  `
})
export class ServicesComponent implements OnInit {
  services: ServiceDto[] = [];
  filteredServices: ServiceDto[] = [];
  searchTerm: string = '';

  showModal = false;
  isEditing = false;
  selectedId: number | null = null;
  serviceForm: FormGroup;
  isSubmitting = false;

  toastMessage: string | null = null;
  toastType: 'success' | 'error' = 'success';

  constructor(
    private managementService: ManagementService,
    private exportService: ExportService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.serviceForm = this.fb.group({
      name: ['', Validators.required],
      priceSingle: [0, [Validators.required, Validators.min(0)]],
      pricePackage: [0, [Validators.required, Validators.min(0)]],
      isTreatment: [false],
      defaultSessions: [1, [Validators.required, Validators.min(1)]]
    });
  }

  exportExcel(): void {
    const columns = [
      { header: 'TÊN DỊCH VỤ', key: 'name', width: 35 },
      { header: 'GIÁ BUỔI LẺ', key: 'priceSingle', width: 20 },
      { header: 'GIÁ TRỌN GÓI', key: 'pricePackage', width: 20 },
      { header: 'SỐ BUỔI', key: 'sessions', width: 15 },
      { header: 'LOẠI', key: 'type', width: 15 }
    ];

    const data = this.services.map(s => ({
      name: s.name,
      priceSingle: (s.priceSingle || 0).toLocaleString('vi-VN') + 'đ',
      pricePackage: (s.pricePackage || 0).toLocaleString('vi-VN') + 'đ',
      sessions: s.defaultSessions,
      type: s.isTreatment ? 'Liệu trình' : 'Dịch vụ lẻ'
    }));

    this.exportService.exportExcel(data, columns, 'Danh_muc_dich_vu');
  }

  ngOnInit(): void {
    this.loadServices();
  }

  loadServices(): void {
    this.managementService.getServices().subscribe(res => {
      if (res.success && res.data) {
        this.services = res.data;
        this.filterServices();
      }
    });
  }

  filterServices(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredServices = this.services.filter(s => s.name.toLowerCase().includes(term));
    this.cdr.detectChanges();
  }

  openAddModal(): void {
    this.isEditing = false;
    this.selectedId = null;
    this.serviceForm.reset({
      name: '',
      priceSingle: 0,
      pricePackage: 0,
      isTreatment: false,
      defaultSessions: 1
    });
    this.showModal = true;
  }

  editService(service: ServiceDto): void {
    this.isEditing = true;
    this.selectedId = service.id;
    this.serviceForm.patchValue({
      name: service.name,
      priceSingle: service.priceSingle,
      pricePackage: service.pricePackage,
      isTreatment: service.isTreatment,
      defaultSessions: service.defaultSessions
    });
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  onSubmit(): void {
    if (this.serviceForm.invalid) return;

    this.isSubmitting = true;
    const request: CreateServiceRequest = this.serviceForm.value;

    const obs = this.isEditing && this.selectedId
      ? this.managementService.updateService(this.selectedId, request)
      : this.managementService.createService(request);

    obs.subscribe({
      next: (res) => {
        if (res.success) {
          this.showToast(this.isEditing ? 'Cập nhật thành công!' : 'Thêm mới thành công!', 'success');
          this.loadServices();
          this.closeModal();
        } else {
          this.showToast(res.message || 'Có lỗi xảy ra', 'error');
        }
        this.isSubmitting = false;
      },
      error: () => {
        this.showToast('Lỗi kết nối máy chủ', 'error');
        this.isSubmitting = false;
      }
    });
  }

  deleteService(id: number): void {
    if (!confirm('Bạn có chắc muốn xóa dịch vụ này?')) return;

    this.managementService.deleteService(id).subscribe(res => {
      if (res.success) {
        this.showToast('Xóa thành công!', 'success');
        this.loadServices();
      } else {
        this.showToast(res.message || 'Không thể xóa', 'error');
      }
    });
  }

  showToast(msg: string, type: 'success' | 'error'): void {
    this.toastMessage = msg;
    this.toastType = type;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.toastMessage = null;
      this.cdr.detectChanges();
    }, 3000);
  }
}

