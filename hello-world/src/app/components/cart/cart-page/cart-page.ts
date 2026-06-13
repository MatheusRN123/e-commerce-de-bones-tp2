import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { CartItem } from '../../../models/cart-item.model';
import { CouponValidation } from '../../../models/coupon.model';
import { Bone } from '../../../models/bone.model';
import { ArquivoService } from '../../../services/arquivo.service';
import { BoneService } from '../../../services/bone.service';
import { CartService } from '../../../services/cart.service';
import { CouponService } from '../../../services/coupon.service';

@Component({
  selector: 'app-cart-page',
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
  templateUrl: './cart-page.html',
  styleUrl: './cart-page.css'
})
export class CartPage implements OnInit {
  items: CartItem[] = [];
  couponCode = '';
  coupon?: CouponValidation;
  applyingCoupon = false;
  private readonly hydratedBoneIds = new Set<number>();

  constructor(
    private cartService: CartService,
    private couponService: CouponService,
    private arquivoService: ArquivoService,
    private boneService: BoneService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.cartService.items$.subscribe((items) => {
      this.items = items;
      this.hydrateCartItems(items);
    });

    this.cartService.coupon$.subscribe((coupon) => {
      this.coupon = coupon ?? undefined;
      this.couponCode = coupon?.codigo ?? '';
    });
  }

  subtotal(): number {
    return this.items.reduce((total, item) => total + item.bone.preco * item.quantidade, 0);
  }

  desconto(): number {
    return this.coupon?.valorDesconto ?? 0;
  }

  total(): number {
    return Math.max(this.subtotal() - this.desconto(), 0);
  }

  alterarQuantidade(item: CartItem, quantidade: number): void {
    this.cartService.updateQuantity(item.bone.id, quantidade);
  }

  remover(item: CartItem): void {
    this.cartService.remove(item.bone.id);
    this.snackBar.open('Produto removido do carrinho.', 'Fechar', { duration: 2500 });
  }

  limpar(): void {
    this.cartService.clear();
    this.snackBar.open('Carrinho limpo.', 'Fechar', { duration: 2500 });
  }

  aplicarCupom(): void {
    const codigo = this.couponCode.trim();

    if (!codigo) {
      this.snackBar.open('Informe um cupom.', 'Fechar', { duration: 2500 });
      return;
    }

    if (!this.items.length) {
      this.snackBar.open('Adicione produtos antes de usar um cupom.', 'Fechar', { duration: 2500 });
      return;
    }

    this.applyingCoupon = true;
    this.couponService.validar(codigo, this.subtotal()).subscribe({
      next: (coupon) => {
        this.cartService.setCoupon(coupon);
        this.applyingCoupon = false;
        this.snackBar.open('Cupom aplicado com sucesso.', 'Fechar', { duration: 2500 });
      },
      error: () => {
        this.cartService.clearCoupon();
        this.applyingCoupon = false;
        this.snackBar.open('Cupom invalido para este carrinho.', 'Fechar', { duration: 3000 });
      }
    });
  }

  removerCupom(): void {
    this.cartService.clearCoupon();
    this.couponCode = '';
  }

  getUrlImagem(bone: Bone): string {
    if (bone.imagemUrl) {
      return bone.imagemUrl.startsWith('http')
        ? bone.imagemUrl
        : `http://localhost:8080${bone.imagemUrl}`;
    }

    return bone.imagemFid
      ? this.arquivoService.getUrlDownload(bone.imagemFid)
      : this.placeholderImagem(bone.nome);
  }

  usarPlaceholder(event: Event, nome: string): void {
    const image = event.target as HTMLImageElement;
    image.src = this.placeholderImagem(nome);
  }

  private hydrateCartItems(items: CartItem[]): void {
    items.forEach((item) => {
      if (this.hydratedBoneIds.has(item.bone.id)) return;

      this.hydratedBoneIds.add(item.bone.id);
      this.boneService.findById(item.bone.id).subscribe({
        next: (bone) => this.cartService.refreshBone(bone),
        error: () => this.hydratedBoneIds.delete(item.bone.id)
      });
    });
  }

  private placeholderImagem(nome: string): string {
    const texto = (nome || 'Bone').replace(/[<>&"]/g, '');
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
        <rect width="300" height="300" fill="#111827"/>
        <path d="M74 164c10-52 54-86 108-72 35 9 57 34 63 72H74Z" fill="#1f2937" stroke="#38bdf8" stroke-width="6"/>
        <path d="M62 171h176c22 0 39 10 50 27H56c-14 0-21-17-11-26 4-3 9-1 17-1Z" fill="#0e7490"/>
        <text x="150" y="238" fill="#7dd3fc" font-family="Arial, sans-serif" font-size="18" font-weight="700" text-anchor="middle">${texto}</text>
      </svg>
    `;

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }
}
