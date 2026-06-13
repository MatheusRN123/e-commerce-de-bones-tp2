import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { PedidoResponse } from '../../../models/pedido.model';
import { PedidoService } from '../../../services/pedido.service';

@Component({
  selector: 'app-order-admin',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    DatePipe,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './order-admin.html',
  styleUrl: './order-admin.css'
})
export class OrderAdmin implements OnInit {
  pedidos: PedidoResponse[] = [];
  loading = true;

  constructor(
    private pedidoService: PedidoService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.pedidoService.findAll().subscribe({
      next: (pedidos) => {
        this.pedidos = pedidos;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Nao foi possivel carregar os pedidos.', 'Fechar', { duration: 3000 });
      }
    });
  }
}
