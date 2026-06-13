import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { PedidoResponse } from '../../../models/pedido.model';
import { AuthService } from '../../../services/auth.service';
import { PedidoService } from '../../../services/pedido.service';

interface OrderDetailsData {
  pedidoId: number;
  tipoPagamento: 'PIX' | 'CARTAO' | 'BOLETO';
  frete: number;
  statusFrete: string;
  subtotal?: number;
  desconto?: number;
  totalPago?: number;
  parcelas: number;
  valorParcela: number;
  pix?: { payload: string; expiresAt: string };
  boleto?: { codigoBarras: string; dataVencimento: string };
}

@Component({
  selector: 'app-purchase-summary',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    DatePipe,
    FormsModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './purchase-summary.html',
  styleUrl: './purchase-summary.css'
})
export class PurchaseSummary implements OnInit {
  readonly shippingStatuses = ['Pedido recebido', 'Preparando envio', 'Enviado', 'Em rota de entrega', 'Entregue'];

  pedido?: PedidoResponse;
  orderDetails?: OrderDetailsData;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private pedidoService: PedidoService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.pedidoService.findById(id).subscribe({
      next: (pedido) => {
        this.pedido = pedido;
        this.orderDetails = this.loadOrderDetails(pedido);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Nao foi possivel carregar o resumo da compra.', 'Fechar', { duration: 3000 });
      }
    });
  }

  pixQrCodeUrl(): string {
    if (!this.orderDetails?.pix?.payload) return '';

    return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(this.orderDetails.pix.payload)}`;
  }

  pixExpiration(): string {
    if (!this.orderDetails?.pix?.expiresAt) return '';

    return new Date(this.orderDetails.pix.expiresAt).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  copyPixPayload(): void {
    if (!this.orderDetails?.pix?.payload) return;

    navigator.clipboard?.writeText(this.orderDetails.pix.payload);
    this.snackBar.open('Codigo Pix copiado.', 'Fechar', { duration: 2500 });
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  updateShippingStatus(statusFrete: string): void {
    if (!this.pedido || !this.orderDetails || !this.isAdmin) return;

    this.orderDetails = { ...this.orderDetails, statusFrete };
    localStorage.setItem(`bone-order-details-${this.pedido.id}`, JSON.stringify(this.orderDetails));
    this.snackBar.open('Status do frete atualizado.', 'Fechar', { duration: 2500 });
  }

  totalWithFrete(): number {
    return this.orderDetails?.totalPago ?? ((this.pedido?.valorTotal ?? 0) + (this.orderDetails?.frete ?? 0));
  }

  boletoVencimento(): string {
    const date = this.orderDetails?.boleto?.dataVencimento;
    if (!date) return '';

    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  }

  private loadOrderDetails(pedido: PedidoResponse): OrderDetailsData {
    const raw = localStorage.getItem(`bone-order-details-${pedido.id}`);
    if (raw) {
      try {
        return JSON.parse(raw) as OrderDetailsData;
      } catch {
        localStorage.removeItem(`bone-order-details-${pedido.id}`);
      }
    }

    const oldPix = this.loadLegacyPixPayment(pedido.id);
    const fallback: OrderDetailsData = {
      pedidoId: pedido.id,
      tipoPagamento: this.paymentType(pedido),
      frete: 0,
      statusFrete: 'Pedido recebido',
      subtotal: pedido.valorTotal,
      desconto: 0,
      totalPago: pedido.valorTotal,
      parcelas: 1,
      valorParcela: pedido.pagamento?.valor ?? pedido.valorTotal
    };

    if (oldPix) {
      fallback.tipoPagamento = 'PIX';
      fallback.pix = {
        payload: oldPix.payload,
        expiresAt: oldPix.expiresAt
      };
    }

    localStorage.setItem(`bone-order-details-${pedido.id}`, JSON.stringify(fallback));
    return fallback;
  }

  private loadLegacyPixPayment(pedidoId: number): { payload: string; expiresAt: string } | undefined {
    const raw = localStorage.getItem(`bone-pix-payment-${pedidoId}`);
    if (!raw) return undefined;

    try {
      return JSON.parse(raw) as { payload: string; expiresAt: string };
    } catch {
      localStorage.removeItem(`bone-pix-payment-${pedidoId}`);
      return undefined;
    }
  }

  private paymentType(pedido: PedidoResponse): 'PIX' | 'CARTAO' | 'BOLETO' {
    const tipo = pedido.pagamento?.tipo?.toUpperCase() ?? '';
    if (tipo.includes('PIX')) return 'PIX';
    if (tipo.includes('BOLETO')) return 'BOLETO';
    return 'CARTAO';
  }
}
