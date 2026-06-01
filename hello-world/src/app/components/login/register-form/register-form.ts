import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register-form.html',
  styleUrl: './register-form.css'
})
export class RegisterComponent {
  formGroup: FormGroup;
  mensagem = '';
  sucesso = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    public router: Router
  ) {
    this.formGroup = this.fb.group({
      email: ['', [Validators.required, Validators.email, Validators.pattern(/^[A-Za-z0-9._%+-]+@gmail\.com$/)]],
      senha: ['', [Validators.required, Validators.minLength(6)]],
      confirmar: ['', Validators.required]
    });
  }

  cadastrar(): void {
    if (this.formGroup.invalid) return;

    const v = this.formGroup.value;
    if (v.senha !== v.confirmar) {
      this.mensagem = 'As senhas não coincidem.';
      return;
    }

    this.mensagem = '';
    this.sucesso = '';
    const dto = { email: (v.email as string).trim(), senha: v.senha };
    this.authService.register(dto).subscribe({
      next: () => {
        this.sucesso = 'Cadastro realizado. Verifique seu Gmail antes de fazer login.';
        this.formGroup.reset();
      },
      error: (err) => {
        console.error('Erro no cadastro:', err);
        this.mensagem = err.status === 409
          ? 'Este Gmail ja esta cadastrado.'
          : 'Erro ao cadastrar. Tente novamente.';
      }
    });
  }
}
