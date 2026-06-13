import { Component } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from './services/auth.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatIconModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

  sidebarOpen = false;
  lightTheme = false;

  private readonly publicRoutes = [
    '/',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/verify-email'
  ];

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    this.lightTheme = localStorage.getItem('theme') === 'light';
    document.body.classList.toggle('light-theme', this.lightTheme);
  }

  get isPublicRoute(): boolean {
    const currentPath = this.router.url.split('?')[0];
    return this.publicRoutes.includes(currentPath);
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  toggleTheme(): void {
    this.lightTheme = !this.lightTheme;
    localStorage.setItem('theme', this.lightTheme ? 'light' : 'dark');
    document.body.classList.toggle('light-theme', this.lightTheme);
  }

}
