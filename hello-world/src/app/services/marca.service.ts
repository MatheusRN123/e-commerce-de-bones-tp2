import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Marca } from '../models/marca.model';

@Injectable({ providedIn: 'root' })
export class MarcaService {

  private readonly api = 'http://localhost:8080/marcas';

  constructor(private httpClient: HttpClient) {}

  findAll(page?: number, pageSize?: number): Observable<Marca[]> {
    let params = {};

    if(page !== undefined && pageSize !== undefined){
      params = {
        page: page?.toString(),
        pageSize: pageSize?.toString()
      }
    }

    return this.httpClient.get<Marca[]>(this.api, { params });
  }

  count(): Observable<number> {
    return this.httpClient.get<number>(`${this.api}/count`);
  }

  findByNome(nome: string): Observable<Marca[]> {
    return this.httpClient.get<Marca[]>(`${this.api}/find/${nome}`);
  }

  findById(id: number): Observable<Marca> {
    return this.httpClient.get<Marca>(`${this.api}/${id}`);
  }

  create(marca: Marca): Observable<Marca> {
    return this.httpClient.post<Marca>(this.api, marca);
  }

  update(marca: Marca): Observable<void> {
    return this.httpClient.put<void>(`${this.api}/${marca.id}`, marca);
  }

  delete(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.api}/${id}`);
  }
}