import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { PedidoPayload, PedidoResponse } from '../models/pedido.model';

@Injectable({ providedIn: 'root' })
export class PedidoService {
  private readonly api = 'http://localhost:8080/pedidos';

  constructor(private httpClient: HttpClient) {}

  findAll(): Observable<PedidoResponse[]> {
    return this.httpClient.get<PedidoResponse[]>(this.api);
  }

  create(payload: PedidoPayload): Observable<PedidoResponse> {
    return this.httpClient.post<PedidoResponse>(this.api, payload);
  }

  findById(id: number): Observable<PedidoResponse> {
    return this.httpClient.get<PedidoResponse>(`${this.api}/${id}`);
  }
}
