import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { CartItem } from '../../../models/cart-item.model';
import { CouponValidation } from '../../../models/coupon.model';
import { Endereco } from '../../../models/endereco.model';
import { PagamentoPayload } from '../../../models/pedido.model';
import { SavedCard } from '../../../models/saved-card.model';
import { CartService } from '../../../services/cart.service';
import { EnderecoService } from '../../../services/endereco.service';
import { PedidoService } from '../../../services/pedido.service';
import { SavedCardService } from '../../../services/saved-card.service';

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    FormsModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './checkout-page.html',
  styleUrl: './checkout-page.css'
})
export class CheckoutPage implements OnInit {
  readonly pixKey = '62719512362';

  items: CartItem[] = [];
  coupon?: CouponValidation;
  enderecos: Endereco[] = [];
  selectedEnderecoId?: number;
  tipoPagamento: 'PIX' | 'CARTAO' | 'BOLETO' = 'PIX';
  loadingEnderecos = true;
  finishing = false;
  cards: SavedCard[] = [];
  selectedCardId = '';
  parcelas = 1;

  pix = {
    chave: this.pixKey,
    tipoChave: 'CPF'
  };

  cartao = {
    nomeTitular: '',
    numero: '',
    validade: '',
    cvv: ''
  };

  boleto = {
    codigoBarras: '23790.00000 00000.000000 00000.000000 1 00000000000000',
    dataVencimento: this.defaultBoletoDate()
  };

  constructor(
    private cartService: CartService,
    private enderecoService: EnderecoService,
    private pedidoService: PedidoService,
    private savedCardService: SavedCardService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.items = this.cartService.getItems();
    this.coupon = this.cartService.getCoupon() ?? undefined;

    if (!this.items.length) {
      this.router.navigateByUrl('/carrinho');
      return;
    }

    this.loadEnderecos();
    this.cards = this.savedCardService.getCards();
  }

  subtotal(): number {
    return this.items.reduce((total, item) => total + item.bone.preco * item.quantidade, 0);
  }

  frete(): number {
    const endereco = this.enderecoSelecionado();
    if (!endereco) return 0;

    const distancia = this.distanciaDePalmas(endereco.nomeCidade);
    return Math.round((18 + distancia * 0.08) * 100) / 100;
  }

  total(): number {
    return Math.max(this.subtotal() - this.desconto(), 0) + this.frete();
  }

  desconto(): number {
    return this.coupon?.valorDesconto ?? 0;
  }

  valorParcela(): number {
    return this.total() / this.parcelas;
  }

  parcelasDisponiveis(): number[] {
    if (this.tipoPagamento === 'PIX') return [1];
    if (this.tipoPagamento === 'BOLETO') return [1, 2, 3];
    return [1, 2, 3, 4, 5, 6];
  }

  selecionarPagamento(tipo: 'PIX' | 'CARTAO' | 'BOLETO'): void {
    this.tipoPagamento = tipo;
    if (tipo === 'PIX') {
      this.parcelas = 1;
      this.pix = { chave: this.pixKey, tipoChave: 'CPF' };
      return;
    }

    if (tipo === 'BOLETO' && this.parcelas > 3) {
      this.parcelas = 3;
    }

    if (tipo === 'BOLETO') {
      this.boleto = {
        codigoBarras: this.gerarCodigoBoleto(),
        dataVencimento: this.defaultBoletoDate()
      };
    }
  }

  finalizar(): void {
    if (!this.selectedEnderecoId) {
      this.snackBar.open('Selecione um endereco.', 'Fechar', { duration: 3000 });
      return;
    }

    const pagamento = this.buildPagamento();
    if (!pagamento) return;

    this.finishing = true;
    this.pedidoService.create({
      idEndereco: Number(this.selectedEnderecoId),
      itens: this.items.map((item) => ({
        idBone: item.bone.id,
        quantidade: item.quantidade
      })),
      pagamento
    }).subscribe({
      next: (pedido) => {
        this.saveOrderDetails(pedido.id);
        this.cartService.clear();
        this.finishing = false;
        this.router.navigate(['/resumo-compra', pedido.id]);
      },
      error: () => {
        this.finishing = false;
        this.snackBar.open('Nao foi possivel finalizar a compra.', 'Fechar', { duration: 3000 });
      }
    });
  }

  private loadEnderecos(): void {
    this.loadingEnderecos = true;
    this.enderecoService.findMine().subscribe({
      next: (enderecos) => {
        this.enderecos = enderecos;
        this.selectedEnderecoId = enderecos[0]?.id;
        this.loadingEnderecos = false;
      },
      error: () => {
        this.loadingEnderecos = false;
        this.snackBar.open('Erro ao carregar enderecos.', 'Fechar', { duration: 3000 });
      }
    });
  }

