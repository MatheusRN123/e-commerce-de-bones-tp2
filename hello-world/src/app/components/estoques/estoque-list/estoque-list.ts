import { Component, OnInit } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { Estoque } from '../../../models/estoque.model';
import { EstoqueService } from '../../../services/estoque.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-estoque-list',
  standalone: true,
  imports: [
    CommonModule,
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
    FormsModule
  ],
  templateUrl: './estoque-list.html',
  styleUrl: './estoque-list.css',
})
export class EstoqueList implements OnInit {
  totalRecords = 0;
  page = 0;
  pageSize = 8;
  termoBusca: string = '';

  displayedColumns: string[] = [
    'numero',
    'idBone',
    'quantidade',
    'dataAtualizacao',
    'acao',
  ];

  dataSource = new MatTableDataSource<Estoque>([]);

  constructor(
    private estoqueService: EstoqueService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.carregarDados();
    this.carregarTotal();
  }

  carregarTotal(): void {
    this.estoqueService.count().subscribe({
      next: (total) => {
        this.totalRecords = total;
      },
      error: () => {
        this.snackBar.open('Erro ao carregar a quantidade de estoques.', 'Fechar', {
          duration: 3000,
        });
      },
    });
  }

  carregarDados(): void {
    this.estoqueService.findAll(this.page, this.pageSize).subscribe({
      next: (data) => {
        this.dataSource.data = data;
      },
      error: () => {
        this.snackBar.open('Erro ao carregar os estoques.', 'Fechar', {
          duration: 3000,
        });
      },
    });
  }

  paginar(event: PageEvent): void {
    this.page = event.pageIndex;
    this.pageSize = event.pageSize;
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
    console.log('clicou na lupa');
    const value = this.termoBusca?.toString().trim();

    if (!value) {
      this.page = 0;
      this.carregarDados();
      this.estoqueService.count().subscribe({
        next: (total) => {
          this.totalRecords = total;
        },
        error: () => {
          this.snackBar.open('Erro ao carregar a quantidade de estoques.', 'Fechar', {
            duration: 3000,
          });
        }
      });
      return;
    }

    const id = parseInt(value);
    if (isNaN(id)) {
      this.snackBar.open('Por favor, insira um ID válido.', 'Fechar', {
        duration: 3000,
      });
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
        this.snackBar.open('Estoque não encontrado para esse boné.', 'Fechar', {
          duration: 3000,
        });
      }
    });
  }

  confirmarExclusao(estoque: Estoque): void {
    const snack = this.snackBar.open(`Excluir estoque do boné ${estoque.idBone}?`, 'Confirmar', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });

    snack.onAction().subscribe(() => this.excluir(estoque));
  }

  private excluir(estoque: Estoque): void {
    this.estoqueService.delete(estoque.id).subscribe({
      next: () => {
        this.snackBar.open('Estoque excluído com sucesso!', 'Fechar', {
          duration: 3000,
        });

        if (this.dataSource.data.length === 1 && this.page > 0) {
          this.page--;
        }

        this.carregarTotal();
        this.carregarDados();
      },
      error: () => {
        this.snackBar.open('Erro ao excluir o estoque.', 'Fechar', {
          duration: 3000,
        });
      },
    });
  }

  formatarData(data: string): string {
    if (!data) return '-';
    return new Date(data).toLocaleDateString('pt-BR');
  }
}
