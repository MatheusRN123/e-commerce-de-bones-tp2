import { Component, OnInit } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';

import { Estoque } from '../../../models/estoque.model';
import { EstoqueService } from '../../../services/estoque.service';

@Component({
  selector: 'app-estoque-list',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatTableModule,
    MatInputModule,
    MatPaginator,
    MatPaginatorModule,
    MatSnackBarModule,
    FormsModule,
  ],
  templateUrl: './estoque-list.html',
  styleUrls: ['./estoque-list.css'],
})
export class EstoqueList implements OnInit {
  totalRecords = 0;
  page = 0;
  pageSize = 8;
  termoBusca: string = '';

  /** Linha atualmente expandida (painel de quantidade) */
  expandedRow: Estoque | null = null;

  /**
   * Mapas indexados por obj.id para guardar os valores dos inputs
   * de forma independente por linha.
   */
  novaQuantidade: Record<number, number | null> = {};
  qtdAdicionar: Record<number, number | null> = {};

  displayedColumns: string[] = [
    'numero',
    'idBone',
    'quantidade',
    'dataAtualizacao',
    'acao',
  ];

  dataSource = new MatTableDataSource<Estoque>([]);

  constructor(
    private readonly estoqueService: EstoqueService,
    private readonly snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.carregarDados();
    this.carregarTotal();
  }

  // ─────────────────────────── CARREGAMENTO ───────────────────────────

  carregarTotal(): void {
    this.estoqueService.count().subscribe({
      next: (total) => (this.totalRecords = total),
      error: () =>
        this.snackBar.open('Erro ao carregar a quantidade de estoques.', 'Fechar', { duration: 3000 }),
    });
  }

  carregarDados(): void {
    this.estoqueService.findAll(this.page, this.pageSize).subscribe({
      next: (data) => {
        this.dataSource.data = data;
        // Fecha painel ao recarregar
        this.expandedRow = null;
      },
      error: (error) => {
        const message = error?.status === 403
          ? 'Apenas administradores podem carregar os estoques.'
          : 'Erro ao carregar os estoques.';
        this.snackBar.open(message, 'Fechar', { duration: 3000 });
      },
    });
  }

  paginar(event: PageEvent): void {
    const pageIndex = Number(event.pageIndex);
    const pageSize = Number(event.pageSize);

    this.page = Number.isFinite(pageIndex) ? pageIndex : 0;
    this.pageSize = Number.isFinite(pageSize) ? pageSize : 8;
    this.carregarDados();
  }

  applyFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value.trim();
    if (!value) {
      this.page = 0;
      this.carregarDados();
      this.carregarTotal();
    }
  }

  buscar(): void {
    const value = this.termoBusca?.toString().trim();

    if (!value) {
      this.page = 0;
      this.carregarDados();
      this.carregarTotal();
      return;
    }

    const id = Number.parseInt(value, 10);
    if (Number.isNaN(id)) {
      this.snackBar.open('Por favor, insira um ID válido.', 'Fechar', { duration: 3000 });
      return;
    }

    this.estoqueService.findByIdBone(id).subscribe({
      next: (data) => {
        this.dataSource.data = [data];
        this.totalRecords = 1;
      },
      error: () => {
        this.dataSource.data = [];
        this.totalRecords = 0;
        this.snackBar.open('Estoque não encontrado para esse boné.', 'Fechar', { duration: 3000 });
      },
    });
  }

  // ─────────────────────────── PAINEL INLINE ───────────────────────────

  toggleExpandRow(row: Estoque): void {
    this.expandedRow = this.expandedRow === row ? null : row;
  }

  // ─────────────────────────── QUANTIDADE ───────────────────────────

  atualizarQuantidade(estoque: Estoque): void {
    const quantidade = this.novaQuantidade[estoque.id];

    if (quantidade == null || quantidade < 0) {
      this.snackBar.open('Informe uma quantidade válida (≥ 0).', 'Fechar', { duration: 3000 });
      return;
    }

    this.estoqueService.atualizarQuantidade(estoque.id, { quantidade }).subscribe({
      next: () => {
        this.snackBar.open(
          `Quantidade do boné #${estoque.idBone} atualizada para ${quantidade}!`,
          'Fechar',
          { duration: 3000 }
        );
        this.novaQuantidade[estoque.id] = null;
        this.carregarDados();
      },
      error: () =>
        this.snackBar.open('Erro ao atualizar a quantidade.', 'Fechar', { duration: 3000 }),
    });
  }

  adicionarQuantidade(estoque: Estoque): void {
    const quantidade = this.qtdAdicionar[estoque.id];

    if (!quantidade || quantidade <= 0) {
      this.snackBar.open('Informe uma quantidade para adicionar (> 0).', 'Fechar', { duration: 3000 });
      return;
    }

    this.estoqueService.adicionarQuantidade(estoque.id, { quantidade }).subscribe({
      next: () => {
        this.snackBar.open(
          `+${quantidade} unidades adicionadas ao boné #${estoque.idBone}!`,
          'Fechar',
          { duration: 3000 }
        );
        this.qtdAdicionar[estoque.id] = null;
        this.carregarDados();
      },
      error: () =>
        this.snackBar.open('Erro ao adicionar quantidade.', 'Fechar', { duration: 3000 }),
    });
  }

  // ─────────────────────────── EXCLUSÃO ───────────────────────────

  // ─────────────────────────── UTILS ───────────────────────────

  formatarData(data: string): string {
    if (!data) return '-';

    const parts = data.split('-').map(Number);
    if (parts.length >= 3 && parts.every(n => !Number.isNaN(n))) {
      const [year, month, day] = parts;
      return new Date(year, month - 1, day).toLocaleDateString('pt-BR');
    }

    const date = new Date(data);
    return Number.isNaN(date.getTime()) ? data : date.toLocaleDateString('pt-BR');
  }

  getRowNumber(index?: number, item?: Estoque): number {
    const page = Number.isFinite(Number(this.page)) ? Number(this.page) : 0;
    const pageSize = Number.isFinite(Number(this.pageSize)) ? Number(this.pageSize) : 8;

    let rowIndex = Number.isFinite(Number(index)) ? Number(index) : -1;

    if (rowIndex < 0 && item) {
      const found = this.dataSource?.data?.indexOf(item) ?? -1;
      rowIndex = found >= 0 ? found : -1;
    }

    if (rowIndex >= 0) {
      return page * pageSize + rowIndex + 1;
    }

    return 0;
  }

  isQtdAdicionarInvalida(id: number): boolean {
    const value = this.qtdAdicionar[id];
    return value == null || value <= 0;
  }
}
