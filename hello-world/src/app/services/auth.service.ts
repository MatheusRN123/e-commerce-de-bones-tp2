import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
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
        const authHeader = response.headers.get('Authorization');

        if (!authHeader) {
          throw new Error('Token nao retornado pelo backend.');
        }

        const token = authHeader.replace('Bearer ', '');
        localStorage.setItem(this.TOKEN_KEY, token);
      }),
      catchError((err) => throwError(() => err))
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

  register(dto: { email: string; senha: string }): Observable<void> {
    return this.httpClient.post(`${this.api}/register`, dto, {
      observe: 'response',
      responseType: 'text'
    }).pipe(
      map(() => undefined),
      catchError((err) => throwError(() => err))
    );
  }

  verifyEmail(token: string): Observable<string> {
    return this.httpClient.get(`${this.api}/verify-email`, {
      params: { token },
      responseType: 'text'
    });
  }

  forgotPassword(email: string): Observable<string> {
    return this.httpClient.post(`${this.api}/forgot-password`, { email }, {
      responseType: 'text'
    });
  }

  resetPassword(token: string, senha: string): Observable<string> {
    return this.httpClient.post(`${this.api}/reset-password`, { token, senha }, {
      responseType: 'text'
    });
  }
}
