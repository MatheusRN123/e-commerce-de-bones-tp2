import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Cidade } from '../models/cidade.model';

@Injectable({ providedIn: 'root' })
export class CidadeService {
  private readonly api = 'http://localhost:8080/cidades';

  constructor(private httpClient: HttpClient) {}

  findAll(): Observable<Cidade[]> {
    return this.httpClient.get<Cidade[]>(this.api);
  }
}
