import { Component, OnInit, OnDestroy, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <header class="bg-white/50 backdrop-blur-xl border-b-2 border-pink-50 h-24 flex items-center justify-between px-4 md:px-10 sticky top-0 z-40">
      <div class="flex items-center gap-3 flex-1">
        <!-- Hamburger Menu Button -->
        <button (click)="toggleSidebar.emit()" class="p-2 hover:bg-slate-100 rounded-xl md:hidden transition-colors flex items-center justify-center">
          <lucide-icon name="menu" class="w-6 h-6 text-slate-600"></lucide-icon>
        </button>

        <div class="bg-white px-4 md:px-6 py-2 rounded-2xl shadow-sm border border-pink-100 animate-soft-bounce max-w-[200px] sm:max-w-none truncate">
          <p class="text-[10px] md:text-xs font-black text-pink-300 uppercase tracking-widest truncate">{{ greeting }}</p>
        </div>
      </div>

      <div class="flex items-center gap-x-6">
        <div class="flex items-center gap-x-3 cursor-pointer group" routerLink="/profile">
          <div class="text-right hidden sm:block">
            <p class="text-sm font-black text-slate-700 leading-none group-hover:text-[#ff8fb1] transition-colors">{{ userName }}</p>
            <p class="text-[10px] font-bold text-pink-300 mt-1 uppercase tracking-tighter">Đang hoạt động</p>
          </div>
          <div class="relative p-1 bg-pink-50 rounded-full border-2 border-white shadow-md group-hover:scale-110 transition-transform duration-500">
            <img class="w-10 h-10 rounded-full object-cover" [src]="avatarUrl" alt="avatar">
            <div class="absolute -top-1 -right-1 w-4 h-4 bg-[#ff8fb1] border-2 border-white rounded-full animate-pulse flex items-center justify-center">
               <lucide-icon name="heart" class="w-2 h-2 text-white"></lucide-icon>
            </div>
          </div>
        </div>
      </div>
    </header>
  `
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Output() toggleSidebar = new EventEmitter<void>();
  avatarUrl = 'images/admin-avatar.png';
  userName = 'PA';
  greeting = '';
  
  constructor(private cdr: ChangeDetectorRef) {}
  
  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) {
      return 'Chào buổi sáng! Chúc bạn một ngày thật xinh ☀️';
    } else if (hour >= 11 && hour < 14) {
      return 'Chào buổi trưa! Chúc bạn một ngày thật xinh 🍀';
    } else if (hour >= 14 && hour < 18) {
      return 'Chào buổi chiều! Chúc bạn một ngày thật xinh ✨';
    } else if (hour >= 18 && hour < 22) {
      return 'Chào buổi tối! Chúc bạn một buổi tối thật xinh 🌙';
    } else {
      return 'Chào đêm muộn! Chúc bạn một đêm thật bình yên 💤';
    }
  }
  
  private updateListener = () => {
    const savedAvatar = localStorage.getItem('user_avatar');
    if (savedAvatar) this.avatarUrl = savedAvatar;
    
    const savedInfo = localStorage.getItem('user_info');
    if (savedInfo) {
      const info = JSON.parse(savedInfo);
      this.userName = info.name || 'PA';
    }
    this.greeting = this.getGreeting();
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
