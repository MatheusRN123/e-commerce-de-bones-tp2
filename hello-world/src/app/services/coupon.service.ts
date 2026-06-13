import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Coupon, CouponPayload, CouponValidation } from '../models/coupon.model';

@Injectable({ providedIn: 'root' })
export class CouponService {
  private readonly api = 'http://localhost:8080/cupons';

  constructor(private httpClient: HttpClient) {}

  findAll(): Observable<Coupon[]> {
    return this.httpClient.get<Coupon[]>(this.api);
  }

  create(payload: CouponPayload): Observable<Coupon> {
    return this.httpClient.post<Coupon>(this.api, payload);
  }

  update(id: number, payload: CouponPayload): Observable<void> {
    return this.httpClient.put<void>(`${this.api}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.api}/${id}`);
  }

  validar(codigo: string, subtotal: number): Observable<CouponValidation> {
    return this.httpClient.get<CouponValidation>(`${this.api}/validar/${codigo.trim()}`, {
      params: { subtotal: subtotal.toString() }
    });
  }
}
