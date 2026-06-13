import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Bone } from '../models/bone.model';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private readonly api = 'http://localhost:8080/lista-desejos';

  constructor(private httpClient: HttpClient) {}

  findAll(): Observable<Bone[]> {
    return this.httpClient.get<Bone[]>(this.api);
  }

  findIds(): Observable<number[]> {
    return this.httpClient.get<number[]>(`${this.api}/ids`);
  }

  add(boneId: number): Observable<Bone> {
    return this.httpClient.post<Bone>(`${this.api}/${boneId}`, {});
  }

  remove(boneId: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.api}/${boneId}`);
  }
}
