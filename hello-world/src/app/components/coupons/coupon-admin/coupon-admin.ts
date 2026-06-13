import { CommonModule, CurrencyPipe, PercentPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';

import { Coupon, CouponPayload } from '../../../models/coupon.model';
import { CouponService } from '../../../services/coupon.service';

@Component({
  selector: 'app-coupon-admin',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    PercentPipe,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './coupon-admin.html',
  styleUrl: './coupon-admin.css'
})
export class CouponAdmin implements OnInit {
  coupons: Coupon[] = [];
  loading = true;
  saving = false;
  editingId?: number;

  form: CouponPayload = this.emptyForm();

  constructor(
    private couponService: CouponService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadCoupons();
  }

  loadCoupons(): void {
    this.loading = true;
    this.couponService.findAll().subscribe({
      next: (coupons) => {
        this.coupons = coupons;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Erro ao carregar cupons.', 'Fechar', { duration: 3000 });
      }
    });
  }

  save(): void {
    const payload = this.normalizePayload();

    if (!payload.codigo || payload.percentualDesconto <= 0) {
      this.snackBar.open('Informe codigo e percentual validos.', 'Fechar', { duration: 3000 });
      return;
    }

    this.saving = true;
    const request: Observable<unknown> = this.editingId
      ? this.couponService.update(this.editingId, payload)
      : this.couponService.create(payload);

    request.subscribe({
      next: () => {
        this.saving = false;
        this.resetForm();
        this.loadCoupons();
        this.snackBar.open('Cupom salvo com sucesso.', 'Fechar', { duration: 2500 });
      },
      error: () => {
        this.saving = false;
        this.snackBar.open('Nao foi possivel salvar o cupom.', 'Fechar', { duration: 3000 });
      }
    });
  }

  edit(coupon: Coupon): void {
    this.editingId = coupon.id;
    this.form = {
      codigo: coupon.codigo,
      descricao: coupon.descricao,
      percentualDesconto: coupon.percentualDesconto,
      valorMinimo: coupon.valorMinimo,
      ativo: coupon.ativo,
      dataValidade: coupon.dataValidade
    };
  }

  remove(coupon: Coupon): void {
    this.couponService.delete(coupon.id).subscribe({
      next: () => {
        this.coupons = this.coupons.filter((item) => item.id !== coupon.id);
        if (this.editingId === coupon.id) this.resetForm();
        this.snackBar.open('Cupom removido.', 'Fechar', { duration: 2500 });
      },
      error: () => this.snackBar.open('Nao foi possivel remover o cupom.', 'Fechar', { duration: 3000 })
    });
  }

  resetForm(): void {
    this.editingId = undefined;
    this.form = this.emptyForm();
  }

  isVisuallyActive(coupon: Coupon): boolean {
    return coupon.ativo && !this.isExpired(coupon.dataValidade);
  }

  private isExpired(date: string | null): boolean {
    if (!date) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiration = new Date(`${date}T00:00:00`);

    return expiration < today;
  }

  private normalizePayload(): CouponPayload {
    return {
      codigo: this.form.codigo.trim().toUpperCase(),
      descricao: this.form.descricao?.trim() || '',
      percentualDesconto: Number(this.form.percentualDesconto),
      valorMinimo: Number(this.form.valorMinimo) || 0,
      ativo: !!this.form.ativo,
      dataValidade: this.form.dataValidade || null
    };
  }

  private emptyForm(): CouponPayload {
    return {
      codigo: '',
      descricao: '',
      percentualDesconto: 10,
      valorMinimo: 0,
      ativo: true,
      dataValidade: null
    };
  }
}
