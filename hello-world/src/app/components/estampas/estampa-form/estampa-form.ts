import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { EstampaService } from '../../../services/estampa.service';
import { Estampa } from '../../../models/estampa.model';

@Component({
  selector: 'app-estampa-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatInputModule,
  ],
  templateUrl: './estampa-form.html',
  styleUrls: ['./estampa-form.css']
})
export class EstampaForm implements OnInit {
  form!: FormGroup;
  isEdit = false;
  estampaId?: number;

  tipos = [
    { value: 'DIGITAL', label: 'Digital' },
    { value: 'BORDADA', label: 'Bordada' }
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly estampaService: EstampaService,
    private readonly route: ActivatedRoute,
    public readonly router: Router,
    private readonly snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      tipo: ['DIGITAL', Validators.required],
      nome: ['', Validators.required],
      posicao: ['', Validators.required],
      descricao: [''],
      // digital
      resolucao: [''],
      // bordada
      corLinha: [''],
      quantCores: [null]
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    const parsedId = idParam ? Number(idParam) : undefined;

    if (parsedId && !Number.isNaN(parsedId)) {
      this.isEdit = true;
      this.estampaId = parsedId;
      this.estampaService.findById(parsedId).subscribe({
        next: (e) => this.prefill(e),
        error: () => this.snackBar.open('Erro ao carregar a estampa.', 'Fechar', { duration: 3000 })
      });
    }
  }

  prefill(e: Estampa): void {
    this.form.patchValue({
      tipo: e.tipo?.toUpperCase() ?? 'DIGITAL',
      nome: e.nome,
      posicao: e.posicao,
      descricao: e.descricao,
      resolucao: e.resolucao ?? '',
      corLinha: e.corLinha ?? '',
      quantCores: e.quantCores ?? null
    });
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const tipo = this.form.get('tipo')?.value as string;
    const payloadCommon = {
      nome: this.form.get('nome')?.value,
      posicao: this.form.get('posicao')?.value,
      descricao: this.form.get('descricao')?.value
    };

    if (this.isEdit && this.estampaId) {
      if (tipo === 'DIGITAL') {
        const dto = { ...payloadCommon, resolucao: this.form.get('resolucao')?.value };
        this.estampaService.updateDigital(this.estampaId, dto).subscribe({
          next: () => this.router.navigateByUrl('/estampas'),
          error: () => this.snackBar.open('Erro ao atualizar estampa digital.', 'Fechar', { duration: 3000 })
        });
        return;
      }

      // BORDADA
      const dtoB = { ...payloadCommon, corLinha: this.form.get('corLinha')?.value, quantCores: this.form.get('quantCores')?.value };
      this.estampaService.updateBordada(this.estampaId, dtoB).subscribe({
        next: () => this.router.navigateByUrl('/estampas'),
        error: () => this.snackBar.open('Erro ao atualizar estampa bordada.', 'Fechar', { duration: 3000 })
      });

      return;
    }

    // Create
    if (tipo === 'DIGITAL') {
      const dto = { ...payloadCommon, resolucao: this.form.get('resolucao')?.value };
      this.estampaService.createDigital(dto).subscribe({
        next: () => this.router.navigateByUrl('/estampas'),
        error: () => this.snackBar.open('Erro ao cadastrar estampa digital.', 'Fechar', { duration: 3000 })
      });
      return;
    }

    const dtoB = { ...payloadCommon, corLinha: this.form.get('corLinha')?.value, quantCores: this.form.get('quantCores')?.value };
    this.estampaService.createBordada(dtoB).subscribe({
      next: () => this.router.navigateByUrl('/estampas'),
      error: () => this.snackBar.open('Erro ao cadastrar estampa bordada.', 'Fechar', { duration: 3000 })
    });
  }

  dropdownOpen = false;

  get tipoLabel(): string {
    const val = this.form.get('tipo')?.value;
    return this.tipos.find(t => t.value === val)?.label ?? 'Selecione...';
  }

  selecionarTipo(valor: string): void {
    this.form.get('tipo')?.setValue(valor);
  }

  @HostListener('document:click', ['$event'])
  fecharDropdown(event: Event): void {
    const el = event.target as HTMLElement;
    if (!el.closest('.dropdown-wrap')) {
      this.dropdownOpen = false;
    }
  }
}
