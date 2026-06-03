import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { ManagementService } from '../../services/management.service';
import { ProductDto, CreateProductRequest } from '../../shared/models/management.model';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ExportService } from '../../services/export.service';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold text-slate-900 tracking-tight">Quản lý kho hàng</h1>
          <p class="text-slate-500 mt-1">Quản lý danh sách sản phẩm và vật tư tiêu hao.</p>
        </div>
        <div class="flex items-center gap-4">
          <button (click)="exportExcel()" class="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200">
            <lucide-icon [name]="'file-spreadsheet'" class="w-4 h-4"></lucide-icon>
            <span>Xuất Excel</span>
          </button>
          <button (click)="openAddModal()" class="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 active:scale-95">
            <lucide-icon [name]="'plus'" class="w-4 h-4"></lucide-icon>
            <span>Thêm sản phẩm</span>
          </button>
        </div>
      </div>

      <div class="bg-white rounded-3xl border border-slate-200 shadow-premium overflow-hidden">
        <table class="w-full text-left">
          <thead>
            <tr class="bg-slate-50/50 text-slate-500 text-xs font-bold uppercase tracking-wider">
              <th class="px-8 py-5">Tên sản phẩm</th>
              <th class="px-6 py-5 text-right">Đơn giá</th>
              <th class="px-6 py-5 text-center">Tồn kho</th>
              <th class="px-8 py-5 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr *ngFor="let p of filteredProducts" class="hover:bg-slate-50/80 transition-colors group">
              <td class="px-8 py-4">
                <div class="flex items-center gap-3">
                  <div class="p-2 bg-slate-100 text-slate-500 rounded-lg">
                    <lucide-icon [name]="'package'" class="w-5 h-5"></lucide-icon>
                  </div>
                  <span class="font-bold text-slate-900">{{ p.name }}</span>
                </div>
              </td>
              <td class="px-6 py-4 text-right font-bold text-primary-600 tabular-nums">{{ p.price | number:'1.0-0' }}đ</td>
              <td class="px-6 py-4 text-center tabular-nums text-slate-600">
                <span [ngClass]="p.stock > 5 ? 'text-slate-600' : 'text-rose-600 font-bold'">
                  {{ p.stock }}
                </span>
              </td>
              <td class="px-8 py-4 text-right">
                <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button (click)="editProduct(p)" class="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all">
                    <lucide-icon [name]="'edit-2'" class="w-4 h-4"></lucide-icon>
                  </button>
                  <button (click)="deleteProduct(p.id)" class="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
                    <lucide-icon [name]="'trash-2'" class="w-4 h-4"></lucide-icon>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div *ngIf="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div class="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div class="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 class="text-xl font-bold text-slate-900">{{ isEditing ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới' }}</h2>
            <p class="text-sm text-slate-500 mt-1">Quản lý kho hàng và đơn giá sản phẩm.</p>
          </div>
          <button (click)="closeModal()" class="p-2 hover:bg-slate-200 rounded-xl transition-colors text-slate-400">
            <lucide-icon [name]="'x'" class="w-5 h-5"></lucide-icon>
          </button>
        </div>

        <form [formGroup]="productForm" (ngSubmit)="onSubmit()" class="p-8 space-y-6">
          <div class="space-y-2">
            <label class="text-sm font-bold text-slate-700 ml-1">Tên sản phẩm</label>
            <input 
              type="text" 
              formControlName="name"
              placeholder="VD: Kem dưỡng da"
              class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="text-sm font-bold text-slate-700 ml-1">Đơn giá (đ)</label>
              <input 
                type="number" 
                formControlName="price"
                class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
              />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-bold text-slate-700 ml-1">Số lượng tồn kho</label>
              <input 
                type="number" 
                formControlName="stock"
                class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
              />
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
              [disabled]="productForm.invalid || isSubmitting"
              class="flex-1 px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isSubmitting ? 'Đang lưu...' : (isEditing ? 'Cập nhật' : 'Thêm mới') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Toast Notification -->
    <div *ngIf="toastMessage" 
         [ngClass]="toastType === 'success' ? 'bg-emerald-500' : 'bg-rose-500'"
         class="fixed bottom-8 right-8 px-6 py-3 text-white rounded-2xl shadow-2xl animate-in slide-in-from-right-full duration-300 z-[100] font-bold">
      {{ toastMessage }}
    </div>
  `
})
export class InventoryComponent implements OnInit {
  products: ProductDto[] = [];
  filteredProducts: ProductDto[] = [];
  searchTerm: string = '';

  showModal = false;
  isEditing = false;
  selectedId: number | null = null;
  productForm: FormGroup;
  isSubmitting = false;

  toastMessage: string | null = null;
  toastType: 'success' | 'error' = 'success';

  constructor(
    private managementService: ManagementService,
    private exportService: ExportService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]]
    });
  }

  exportExcel(): void {
    const columns = [
      { header: 'TÊN SẢN PHẨM', key: 'name', width: 40 },
      { header: 'ĐƠN GIÁ', key: 'price', width: 20 },
      { header: 'TỒN KHO', key: 'stock', width: 15 }
    ];

    const data = this.products.map(p => ({
      name: p.name,
      price: (p.price || 0).toLocaleString('vi-VN') + 'đ',
      stock: p.stock
    }));

    this.exportService.exportExcel(data, columns, 'Danh_muc_san_pham');
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.managementService.getProducts().subscribe(res => {
      if (res.success && res.data) {
        this.products = res.data;
        this.filterProducts();
      }
    });
  }

  filterProducts(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredProducts = this.products.filter(p => p.name.toLowerCase().includes(term));
    this.cdr.detectChanges();
  }

  openAddModal(): void {
    this.isEditing = false;
    this.selectedId = null;
    this.productForm.reset({
      name: '',
      price: 0,
      stock: 0
    });
    this.showModal = true;
  }

  editProduct(product: ProductDto): void {
    this.isEditing = true;
    this.selectedId = product.id;
    this.productForm.patchValue({
      name: product.name,
      price: product.price,
      stock: product.stock
    });
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  onSubmit(): void {
    if (this.productForm.invalid) return;

    this.isSubmitting = true;
    const request: CreateProductRequest = this.productForm.value;

    const obs = this.isEditing && this.selectedId
      ? this.managementService.updateProduct(this.selectedId, request)
      : this.managementService.createProduct(request);

    obs.subscribe({
      next: (res) => {
        if (res.success) {
          this.showToast(this.isEditing ? 'Cập nhật thành công!' : 'Thêm mới thành công!', 'success');
          this.loadProducts();
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

  deleteProduct(id: number): void {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;

    this.managementService.deleteProduct(id).subscribe(res => {
      if (res.success) {
        this.showToast('Xóa thành công!', 'success');
        this.loadProducts();
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
