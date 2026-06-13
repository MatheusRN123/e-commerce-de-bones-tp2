import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { UsuarioPayload } from '../../../models/usuario.model';
import { UsuarioService } from '../../../services/usuario.service';

@Component({
  selector: 'app-usuario-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatSnackBarModule],
  templateUrl: './usuario-form.html',
  styleUrl: './usuario-form.css'
})
export class UsuarioForm implements OnInit {
  formGroup!: FormGroup;
  isEdit = false;
  usuarioId?: number;

  constructor(
    private formBuilder: FormBuilder,
    private usuarioService: UsuarioService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.formGroup = this.formBuilder.group({
      nome: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(6)]],
      perfil: ['USER', Validators.required]
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    const parsedId = idParam ? Number(idParam) : undefined;

    if (parsedId && !isNaN(parsedId)) {
      this.isEdit = true;
      this.usuarioId = parsedId;
      this.formGroup.get('senha')?.clearValidators();
      this.formGroup.get('senha')?.setValue('');
      this.formGroup.get('senha')?.updateValueAndValidity();
      this.usuarioService.findById(parsedId).subscribe({
        next: (usuario) => this.formGroup.patchValue({
          nome: usuario.nome,
          email: usuario.email,
          perfil: usuario.perfil
        }),
        error: () => this.snackBar.open('Erro ao carregar o usuario.', 'Fechar', { duration: 3000 })
      });
      return;
    }

  }

  salvar(): void {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    const payload = this.formGroup.value as UsuarioPayload;
    if (this.isEdit) {
      delete payload.senha;
    }

    if (this.isEdit && this.usuarioId) {
      this.usuarioService.update(this.usuarioId, payload).subscribe({
        next: () => this.router.navigateByUrl('/usuarios'),
        error: () => this.snackBar.open('Erro ao atualizar o usuario.', 'Fechar', { duration: 3000 })
      });
      return;
    }

    this.usuarioService.create(payload).subscribe({
      next: () => this.router.navigateByUrl('/usuarios'),
      error: () => this.snackBar.open('Erro ao cadastrar o usuario.', 'Fechar', { duration: 3000 })
    });
  }

  dropdownAberto: string | null = null;

  @HostListener('document:click')
  fecharDropdowns(): void {
    this.dropdownAberto = null;
  }

  toggleDropdown(campo: string): void {
    this.dropdownAberto = this.dropdownAberto === campo ? null : campo;
  }

  selecionarPerfil(perfil: string): void {
    this.formGroup.get('perfil')?.setValue(perfil);
    this.dropdownAberto = null;
  }
}
