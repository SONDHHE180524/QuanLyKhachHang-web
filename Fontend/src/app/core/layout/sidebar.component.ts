import { Component, OnInit, OnDestroy, ChangeDetectorRef, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <!-- Mobile Sidebar Backdrop Overlay -->
    <div *ngIf="isOpen" (click)="close.emit()" class="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden animate-in fade-in duration-300"></div>

    <aside [class.translate-x-0]="isOpen" [class.-translate-x-full]="!isOpen"
      class="flex flex-col w-64 h-screen px-6 py-8 overflow-y-auto bg-white border-r-2 border-teal-50 fixed left-0 top-0 z-50 md:translate-x-0 transition-transform duration-300 shadow-premium md:shadow-none">
      <div class="flex flex-col items-center group cursor-pointer mb-8 w-full">
        <div class="relative w-40 h-40 flex items-center justify-center">
          <!-- Hiệu ứng hào quang bao quanh ảnh -->
          <div class="absolute inset-0 bg-teal-100/30 rounded-full blur-3xl animate-soft-pulse"></div>
          
          <!-- Ảnh Logo lớn (Hình bàn tay trái tim) -->
          <div class="relative w-full h-full rounded-full overflow-hidden border-4 border-white shadow-mint transition-all duration-500 group-hover:scale-105 bg-white">
            <img src="img/ảnh 2.jpg" class="w-full h-full object-contain p-4" alt="logo">
          </div>

          <!-- Các trái tim nhỏ bay xung quanh -->
          <lucide-icon name="heart" class="absolute -top-1 -right-1 w-8 h-8 text-[#ff8fb1] fill-[#ff8fb1] animate-bounce"></lucide-icon>
          <lucide-icon name="heart" class="absolute top-1/2 -left-4 w-5 h-5 text-teal-300 animate-pulse"></lucide-icon>
          <lucide-icon name="heart" class="absolute -bottom-2 right-1/4 w-6 h-6 text-rose-300 animate-bounce [animation-delay:0.5s]"></lucide-icon>
        </div>
      </div>

      <nav class="flex-1 space-y-2">
        <a *ngFor="let item of menuItems" 
           [routerLink]="item.path"
           routerLinkActive="bg-teal-50 text-[#319795] font-black border-r-4 border-[#4fd1c5]"
           class="flex items-center px-4 py-3 text-slate-400 transition-all duration-300 rounded-2xl group hover:bg-teal-50/50 hover:text-[#319795]">
          <lucide-icon [name]="item.icon" class="w-5 h-5 transition-transform group-hover:scale-110"></lucide-icon>
          <span class="mx-3 text-sm font-bold">{{ item.label }}</span>
          <div *ngIf="item.badge" class="w-2 h-2 bg-[#4fd1c5] rounded-full ml-auto animate-pulse"></div>
        </a>
      </nav>

      <div class="mt-auto pt-6 border-t border-teal-50">
        <div class="flex items-center p-4 bg-gradient-to-br from-teal-50 to-white rounded-2xl border border-teal-100 group cursor-pointer transition-all duration-300 hover:shadow-md hover:border-teal-200" routerLink="/profile">
          <div class="relative">
             <img class="object-cover w-11 h-11 rounded-full border-2 border-white shadow-mint group-hover:scale-110 transition-transform duration-300" [src]="avatarUrl" alt="avatar">
             <div class="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full shadow-sm"></div>
          </div>
          <div class="ml-3">
            <p class="text-xs font-black text-teal-600 group-hover:text-teal-500 transition-colors">{{ userName }}</p>
            <p class="text-[10px] font-bold text-slate-300 uppercase group-hover:text-slate-400 transition-colors">Trực tuyến</p>
          </div>
        </div>
        
        <a href="#" class="flex items-center mt-4 px-4 py-2 text-slate-300 transition-all duration-300 rounded-xl hover:bg-rose-50 hover:text-rose-400 group text-xs font-bold">
          <lucide-icon [name]="'log-out'" class="w-4 h-4"></lucide-icon>
          <span class="mx-3">Đăng xuất</span>
        </a>
      </div>
    </aside>
  `
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  readonly menuItems = [
    { label: 'Dashboard', icon: 'layout-dashboard', path: '/dashboard' },
    { label: 'Công việc hằng ngày', icon: 'clipboard-list', path: '/work-logs', badge: true },
    { label: 'Khách hàng', icon: 'users', path: '/customers' },
    { label: 'Sản phẩm', icon: 'package', path: '/inventory' },
    { label: 'Dịch vụ', icon: 'sparkles', path: '/services' },
    { label: 'Cài đặt', icon: 'settings', path: '/settings' },
  ];

  avatarUrl = 'images/admin-avatar.png';
  userName = 'PA';
  
  constructor(private cdr: ChangeDetectorRef) {}
  
  private updateListener = () => {
    const savedAvatar = localStorage.getItem('user_avatar');
    if (savedAvatar) this.avatarUrl = savedAvatar;
    
    const savedInfo = localStorage.getItem('user_info');
    if (savedInfo) {
      const info = JSON.parse(savedInfo);
      this.userName = info.name || 'PA';
    }
    this.cdr.detectChanges();
  };

  ngOnInit() {
    this.updateListener();
    window.addEventListener('avatar-updated', this.updateListener);
    window.addEventListener('info-updated', this.updateListener);
  }

  ngOnDestroy() {
    window.removeEventListener('avatar-updated', this.updateListener);
    window.removeEventListener('info-updated', this.updateListener);
  }
}
