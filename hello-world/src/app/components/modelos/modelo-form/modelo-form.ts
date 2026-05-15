import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ModeloService } from '../../../services/modelo.service';
import { Modelo } from '../../../models/modelo.model';

@Component({
  selector: 'app-modelo-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatSnackBarModule
  ],
  templateUrl: './modelo-form.html',
  styleUrls: ['./modelo-form.css']
})
export class ModeloForm implements OnInit {
  formGroup!: FormGroup;
  isEdit = false;
  modeloId?: number;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly modeloService: ModeloService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.formGroup = this.formBuilder.group({
      nome: ['', Validators.required],
      categoria: ['', Validators.required],
      estilo: ['', Validators.required]
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    const parsedId = idParam ? Number(idParam) : undefined;

    if (parsedId && !Number.isNaN(parsedId)) {
      this.isEdit = true;
      this.modeloId = parsedId;
      this.modeloService.findById(parsedId).subscribe({
        next: (modelo) => this.formGroup.patchValue(modelo),
        error: () => this.snackBar.open('Erro ao carregar o modelo.', 'Fechar', { duration: 3000 })
      });
    }
  }

  salvar(): void {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    const payload = {
      nome: this.formGroup.get('nome')?.value,
      categoria: this.formGroup.get('categoria')?.value,
      estilo: this.formGroup.get('estilo')?.value
    } as Modelo;

    if (this.isEdit && this.modeloId) {
      this.modeloService.update({ ...payload, id: this.modeloId }).subscribe({
        next: () => this.router.navigateByUrl('/modelos'),
        error: () => this.snackBar.open('Erro ao atualizar o modelo.', 'Fechar', { duration: 3000 })
      });
      return;
    }

    this.modeloService.create(payload).subscribe({
      next: () => this.router.navigateByUrl('/modelos'),
      error: () => this.snackBar.open('Erro ao cadastrar o modelo.', 'Fechar', { duration: 3000 })
    });
  }
}
