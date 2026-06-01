import { Component } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

  sidebarOpen = false;
isPublicRoute: any;

  private readonly publicRoutes = [
    '/',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/verify-email'
  ];

  constructor(private router: Router) {}

  get isPublicRoute(): boolean {
    const currentPath = this.router.url.split('?')[0];
    return this.publicRoutes.includes(currentPath);
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

}
