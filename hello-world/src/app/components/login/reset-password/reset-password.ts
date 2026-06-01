import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css'
})
export class ResetPasswordComponent implements OnInit {
  formGroup: FormGroup;
  token = '';
  mensagem = '';
  erro = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private authService: AuthService,
    public router: Router
  ) {
    this.formGroup = this.fb.group({
      senha: ['', [Validators.required, Validators.minLength(6)]],
      confirmar: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
    if (!this.token) this.erro = 'Link de redefinicao invalido.';
  }

  salvar(): void {
    this.formGroup.markAllAsTouched();

    if (this.formGroup.invalid || !this.token) return;

    const value = this.formGroup.value;
    if (value.senha !== value.confirmar) {
      this.erro = 'As senhas nao coincidem.';
      return;
    }

    this.erro = '';
    this.mensagem = '';
    this.authService.resetPassword(this.token, value.senha).subscribe({
      next: () => {
        this.mensagem = 'Senha atualizada. Voce ja pode fazer login.';
        this.formGroup.reset();
      },
      error: () => {
        this.erro = 'Link invalido ou expirado.';
      }
    });
  }

  senhaMenorQueSeis(): boolean {
    const senha = this.formGroup.get('senha');
    return !!senha?.hasError('minlength') && (senha.dirty || senha.touched);
  }

  confirmacaoDiferente(): boolean {
    const value = this.formGroup.value;
    const confirmar = this.formGroup.get('confirmar');
    return !!confirmar?.value && value.senha !== value.confirmar && (confirmar.dirty || confirmar.touched);
  }
}
