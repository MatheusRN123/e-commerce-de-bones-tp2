import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Estampa } from '../models/estampa.model';

@Injectable({ providedIn: 'root' })
export class EstampaService {

  private readonly api = 'http://localhost:8080/estampas';

  constructor(private httpClient: HttpClient) {}

  findAll(page?: number, pageSize?: number): Observable<Estampa[]> {
    let params = {};

    if(page !== undefined && pageSize !== undefined){
      params = {
        page: page?.toString(),
        pageSize: pageSize?.toString()
      }
    }

    return this.httpClient.get<Estampa[]>(this.api, { params });
  }

  count(): Observable<number> {
    return this.httpClient.get<number>(`${this.api}/count`);
  }

  findByNome(nome: string): Observable<Estampa[]> {
    return this.httpClient.get<Estampa[]>(`${this.api}/find/${nome}`);
  }

  findById(id: number): Observable<Estampa> {
    return this.httpClient.get<Estampa>(`${this.api}/${id}`);
  }

  create(estampa: Estampa): Observable<Estampa> {
    return this.httpClient.post<Estampa>(this.api, estampa);
  }

  update(estampa: Estampa): Observable<void> {
    return this.httpClient.put<void>(`${this.api}/${estampa.id}`, estampa);
  }

  delete(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.api}/${id}`);
  }
}
