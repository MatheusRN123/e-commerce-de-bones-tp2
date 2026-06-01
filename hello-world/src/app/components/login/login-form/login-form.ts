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
      email: ['', [Validators.required, Validators.email, Validators.pattern(/^[A-Za-z0-9._%+-]+@gmail\.com$/)]],
      senha: ['', Validators.required]
    });
  }

  entrar(): void {
    if (this.formGroup.invalid) return;
    this.erro = '';
    const value = this.formGroup.value;
    const dto: any = { email: (value.email as string).trim(), senha: value.senha };

    console.log('Login payload:', dto);

    this.authService.login(dto).subscribe({
      next: () => this.router.navigateByUrl('/bones'),
      error: (err) => {
        this.erro = err.status === 403
          ? 'Verifique seu Gmail antes de fazer login.'
          : 'Gmail ou senha invalidos.';
      }
    });
  }

  cadastrar(): void {
    this.router.navigateByUrl('/register');
  }

  esqueciSenha(): void {
    this.router.navigateByUrl('/forgot-password');
  }
}