  private buildPagamento(): PagamentoPayload | null {
    if (this.tipoPagamento === 'PIX') {
      return {
        tipoPagamento: 'PIX',
        pix: this.pix
      };
    }

    if (this.tipoPagamento === 'CARTAO') {
      if (!this.selectedCardId) {
        this.snackBar.open('Selecione um cartao salvo ou cadastre um novo no perfil.', 'Fechar', { duration: 3000 });
        return null;
      }

      return {
        tipoPagamento: 'CARTAO',
        cartao: this.cartao
      };
    }

    return {
      tipoPagamento: 'BOLETO',
      boleto: {
        codigoBarras: this.boleto.codigoBarras,
        dataVencimento: this.boleto.dataVencimento
      }
    };
  }

  selecionarCartao(cardId: string): void {
    this.selectedCardId = cardId;
    const card = this.cards.find((item) => item.id === cardId);
    if (!card) return;

    this.cartao = {
      nomeTitular: card.nomeTitular,
      numero: card.numero,
      validade: card.validade,
      cvv: card.cvv
    };
  }

  boletoVencimento(): string {
    const [year, month, day] = this.defaultBoletoDate().split('-');
    return `${day}/${month}/${year}`;
  }

  enderecoSelecionado(): Endereco | undefined {
    return this.enderecos.find((endereco) => endereco.id === Number(this.selectedEnderecoId));
  }

  private onlyDigits(value: string): string {
    return value.replace(/\D/g, '');
  }

  private defaultBoletoDate(): string {
    const date = new Date();
    date.setDate(date.getDate() + 3);
    return date.toISOString().slice(0, 10);
  }

  private gerarCodigoBoleto(): string {
    return `23790.${Date.now().toString().slice(-5)} 00000.000000 00000.000000 1 00000000000000`;
  }

  private saveOrderDetails(pedidoId: number): void {
    const details: {
      pedidoId: number;
      tipoPagamento: 'PIX' | 'CARTAO' | 'BOLETO';
      frete: number;
      statusFrete: string;
      subtotal: number;
      desconto: number;
      totalPago: number;
      parcelas: number;
      valorParcela: number;
      pix?: { payload: string; expiresAt: string };
      boleto?: { codigoBarras: string; dataVencimento: string };
    } = {
      pedidoId,
      tipoPagamento: this.tipoPagamento,
      frete: this.frete(),
      statusFrete: 'Pedido recebido',
      subtotal: this.subtotal(),
      desconto: this.desconto(),
      totalPago: this.total(),
      parcelas: this.parcelas,
      valorParcela: this.valorParcela()
    };

    if (this.tipoPagamento === 'PIX') {
      details.pix = {
        payload: this.generatePixPayload(pedidoId),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString()
      };
    }

    if (this.tipoPagamento === 'BOLETO') {
      details.boleto = {
        codigoBarras: this.boleto.codigoBarras,
        dataVencimento: this.boleto.dataVencimento
      };
    }

    localStorage.setItem(`bone-order-details-${pedidoId}`, JSON.stringify(details));
  }

  private generatePixPayload(pedidoId: number): string {
    const merchantAccount = this.emv('00', 'br.gov.bcb.pix')
      + this.emv('01', this.pixKey)
      + this.emv('02', `Pedido ${pedidoId}`);
    const txid = `PEDIDO${pedidoId}`.slice(0, 25);
    const withoutCrc = this.emv('00', '01')
      + this.emv('01', '12')
      + this.emv('26', merchantAccount)
      + this.emv('52', '0000')
      + this.emv('53', '986')
      + this.emv('54', this.total().toFixed(2))
      + this.emv('58', 'BR')
      + this.emv('59', 'BONE STORE')
      + this.emv('60', 'PALMAS')
      + this.emv('62', this.emv('05', txid))
      + '6304';

    return withoutCrc + this.crc16(withoutCrc);
  }

  private emv(id: string, value: string): string {
    const cleanValue = value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
    return `${id}${cleanValue.length.toString().padStart(2, '0')}${cleanValue}`;
  }

  private crc16(value: string): string {
    let crc = 0xffff;
    for (let index = 0; index < value.length; index++) {
      crc ^= value.charCodeAt(index) << 8;
      for (let bit = 0; bit < 8; bit++) {
        crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) : (crc << 1);
        crc &= 0xffff;
      }
    }

    return crc.toString(16).toUpperCase().padStart(4, '0');
  }

  private distanciaDePalmas(cidade: string): number {
    const distancias: Record<string, number> = {
      palmas: 0,
      'sao paulo': 1490,
      'são paulo': 1490,
      campinas: 1430,
      'rio de janeiro': 1760,
      'belo horizonte': 1370,
      brasilia: 850,
      'brasília': 850,
      goiania: 820,
      'goiânia': 820,
      salvador: 1450,
      recife: 1750,
      curitiba: 1850,
      fortaleza: 1600
    };

    return distancias[cidade.trim().toLowerCase()] ?? 1000;
  }

  parcelDropdownOpen = false;
}
