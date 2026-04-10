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

import { Material } from '../../../models/material.model';
import { MaterialService } from '../../../services/material.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-material-list',
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
  templateUrl: './material-list.html',
  styleUrl: './material-list.css',
})
export class MaterialList implements OnInit {
  totalRecords = 0;
  page = 0;
  pageSize = 8;
  termoBusca: string = '';

  displayedColumns: string[] = [
    'numero',
    'nome',
    'acao',
  ];

  dataSource = new MatTableDataSource<Material>([]);

  constructor(
    private materialService: MaterialService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.carregarDados();
    this.carregarTotal();
  }

  carregarTotal(): void {
    this.materialService.count().subscribe({
      next: (total) => {
        this.totalRecords = total;
      },
      error: () => {
        this.snackBar.open('Erro ao carregar a quantidade de materiais.', 'Fechar', {
          duration: 3000,
        });
      },
    });
  }

  carregarDados(): void {
    this.materialService.findAll(this.page, this.pageSize).subscribe({
      next: (data) => {
        this.dataSource.data = data;
      },
      error: () => {
        this.snackBar.open('Erro ao carregar os materiais.', 'Fechar', {
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
      this.materialService.count().subscribe({
        next: (total) => {
          this.totalRecords = total;
        },
        error: () => {
          this.snackBar.open('Erro ao carregar a quantidade de materiais.', 'Fechar', {
            duration: 3000,
          });
        }
      });
      return;
    }

    this.materialService.findByNome(value).subscribe({
      next: (data) => {
        this.dataSource.data = [...data];
        this.totalRecords = data.length;
      },
      error: () => {
        this.snackBar.open('Erro ao buscar os materiais.', 'Fechar', {
          duration: 3000,
        });
      }
    });
  }

  confirmarExclusao(material: Material): void {
    const snack = this.snackBar.open(`Excluir "${material.nome}"?`, 'Confirmar', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });

    snack.onAction().subscribe(() => this.excluir(material));
  }

  private excluir(material: Material): void {
    this.materialService.delete(material.id).subscribe({
      next: () => {
        this.snackBar.open('Material excluído com sucesso!', 'Fechar', {
          duration: 3000,
        });

        if (this.dataSource.data.length === 1 && this.page > 0) {
          this.page--;
        }

        this.carregarTotal();
        this.carregarDados();
      },
      error: () => {
        this.snackBar.open('Erro ao excluir o material.', 'Fechar', {
          duration: 3000,
        });
      },
    });
  }
}
