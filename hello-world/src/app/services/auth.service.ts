import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { AuthDTO } from '../dto/auth.dto';


@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = 'http://localhost:8080/auth';
  private readonly TOKEN_KEY = 'token';

  constructor(private httpClient: HttpClient) {}

  login(dto: AuthDTO): Observable<void> {
  return this.httpClient.post(this.api, dto, {
    observe: 'response',
    responseType: 'text'
  }).pipe(
    map((response: HttpResponse<string>) => {
      console.log('Resposta completa:', response);
      console.log('Status:', response.status);
      console.log('Headers disponíveis:', response.headers.keys());
      console.log('Authorization header:', response.headers.get('Authorization'));

      const authHeader = response.headers.get('Authorization');

      if (!authHeader) {
        throw new Error('Token não retornado pelo backend.');
      }

      const token = authHeader.replace('Bearer ', '');
      console.log('Token extraído:', token);

      localStorage.setItem(this.TOKEN_KEY, token);
    })
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}