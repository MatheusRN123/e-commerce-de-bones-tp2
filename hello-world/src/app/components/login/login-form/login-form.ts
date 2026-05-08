import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login-form.html',
  styleUrl: './login-form.css'
})
export class LoginComponent {
  formGroup: FormGroup;
  erro = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.formGroup = this.fb.group({
      login: ['', Validators.required],
      senha: ['', Validators.required]
    });
  }

  entrar(): void {
    if (this.formGroup.invalid) return;
    this.erro = '';
    this.authService.login(this.formGroup.value).subscribe({
      next: () => this.router.navigateByUrl('/bones'),
      error: () => { this.erro = 'Login ou senha inválidos.'; }
    });
  }
}