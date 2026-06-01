import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css'
})
export class ForgotPasswordComponent {
  formGroup: FormGroup;
  mensagem = '';
  erro = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    public router: Router
  ) {
    this.formGroup = this.fb.group({
      email: ['', [Validators.required, Validators.email, Validators.pattern(/^[A-Za-z0-9._%+-]+@gmail\.com$/)]]
    });
  }

  enviar(): void {
    if (this.formGroup.invalid) return;

    this.mensagem = '';
    this.erro = '';
    const email = (this.formGroup.value.email as string).trim();

    this.authService.forgotPassword(email).subscribe({
      next: () => {
        this.mensagem = 'Se o Gmail existir, enviaremos um link para cadastrar uma nova senha.';
        this.formGroup.reset();
      },
      error: () => {
        this.erro = 'Nao foi possivel enviar o link para o Gmail agora.';
      }
    });
  }
}
