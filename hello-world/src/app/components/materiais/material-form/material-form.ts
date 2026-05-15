import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MaterialService } from '../../../services/material.service';
import { Material } from '../../../models/material.model';

@Component({
  selector: 'app-material-form',
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
  templateUrl: './material-form.html',
  styleUrls: ['./material-form.css']
})
export class MaterialForm implements OnInit {
  formGroup!: FormGroup;
  isEdit = false;
  materialId?: number;

  constructor(
    private formBuilder: FormBuilder,
    private materialService: MaterialService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.formGroup = this.formBuilder.group({
      nome: ['', Validators.required]
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    const parsedId = idParam ? Number(idParam) : undefined;

    if (parsedId && !isNaN(parsedId)) {
      this.isEdit = true;
      this.materialId = parsedId;
      this.materialService.findById(parsedId).subscribe({
        next: (material) => this.formGroup.patchValue(material),
        error: () => this.snackBar.open('Erro ao carregar o material.', 'Fechar', { duration: 3000 })
      });
    }
  }

  salvar(): void {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    const payload = { nome: this.formGroup.get('nome')?.value } as Material;

    if (this.isEdit && this.materialId) {
      this.materialService.update({ ...payload, id: this.materialId }).subscribe({
        next: () => this.router.navigateByUrl('/materiais'),
        error: () => this.snackBar.open('Erro ao atualizar o material.', 'Fechar', { duration: 3000 })
      });
      return;
    }

    this.materialService.create(payload).subscribe({
      next: () => this.router.navigateByUrl('/materiais'),
      error: () => this.snackBar.open('Erro ao cadastrar o material.', 'Fechar', { duration: 3000 })
    });
  }
}
