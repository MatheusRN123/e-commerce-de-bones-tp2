import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MarcaService } from '../../../services/marca.service';
import { Marca } from '../../../models/marca.model';

@Component({
  selector: 'app-marca-form',
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
  templateUrl: './marca-form.html',
  styleUrls: ['./marca-form.css']
})
export class MarcaForm implements OnInit {
  formGroup!: FormGroup;
  isEdit = false;
  marcaId?: number;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly marcaService: MarcaService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.formGroup = this.formBuilder.group({
      nome: ['', Validators.required]
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    const parsedId = idParam ? Number(idParam) : undefined;

    if (parsedId && !Number.isNaN(parsedId)) {
      this.isEdit = true;
      this.marcaId = parsedId;
      this.marcaService.findById(parsedId).subscribe({
        next: (marca) => this.formGroup.patchValue(marca),
        error: () => this.snackBar.open('Erro ao carregar a marca.', 'Fechar', { duration: 3000 })
      });
    }
  }

  salvar(): void {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    const payload = { nome: this.formGroup.get('nome')?.value } as Marca;

    if (this.isEdit && this.marcaId) {
      this.marcaService.update({ ...payload, id: this.marcaId }).subscribe({
        next: () => this.router.navigateByUrl('/marcas'),
        error: () => this.snackBar.open('Erro ao atualizar a marca.', 'Fechar', { duration: 3000 })
      });
      return;
    }

    this.marcaService.create(payload).subscribe({
      next: () => this.router.navigateByUrl('/marcas'),
      error: () => this.snackBar.open('Erro ao cadastrar a marca.', 'Fechar', { duration: 3000 })
    });
  }
}
