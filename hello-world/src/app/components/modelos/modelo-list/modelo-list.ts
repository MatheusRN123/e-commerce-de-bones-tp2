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

import { Modelo } from '../../../models/modelo.model';
import { ModeloService } from '../../../services/modelo.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-modelo-list',
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
  templateUrl: './modelo-list.html',
  styleUrl: './modelo-list.css',
})
export class ModeloList implements OnInit {
  totalRecords = 0;
  page = 0;
  pageSize = 8;
  termoBusca: string = '';

  displayedColumns: string[] = [
    'numero',
    'nome',
    'categoria',
    'estilo',
    'acao',
  ];

  dataSource = new MatTableDataSource<Modelo>([]);

  constructor(
    private modeloService: ModeloService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.carregarDados();
    this.carregarTotal();
  }

  carregarTotal(): void {
    this.modeloService.count().subscribe({
      next: (total) => {
        this.totalRecords = total;
      },
      error: () => {
        this.snackBar.open('Erro ao carregar a quantidade de modelos.', 'Fechar', {
          duration: 3000,
        });
      },
    });
  }

  carregarDados(): void {
    this.modeloService.findAll(this.page, this.pageSize).subscribe({
      next: (data) => {
        this.dataSource.data = data;
      },
      error: () => {
        this.snackBar.open('Erro ao carregar os modelos.', 'Fechar', {
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
    const value = this.termoBusca.trim().toLowerCase();

    if (!value) {
      this.page = 0;
      this.carregarDados();
      this.modeloService.count().subscribe({
        next: (total) => {
          this.totalRecords = total;
        },
        error: () => {
          this.snackBar.open('Erro ao carregar a quantidade de modelos.', 'Fechar', {
            duration: 3000,
          });
        }
      });
      return;
    }

    this.modeloService.findByNome(value).subscribe({
      next: (data) => {
        this.dataSource.data = [...data];
        this.totalRecords = data.length;
      },
      error: () => {
        this.snackBar.open('Erro ao buscar os modelos.', 'Fechar', {
          duration: 3000,
        });
      }
    });
  }

  confirmarExclusao(modelo: Modelo): void {
    const snack = this.snackBar.open(`Excluir "${modelo.nome}"?`, 'Confirmar', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });

    snack.onAction().subscribe(() => this.excluir(modelo));
  }

  private excluir(modelo: Modelo): void {
    this.modeloService.delete(modelo.id).subscribe({
      next: () => {
        this.snackBar.open('Modelo excluído com sucesso!', 'Fechar', {
          duration: 3000,
        });

        if (this.dataSource.data.length === 1 && this.page > 0) {
          this.page--;
        }

        this.carregarTotal();
        this.carregarDados();
      },
      error: () => {
        this.snackBar.open('Erro ao excluir o modelo.', 'Fechar', {
          duration: 3000,
        });
      },
    });
  }
}
