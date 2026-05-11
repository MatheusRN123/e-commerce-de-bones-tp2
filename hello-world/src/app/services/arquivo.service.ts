import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface RespostaUpload {
  fid: string;
  name: string;
  url?: string;
}

@Injectable({ providedIn: 'root' })
export class ArquivoService {
  private readonly api = 'http://localhost:8080/arquivos';

  constructor(private httpClient: HttpClient) {}

  upload(arquivo: File): Observable<RespostaUpload> {
    const formData = new FormData();
    formData.append('arquivo', arquivo);
    return this.httpClient.post<RespostaUpload>(`${this.api}/upload`, formData);
  }

  getUrlDownload(fid: string): string {
    return `${this.api}/download/${fid}`;
  }
}
