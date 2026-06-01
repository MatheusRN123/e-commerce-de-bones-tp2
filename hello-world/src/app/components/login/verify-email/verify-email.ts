import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './verify-email.html',
  styleUrl: './verify-email.css'
})
export class VerifyEmailComponent implements OnInit {
  mensagem = 'Verificando Gmail...';
  erro = '';

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    public router: Router
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token') ?? '';
    if (!token) {
      this.erro = 'Link de verificacao de Gmail invalido.';
      this.mensagem = '';
      return;
    }

    this.authService.verifyEmail(token).subscribe({
      next: () => {
        this.mensagem = 'Gmail verificado. Voce ja pode fazer login.';
      },
      error: () => {
        this.erro = 'Link de Gmail invalido ou expirado.';
        this.mensagem = '';
      }
    });
  }
}
