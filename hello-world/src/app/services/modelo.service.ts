import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Modelo } from '../models/modelo.model';

@Injectable({ providedIn: 'root' })
export class ModeloService {

  private readonly api = 'http://localhost:8080/modelos';

  constructor(private httpClient: HttpClient) {}

  findAll(page?: number, pageSize?: number): Observable<Modelo[]> {
    let params = {};

    if(page !== undefined && pageSize !== undefined){
      params = {
        page: page?.toString(),
        pageSize: pageSize?.toString()
      }
    }

    return this.httpClient.get<Modelo[]>(this.api, { params });
  }

  count(): Observable<number> {
    return this.httpClient.get<number>(`${this.api}/count`);
  }

  findByNome(nome: string): Observable<Modelo[]> {
    return this.httpClient.get<Modelo[]>(`${this.api}/find/${nome}`);
  }

  findById(id: number): Observable<Modelo> {
    return this.httpClient.get<Modelo>(`${this.api}/${id}`);
  }

  create(modelo: Modelo): Observable<Modelo> {
    return this.httpClient.post<Modelo>(this.api, modelo);
  }

  update(modelo: Modelo): Observable<void> {
    return this.httpClient.put<void>(`${this.api}/${modelo.id}`, modelo);
  }

  delete(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.api}/${id}`);
  }
}