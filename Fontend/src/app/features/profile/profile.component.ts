import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <!-- Toast Notification -->
      <div *ngIf="showToast()" class="fixed top-8 right-8 z-50 animate-in slide-in-from-right-8 fade-in duration-300">
        <div class="bg-white px-6 py-4 rounded-2xl shadow-xl border-2 flex items-center gap-4"
             [ngClass]="toastType() === 'success' ? 'border-teal-100 shadow-teal-100/50' : 'border-rose-100 shadow-rose-100/50'">
          <div class="w-10 h-10 rounded-full flex items-center justify-center"
               [ngClass]="toastType() === 'success' ? 'bg-teal-50 text-teal-500' : 'bg-rose-50 text-rose-500'">
            <lucide-icon [name]="toastType() === 'success' ? 'check-circle-2' : 'alert-circle'" class="w-5 h-5"></lucide-icon>
          </div>
          <div>
            <p class="text-sm font-black text-slate-800">{{ toastType() === 'success' ? 'Tuyệt vời!' : 'Úi, có lỗi!' }}</p>
            <p class="text-xs font-bold text-slate-500 mt-0.5">{{ toastMessage() }}</p>
          </div>
          <button (click)="showToast.set(false)" class="ml-4 p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400">
            <lucide-icon name="x" class="w-4 h-4"></lucide-icon>
          </button>
        </div>
      </div>

      <div class="max-w-4xl mx-auto space-y-8">
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-black text-slate-800 tracking-tight">Hồ sơ cá nhân</h1>
            <p class="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">Cập nhật thông tin và mật khẩu của Phương Anh</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Avatar Section -->
          <div class="col-span-1">
            <div class="bg-white p-6 rounded-3xl border-2 border-teal-50 shadow-sm flex flex-col items-center">
              <div class="relative w-40 h-40 group mb-6">
                <div class="absolute inset-0 bg-teal-100/50 rounded-full blur-xl animate-pulse group-hover:bg-teal-200/50 transition-colors"></div>
                <img [src]="avatarUrl()" class="relative w-full h-full rounded-full object-cover border-4 border-white shadow-mint z-10" alt="Avatar">
                
                <!-- Upload Overlay -->
                <label class="absolute inset-0 z-20 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <lucide-icon name="camera" class="w-8 h-8 text-white"></lucide-icon>
                  <input type="file" class="hidden" accept="image/*" (change)="onFileSelected($event)">
                </label>
              </div>
              <h2 class="text-xl font-black text-teal-700">Phương Anh</h2>
              <p class="text-xs font-bold text-pink-400 uppercase tracking-widest mt-1">Admin</p>
              
              <button (click)="fileInput.click()" class="mt-6 w-full py-3 bg-teal-50 text-teal-600 font-bold rounded-xl hover:bg-teal-100 transition-colors flex items-center justify-center gap-2">
                 <lucide-icon name="upload" class="w-4 h-4"></lucide-icon>
                 Đổi ảnh đại diện
              </button>
              <input #fileInput type="file" class="hidden" accept="image/*" (change)="onFileSelected($event)">
            </div>
          </div>

          <!-- Info & Password Section -->
          <div class="col-span-1 md:col-span-2 space-y-8">
            <!-- Info Form -->
            <div class="bg-white p-8 rounded-3xl border-2 border-teal-50 shadow-sm">
              <h3 class="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                <lucide-icon name="user" class="w-5 h-5 text-teal-500"></lucide-icon>
                Thông tin chung
              </h3>
              
              <div class="space-y-4">
                <div>
                  <label class="text-xs font-black text-slate-400 uppercase tracking-widest ml-4">Họ và tên</label>
                  <input type="text" name="name" [value]="name()" (input)="name.set($any($event.target).value)" class="w-full mt-1 px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-teal-400 focus:ring-4 focus:ring-teal-50 outline-none font-bold text-slate-700 transition-all">
                </div>
                <div>
                  <label class="text-xs font-black text-slate-400 uppercase tracking-widest ml-4">Email / ID</label>
                  <input type="text" name="email" [value]="email()" disabled class="w-full mt-1 px-4 py-3 bg-slate-100 border-2 border-slate-200 rounded-2xl outline-none font-bold text-slate-500 cursor-not-allowed">
                </div>
                <div>
                  <label class="text-xs font-black text-slate-400 uppercase tracking-widest ml-4">Số điện thoại</label>
                  <input type="text" name="phone" [value]="phone()" (input)="phone.set($any($event.target).value)" class="w-full mt-1 px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-teal-400 focus:ring-4 focus:ring-teal-50 outline-none font-bold text-slate-700 transition-all">
                </div>
              </div>
              
              <div class="mt-6 flex justify-end">
                 <button (click)="saveInfo()" class="px-6 py-3 bg-teal-500 text-white font-black rounded-xl shadow-lg shadow-teal-200 hover:bg-teal-600 active:scale-95 transition-all flex items-center gap-2">
                    <lucide-icon name="save" class="w-4 h-4"></lucide-icon>
                    Lưu thông tin
                 </button>
              </div>
            </div>

            <!-- Password Form -->
            <div class="bg-white p-8 rounded-3xl border-2 border-pink-50 shadow-sm">
              <h3 class="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                <lucide-icon name="lock" class="w-5 h-5 text-pink-400"></lucide-icon>
                Đổi mật khẩu
              </h3>

              <div class="space-y-4">
                <div>
                  <label class="text-xs font-black text-slate-400 uppercase tracking-widest ml-4">Mật khẩu hiện tại</label>
                  <div class="relative mt-1">
                    <input [type]="showCurrentPass() ? 'text' : 'password'" name="currentPass" [value]="currentPassword()" (input)="currentPassword.set($any($event.target).value)" class="w-full px-4 py-3 pr-12 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-pink-400 focus:ring-4 focus:ring-pink-50 outline-none font-bold text-slate-700 transition-all">
                    <button type="button" (click)="showCurrentPass.set(!showCurrentPass())" class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-pink-400 transition-colors">
                      <lucide-icon [name]="showCurrentPass() ? 'eye-off' : 'eye'" class="w-5 h-5"></lucide-icon>
                    </button>
                  </div>
                </div>
                <div>
                  <label class="text-xs font-black text-slate-400 uppercase tracking-widest ml-4">Mật khẩu mới</label>
                  <div class="relative mt-1">
                    <input [type]="showNewPass() ? 'text' : 'password'" name="newPass" [value]="newPassword()" (input)="newPassword.set($any($event.target).value)" class="w-full px-4 py-3 pr-12 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-pink-400 focus:ring-4 focus:ring-pink-50 outline-none font-bold text-slate-700 transition-all">
                    <button type="button" (click)="showNewPass.set(!showNewPass())" class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-pink-400 transition-colors">
                      <lucide-icon [name]="showNewPass() ? 'eye-off' : 'eye'" class="w-5 h-5"></lucide-icon>
                    </button>
                  </div>
                </div>
                <div>
                  <label class="text-xs font-black text-slate-400 uppercase tracking-widest ml-4">Xác nhận mật khẩu mới</label>
                  <div class="relative mt-1">
                    <input [type]="showConfirmPass() ? 'text' : 'password'" name="confirmPass" [value]="confirmPassword()" (input)="confirmPassword.set($any($event.target).value)" class="w-full px-4 py-3 pr-12 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-pink-400 focus:ring-4 focus:ring-pink-50 outline-none font-bold text-slate-700 transition-all">
                    <button type="button" (click)="showConfirmPass.set(!showConfirmPass())" class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-pink-400 transition-colors">
                      <lucide-icon [name]="showConfirmPass() ? 'eye-off' : 'eye'" class="w-5 h-5"></lucide-icon>
                    </button>
                  </div>
                </div>
              </div>

              <div class="mt-6 flex justify-end">
                 <button (click)="changePassword()" class="px-6 py-3 bg-pink-400 text-white font-black rounded-xl shadow-lg shadow-pink-200 hover:bg-pink-500 active:scale-95 transition-all flex items-center gap-2">
                    <lucide-icon name="key" class="w-4 h-4"></lucide-icon>
                    Cập nhật mật khẩu
                 </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  avatarUrl = signal('images/admin-avatar.png');
  
  name = signal('Phương Anh');
  email = signal('panh05122004@gmail.com');
  phone = signal('0987654321');

  currentPassword = signal('');
  newPassword = signal('');
  confirmPassword = signal('');

  showCurrentPass = signal(false);
  showNewPass = signal(false);
  showConfirmPass = signal(false);

  showToast = signal(false);
  toastMessage = signal('');
  toastType = signal<'success' | 'error'>('success');
  toastTimeout: any;

  displayToast(message: string, type: 'success' | 'error') {
    this.toastMessage.set(message);
    this.toastType.set(type);
    this.showToast.set(true);
    
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      this.showToast.set(false);
    }, 3000);
  }

  ngOnInit() {
    const savedAvatar = localStorage.getItem('user_avatar');
    if (savedAvatar) {
      this.avatarUrl.set(savedAvatar);
    }
    
    const savedInfo = localStorage.getItem('user_info');
    if (savedInfo) {
      try {
        const parsed = JSON.parse(savedInfo);
        if (parsed) {
          if (parsed.name) this.name.set(parsed.name);
          if (parsed.email) this.email.set(parsed.email);
          if (parsed.phone) this.phone.set(parsed.phone);
        }
      } catch (e) {
        console.error('Error parsing user_info', e);
      }
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const result = e.target.result;
        this.avatarUrl.set(result);
        localStorage.setItem('user_avatar', result);
        // Dispatch an event so other components (header, sidebar) can update
        window.dispatchEvent(new Event('avatar-updated'));
      };
      reader.readAsDataURL(file);
    }
  }

  saveInfo() {
    const info = {
      name: this.name(),
      email: this.email(),
      phone: this.phone()
    };
    localStorage.setItem('user_info', JSON.stringify(info));
    this.displayToast('Đã cập nhật thông tin thành công!', 'success');
    window.dispatchEvent(new Event('info-updated'));
  }

  changePassword() {
    const current = this.currentPassword();
    const newPass = this.newPassword();
    const confirm = this.confirmPassword();

    if (!current || !newPass || !confirm) {
      this.displayToast('Vui lòng điền đầy đủ thông tin mật khẩu!', 'error');
      return;
    }

    if (newPass !== confirm) {
      this.displayToast('Mật khẩu xác nhận không khớp!', 'error');
      return;
    }

    this.displayToast('Đổi mật khẩu thành công!', 'success');
    this.currentPassword.set('');
    this.newPassword.set('');
    this.confirmPassword.set('');
    this.showCurrentPass.set(false);
    this.showNewPass.set(false);
    this.showConfirmPass.set(false);
  }
}
