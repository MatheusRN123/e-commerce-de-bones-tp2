import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Usuario, UsuarioPayload, UsuarioPerfilPayload, UsuarioSenhaPayload } from '../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly api = 'http://localhost:8080/usuarios';

  constructor(private httpClient: HttpClient) {}

  findAll(): Observable<Usuario[]> {
    return this.httpClient.get<Usuario[]>(this.api);
  }

  findMe(): Observable<Usuario> {
    return this.httpClient.get<Usuario>(`${this.api}/me`);
  }

  findById(id: number): Observable<Usuario> {
    return this.httpClient.get<Usuario>(`${this.api}/${id}`);
  }

  create(payload: UsuarioPayload): Observable<Usuario> {
    return this.httpClient.post<Usuario>(this.api, payload);
  }

  update(id: number, payload: UsuarioPayload): Observable<Usuario> {
    return this.httpClient.put<Usuario>(`${this.api}/${id}`, payload);
  }

  promoteToAdmin(id: number): Observable<void> {
    return this.httpClient.put<void>(`${this.api}/${id}/promover`, {});
  }

  updateMe(payload: UsuarioPerfilPayload): Observable<Usuario> {
    return this.httpClient.put<Usuario>(`${this.api}/me`, payload);
  }

  updateMyPassword(payload: UsuarioSenhaPayload): Observable<void> {
    return this.httpClient.put<void>(`${this.api}/me/senha`, payload);
  }

  delete(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.api}/${id}`);
  }
}
