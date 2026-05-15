import { Component, OnInit } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

import { Bone } from '../../../models/bone.model';
import { BoneService } from '../../../services/bone.service';
import { ArquivoService } from '../../../services/arquivo.service';

type FiltroStatus = 'todos' | 'ok' | 'critico' | 'esgotado';

// Colunas base (sempre visíveis)
const COLUNAS_BASE = ['numero', 'imagem', 'nome', 'cor', 'marca', 'modelo', 'material'];

// Colunas opcionais (controláveis pelo toggle)
const COLUNAS_MEDIDAS = ['categoriaAba', 'tamanhoAba', 'profundidade', 'circunferencia'];
const COLUNA_BORDADO = 'bordado';
const COLUNA_ESTAMPAS = 'estampas';

// Colunas finais (sempre no final)
const COLUNAS_FIM = ['estoque', 'preco', 'acao'];

// Colunas mobile (reduzidas)
const COLUNAS_MOBILE = ['numero', 'imagem', 'nome', 'estoque', 'preco', 'acao'];

@Component({
  selector: 'app-bone-list',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    RouterLink,
    MatFormFieldModule,
    MatTableModule,
    MatInputModule,
    MatPaginator,
    MatPaginatorModule,
    MatSnackBarModule,
    FormsModule,
  ],
  templateUrl: './bone-list.html',
  styleUrl: './bone-list.css',
})
export class BoneList implements OnInit {
  totalRecords = 0;
  page = 0;
  pageSize = 8;
  termoBusca = '';

  // Estado dos toggles de coluna
  showMedidas = false;
  showEstampas = true;
  showBordado = true;

  // Filtro de status de estoque
  filtroStatus: FiltroStatus = 'todos';

  // Dados brutos carregados da API (para filtragem local de status)
  private todosOsDados: Bone[] = [];

  displayedColumns: string[] = [];

  dataSource = new MatTableDataSource<Bone>([]);

  constructor(
    private readonly boneService: BoneService,
    private readonly arquivoService: ArquivoService,
    private readonly snackBar: MatSnackBar,
    private readonly breakpointObserver: BreakpointObserver
  ) {}

  ngOnInit(): void {
    this.carregarDados();
    this.carregarTotal();
    this.setupResponsiveColumns();
  }

  // ---- Dados filtrados para o contador ----
  get dadosFiltrados(): Bone[] {
    return this.dataSource.data;
  }

  // ---- Colunas responsivas + toggles ----
  setupResponsiveColumns(): void {
    this.breakpointObserver
      .observe([Breakpoints.HandsetPortrait, Breakpoints.TabletPortrait])
      .subscribe((result) => {
        if (result.matches) {
          this.displayedColumns = COLUNAS_MOBILE;
        } else {
          this.recalcularColunas();
        }
      });
  }

  recalcularColunas(): void {
    const cols: string[] = [...COLUNAS_BASE];
    if (this.showMedidas) cols.push(...COLUNAS_MEDIDAS);
    if (this.showBordado) cols.push(COLUNA_BORDADO);
    if (this.showEstampas) cols.push(COLUNA_ESTAMPAS);
    cols.push(...COLUNAS_FIM);
    this.displayedColumns = cols;
  }

  toggleColuna(coluna: 'bordado'): void {
    this.showBordado = !this.showBordado;
    this.recalcularColunas();
  }

  // Chamado pelo template quando showMedidas ou showEstampas mudam via click
  onToggleMedidas(): void {
    this.showMedidas = !this.showMedidas;
    this.recalcularColunas();
  }

  onToggleEstampas(): void {
    this.showEstampas = !this.showEstampas;
    this.recalcularColunas();
  }

  // ---- Filtro de status ----
  setFiltroStatus(status: FiltroStatus): void {
    this.filtroStatus = status;
    this.aplicarFiltroStatus();
  }

  private aplicarFiltroStatus(): void {
    let dados = [...this.todosOsDados];

    switch (this.filtroStatus) {
      case 'ok':
        dados = dados.filter((b) => b.quantidadeEstoque > 5);
        break;
      case 'critico':
        dados = dados.filter((b) => b.quantidadeEstoque > 0 && b.quantidadeEstoque <= 5);
        break;
      case 'esgotado':
        dados = dados.filter((b) => b.quantidadeEstoque === 0);
        break;
    }

    this.dataSource.data = dados;
  }

  // ---- Carregamento ----
  carregarDados(): void {
    this.boneService.findAll(this.page, this.pageSize).subscribe({
      next: (data) => {
        this.todosOsDados = data;
        this.aplicarFiltroStatus();
      },
      error: () => {
        this.snackBar.open('Erro ao carregar os bonés.', 'Fechar', { duration: 3000 });
      },
    });
  }

  carregarTotal(): void {
    this.boneService.count().subscribe({
      next: (total) => {
        this.totalRecords = total;
      },
      error: () => {
        this.snackBar.open('Erro ao carregar a quantidade de bonés.', 'Fechar', { duration: 3000 });
      },
    });
  }

  // ---- Paginação ----
  paginar(event: PageEvent): void {
    this.page = event.pageIndex;
    this.pageSize = event.pageSize;
    this.carregarDados();
  }

  // ---- Busca ----
  applyFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value.trim();
    if (!value) {
      this.page = 0;
      this.carregarDados();
      this.carregarTotal();
    }
  }

  buscar(): void {
    const value = this.termoBusca.trim().toLowerCase();

    if (!value) {
      this.page = 0;
      this.filtroStatus = 'todos';
      this.carregarDados();
      this.boneService.count().subscribe({
        next: (total) => (this.totalRecords = total),
        error: () =>
          this.snackBar.open('Erro ao carregar a quantidade de bonés.', 'Fechar', { duration: 3000 }),
      });
      return;
    }

    this.boneService.findByNome(value).subscribe({
      next: (data) => {
        this.todosOsDados = data;
        this.totalRecords = data.length;
        this.aplicarFiltroStatus();
      },
      error: () => {
        this.snackBar.open('Erro ao buscar os bonés.', 'Fechar', { duration: 3000 });
      },
    });
  }

  // ---- Stats ----
  menorPreco(): number {
    const dados = this.dataSource.data;
    if (!dados.length) return 0;
    return Math.min(...dados.map((b) => b.preco ?? 0));
  }

  maiorPreco(): number {
    const dados = this.dataSource.data;
    if (!dados.length) return 0;
    return Math.max(...dados.map((b) => b.preco ?? 0));
  }

  // ---- Exclusão ----
  confirmarExclusao(bone: Bone): void {
    const snack = this.snackBar.open(`Excluir "${bone.nome}"?`, 'Confirmar', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });

    snack.onAction().subscribe(() => this.excluir(bone));
  }

  private excluir(bone: Bone): void {
    this.boneService.delete(bone.id).subscribe({
      next: () => {
        this.snackBar.open('Boné excluído com sucesso!', 'Fechar', { duration: 3000 });

        if (this.dataSource.data.length === 1 && this.page > 0) {
          this.page--;
        }

        this.carregarTotal();
        this.carregarDados();
      },
      error: () => {
        this.snackBar.open('Erro ao excluir o boné.', 'Fechar', { duration: 3000 });
      },
    });
  }

  getUrlImagem(imagemFid?: string): string {
    return imagemFid ? this.arquivoService.getUrlDownload(imagemFid) : '/assets/placeholder-image.png';
  }
}