import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Endereco, EnderecoPayload } from '../models/endereco.model';

@Injectable({ providedIn: 'root' })
export class EnderecoService {
  private readonly api = 'http://localhost:8080/enderecos';

  constructor(private httpClient: HttpClient) {}

  findAll(): Observable<Endereco[]> {
    return this.httpClient.get<Endereco[]>(this.api);
  }

  findMine(): Observable<Endereco[]> {
    return this.httpClient.get<Endereco[]>(`${this.api}/meus`);
  }

  create(payload: EnderecoPayload): Observable<Endereco> {
    return this.httpClient.post<Endereco>(this.api, payload);
  }

  update(id: number, payload: EnderecoPayload): Observable<void> {
    return this.httpClient.put<void>(`${this.api}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.api}/${id}`);
  }
}
