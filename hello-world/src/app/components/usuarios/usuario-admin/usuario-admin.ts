import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Usuario } from '../../../models/usuario.model';
import { UsuarioService } from '../../../services/usuario.service';

@Component({
  selector: 'app-usuario-admin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatSnackBarModule,
    MatTableModule,
    MatToolbarModule,
    MatTooltipModule
  ],
  templateUrl: './usuario-admin.html',
  styleUrl: './usuario-admin.css'
})
export class UsuarioAdmin implements OnInit {
  totalRecords = 0;
  page = 0;
  pageSize = 8;
  termoBusca = '';

  displayedColumns: string[] = ['numero', 'nome', 'email', 'perfil', 'acao'];

  dataSource = new MatTableDataSource<Usuario>([]);
  private usuarios: Usuario[] = [];

  constructor(
    private usuarioService: UsuarioService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    this.usuarioService.findAll().subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios;
        this.totalRecords = usuarios.length;
        this.atualizarPagina();
      },
      error: () => {
        this.snackBar.open('Erro ao carregar os usuarios.', 'Fechar', { duration: 3000 });
      }
    });
  }

  paginar(event: PageEvent): void {
    this.page = event.pageIndex;
    this.pageSize = event.pageSize;
    this.atualizarPagina();
  }

  applyFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value.trim();
    if (!value) this.buscar();
  }

  buscar(): void {
    const termo = this.termoBusca.trim().toLowerCase();
    const filtrados = termo
      ? this.usuarios.filter((usuario) =>
          usuario.nome.toLowerCase().includes(termo) ||
          usuario.email.toLowerCase().includes(termo) ||
          usuario.perfil.toLowerCase().includes(termo)
        )
      : this.usuarios;

    this.totalRecords = filtrados.length;
    this.page = 0;
    this.dataSource.data = this.paginarLista(filtrados);
  }

  confirmarExclusao(usuario: Usuario): void {
    const snack = this.snackBar.open(`Excluir "${usuario.nome}"?`, 'Confirmar', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });

    snack.onAction().subscribe(() => this.excluir(usuario));
  }

  promover(usuario: Usuario): void {
    this.usuarioService.promoteToAdmin(usuario.id).subscribe({
      next: () => {
        this.snackBar.open('Usuario promovido a administrador.', 'Fechar', { duration: 3000 });
        this.carregarDados();
      },
      error: () => this.snackBar.open('Erro ao promover usuario.', 'Fechar', { duration: 3000 })
    });
  }

  perfilLabel(usuario: Usuario): string {
    return usuario.perfil === 'ADM' ? 'Administrador' : 'Usuario';
  }

  private excluir(usuario: Usuario): void {
    this.usuarioService.delete(usuario.id).subscribe({
      next: () => {
        this.snackBar.open('Usuario excluido com sucesso!', 'Fechar', { duration: 3000 });
        this.carregarDados();
      },
      error: () => {
        this.snackBar.open('Erro ao excluir o usuario.', 'Fechar', { duration: 3000 });
      }
    });
  }

  private atualizarPagina(): void {
    const termo = this.termoBusca.trim().toLowerCase();
    const lista = termo
      ? this.usuarios.filter((usuario) =>
          usuario.nome.toLowerCase().includes(termo) ||
          usuario.email.toLowerCase().includes(termo) ||
          usuario.perfil.toLowerCase().includes(termo)
        )
      : this.usuarios;

    this.totalRecords = lista.length;
    this.dataSource.data = this.paginarLista(lista);
  }

  private paginarLista(lista: Usuario[]): Usuario[] {
    const start = this.page * this.pageSize;
    return lista.slice(start, start + this.pageSize);
  }
}
