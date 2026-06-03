import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-[#f0fdfa] p-4 relative overflow-hidden">
      <!-- Background Decorations -->
      <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-100/30 rounded-full blur-[100px] animate-pulse"></div>
      <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-100/30 rounded-full blur-[100px] animate-pulse [animation-delay:1s]"></div>

      <div class="relative w-full max-w-md animate-in fade-in zoom-in duration-700">
        <!-- Login Card -->
        <div class="bg-white/80 backdrop-blur-2xl p-10 rounded-[3rem] border-2 border-white shadow-mint relative overflow-hidden">
          
          <!-- Logo Section -->
          <div class="flex flex-col items-center mb-10">
            <div class="relative w-32 h-32 mb-6">
              <div class="absolute inset-0 bg-teal-200/20 rounded-[2rem] blur-xl"></div>
              <div class="relative w-full h-full rounded-[2rem] overflow-hidden border-2 border-teal-50 shadow-sm bg-white p-2">
                <img src="img/ảnh 2.jpg" class="w-full h-full object-contain" alt="logo">
              </div>
              <!-- Icon Trái tim SVG -->
              <span class="absolute -top-2 -right-2 w-6 h-6 text-pink-400 fill-pink-400 animate-bounce">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
              </span>
            </div>
            <h2 class="text-3xl font-black text-[#2c7a7b] tracking-tight">Web này chỉ dành cho Phương Anh!</h2>
            <p class="text-pink-400 font-bold text-sm mt-2 uppercase tracking-widest animate-bounce">Có phải Phương Anh không mà đòi vào? 🧐</p>
          </div>

          <!-- Form -->
          <div class="space-y-6">
            <div *ngIf="errorMessage" class="p-4 bg-rose-50 border-2 border-rose-100 rounded-2xl text-rose-500 text-xs font-black animate-shake">
              {{ errorMessage }}
            </div>

            <div class="space-y-2">
              <label class="text-[10px] font-black text-teal-600 uppercase tracking-widest ml-4">ID Chính Chủ</label>
              <div class="relative group">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-teal-200 group-focus-within:text-[#4fd1c5] transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                </span>
                <input type="email" #emailInput [value]="email" (input)="email = emailInput.value; errorMessage = ''" (change)="email = emailInput.value"
                  placeholder="Nhập Email của Phương Anh..."
                  class="w-full pl-12 pr-4 py-4 bg-teal-50/30 border-2 border-teal-50 rounded-2xl focus:border-[#4fd1c5] focus:ring-4 focus:ring-teal-100 outline-none font-bold text-slate-600 transition-all">
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-[10px] font-black text-teal-600 uppercase tracking-widest ml-4">Mật mã bí mật</label>
              <div class="relative group">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-teal-200 group-focus-within:text-[#4fd1c5] transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </span>
                <input type="password" #passInput [value]="password" (input)="password = passInput.value"
                  placeholder="••••••••"
                  class="w-full pl-12 pr-4 py-4 bg-teal-50/30 border-2 border-teal-50 rounded-2xl focus:border-[#4fd1c5] focus:ring-4 focus:ring-teal-100 outline-none font-bold text-slate-600 transition-all">
              </div>
            </div>

            <button (click)="handleLogin()" 
              class="w-full py-4 bg-gradient-to-r from-[#2c7a7b] to-[#4fd1c5] text-white font-black rounded-2xl shadow-lg shadow-teal-200 hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer">
              <span>Xác nhận danh tính</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
            </button>
          </div>

          <!-- Footer -->
          <div class="mt-10 text-center">
             <p class="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">Cấm người lạ vào phá phách! 🚫</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .animate-shake {
      animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
    }
    @keyframes shake {
      10%, 90% { transform: translate3d(-1px, 0, 0); }
      20%, 80% { transform: translate3d(2px, 0, 0); }
      30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
      40%, 60% { transform: translate3d(4px, 0, 0); }
    }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';

  constructor(private router: Router) { }

  handleLogin() {
    const cleanEmail = this.email.trim().toLowerCase();
    if (cleanEmail === 'panh05122004@gmail.com') {
      this.errorMessage = '';
      console.log('Chào mừng Phương Anh trở về! ❤️');
      // Chuyển hướng ngay lập tức
      this.router.navigate(['/dashboard']).then(success => {
        if (!success) {
          this.errorMessage = 'Lỗi điều hướng, hãy thử lại! 🛠';
        }
      });
    } else if (!this.email) {
      this.errorMessage = 'Phương Anh chưa nhập ID kìa! 🙄';
    } else {
      this.errorMessage = 'Đã bảo không phải Phương Anh thì đừng có cố! 😤';
    }
  }
}
