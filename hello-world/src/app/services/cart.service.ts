import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { Bone } from '../models/bone.model';
import { CartItem } from '../models/cart-item.model';
import { CouponValidation } from '../models/coupon.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly STORAGE_KEY = 'bone-cart';
  private readonly COUPON_KEY = 'bone-cart-coupon';
  private readonly itemsSubject: BehaviorSubject<CartItem[]>;
  private readonly couponSubject: BehaviorSubject<CouponValidation | null>;
  private activeStorageId = '';

  readonly items$: Observable<CartItem[]>;
  readonly coupon$: Observable<CouponValidation | null>;

  constructor(private authService: AuthService) {
    this.activeStorageId = this.userStorageId();
    this.itemsSubject = new BehaviorSubject<CartItem[]>(this.loadFromStorage());
    this.couponSubject = new BehaviorSubject<CouponValidation | null>(this.loadCouponFromStorage());
    this.items$ = this.itemsSubject.asObservable();
    this.coupon$ = this.couponSubject.asObservable();
  }

  getItems(): CartItem[] {
    this.syncUserCart();
    return this.itemsSubject.value;
  }

  getCoupon(): CouponValidation | null {
    this.syncUserCart();
    return this.couponSubject.value;
  }

  add(bone: Bone, quantidade = 1): void {
    this.syncUserCart();
    const items = [...this.itemsSubject.value];
    const item = items.find((cartItem) => cartItem.bone.id === bone.id);
    const estoque = bone.quantidadeEstoque ?? 0;

    if (item) {
      item.quantidade = Math.min(item.quantidade + quantidade, estoque);
    } else {
      items.push({ bone, quantidade: Math.min(quantidade, estoque) });
    }

    this.save(items.filter((cartItem) => cartItem.quantidade > 0));
    this.clearCoupon();
  }

  updateQuantity(boneId: number, quantidade: number): void {
    this.syncUserCart();
    const items = this.itemsSubject.value.map((item) => {
      if (item.bone.id !== boneId) return item;

      return {
        ...item,
        quantidade: Math.min(Math.max(quantidade, 1), item.bone.quantidadeEstoque ?? quantidade)
      };
    });

    this.save(items);
    this.clearCoupon();
  }

  remove(boneId: number): void {
    this.syncUserCart();
    this.save(this.itemsSubject.value.filter((item) => item.bone.id !== boneId));
    this.clearCoupon();
  }

  refreshBone(bone: Bone): void {
    this.syncUserCart();
    const items = this.itemsSubject.value.map((item) => {
      if (item.bone.id !== bone.id) return item;

      return {
        ...item,
        bone,
        quantidade: Math.min(item.quantidade, bone.quantidadeEstoque ?? item.quantidade)
      };
    });

    this.save(items.filter((item) => item.quantidade > 0));
  }

  clear(): void {
    this.syncUserCart();
    this.save([]);
    this.clearCoupon();
  }

  setCoupon(coupon: CouponValidation): void {
    this.syncUserCart();
    localStorage.setItem(this.couponStorageKey(), JSON.stringify(coupon));
    this.couponSubject.next(coupon);
  }

  clearCoupon(): void {
    this.syncUserCart();
    localStorage.removeItem(this.couponStorageKey());
    this.couponSubject.next(null);
  }

  count(): number {
    this.syncUserCart();
    return this.itemsSubject.value.reduce((total, item) => total + item.quantidade, 0);
  }

  subtotal(): number {
    this.syncUserCart();
    return this.itemsSubject.value.reduce(
      (total, item) => total + item.bone.preco * item.quantidade,
      0
    );
  }

  private save(items: CartItem[]): void {
    localStorage.setItem(this.cartStorageKey(), JSON.stringify(items));
    this.itemsSubject.next(items);
  }

  private loadFromStorage(): CartItem[] {
    const storageKey = this.cartStorageKey();
    this.migrateLegacyTokenStorage(this.STORAGE_KEY, storageKey);

    const rawItems = localStorage.getItem(storageKey);
    if (!rawItems) return [];

    try {
      return JSON.parse(rawItems) as CartItem[];
    } catch {
      localStorage.removeItem(storageKey);
      return [];
    }
  }

  private loadCouponFromStorage(): CouponValidation | null {
    const storageKey = this.couponStorageKey();
    this.migrateLegacyTokenStorage(this.COUPON_KEY, storageKey);

    const rawCoupon = localStorage.getItem(storageKey);
    if (!rawCoupon) return null;

    try {
      return JSON.parse(rawCoupon) as CouponValidation;
    } catch {
      localStorage.removeItem(storageKey);
      return null;
    }
  }

  private cartStorageKey(): string {
    return `${this.STORAGE_KEY}-${this.userStorageId()}`;
  }

  private couponStorageKey(): string {
    return `${this.COUPON_KEY}-${this.userStorageId()}`;
  }

  private userStorageId(): string {
    const subject = this.currentUserSubject();
    return subject ? `user-${encodeURIComponent(subject)}` : 'guest';
  }

  private syncUserCart(): void {
    const currentStorageId = this.userStorageId();
    if (currentStorageId === this.activeStorageId) return;

    this.activeStorageId = currentStorageId;
    this.itemsSubject.next(this.loadFromStorage());
    this.couponSubject.next(this.loadCouponFromStorage());
  }

  private currentUserSubject(): string | null {
    const token = this.authService.getToken();
    if (!token) return null;

    return this.subjectFromToken(token);
  }

  private subjectFromToken(token: string): string | null {
    try {
      const payloadPart = token.split('.')[1];
      if (!payloadPart) return null;

      const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
      const payload = JSON.parse(atob(padded));

      return payload.sub
        || payload.email
        || payload.upn
        || payload.preferred_username
        || null;
    } catch {
      return null;
    }
  }

  private migrateLegacyTokenStorage(baseKey: string, targetKey: string): void {
    if (localStorage.getItem(targetKey)) return;

    const currentSubject = this.currentUserSubject();
    if (!currentSubject) return;

    const prefix = `${baseKey}-`;

    for (let index = 0; index < localStorage.length; index++) {
      const key = localStorage.key(index);
      if (!key || !key.startsWith(prefix) || key === targetKey) continue;

      const legacyToken = key.slice(prefix.length);
      if (this.subjectFromToken(legacyToken) !== currentSubject) continue;

      const legacyValue = localStorage.getItem(key);
      if (legacyValue) {
        localStorage.setItem(targetKey, legacyValue);
      }
      return;
    }
  }
}
