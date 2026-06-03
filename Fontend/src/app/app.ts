import { Component, signal, ApplicationRef } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './core/layout/sidebar.component';
import { HeaderComponent } from './core/layout/header.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  isLoginPage = false;
  sidebarOpen = signal(false);

  constructor(private router: Router, private appRef: ApplicationRef) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isLoginPage = event.urlAfterRedirects.includes('/login');
      // Force change detection once navigation completes in zoneless mode
      this.appRef.tick();
    });
  }
}
