import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Estoque } from '../models/estoque.model';

@Injectable({ providedIn: 'root' })
export class EstoqueService {

  private readonly api = 'http://localhost:8080/estoques';

  constructor(private httpClient: HttpClient) {}

  findAll(page?: number, pageSize?: number): Observable<Estoque[]> {
    let params = {};

    if(page !== undefined && pageSize !== undefined){
      params = {
        page: page?.toString(),
        pageSize: pageSize?.toString()
      }
    }
      
    return this.httpClient.get<Estoque[]>(this.api, { params });
  }

  count(): Observable<number> {
    return this.httpClient.get<number>(`${this.api}/count`);
  }

  findByIdBone(idBone: number): Observable<Estoque> {
    return this.httpClient.get<Estoque>(`${this.api}/bone/${idBone}`);
  }

  findById(id: number): Observable<Estoque> {
    return this.httpClient.get<Estoque>(`${this.api}/${id}`);
  }

  create(estoque: Estoque): Observable<Estoque> {
    return this.httpClient.post<Estoque>(this.api, estoque);
  }

  update(estoque: Estoque): Observable<void> {
    return this.httpClient.put<void>(`${this.api}/${estoque.id}`, estoque);
  }

  delete(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.api}/${id}`);
  }
}
