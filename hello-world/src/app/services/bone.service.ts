import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Bone } from '../models/bone.model';
import { BoneCreateDTO } from '../dto/bone.dto';

@Injectable({ providedIn: 'root' })
export class BoneService {

  private readonly api = 'http://localhost:8080/bones';

  constructor(private httpClient: HttpClient) {}

  findAll(page?: number, pageSize?: number): Observable<Bone[]> {
    let params = {};

    if(page!== undefined && pageSize !== undefined){
      params = {
        page: page?.toString(),
        pageSize: pageSize?.toString()
      }
    }

    return this.httpClient.get<Bone[]>(this.api, {params});
  }

  count(): Observable<number>{
    return this.httpClient.get<number>(`${this.api}/count`);
  }

  findByNome(nome: string): Observable<Bone[]> {
    return this.httpClient.get<Bone[]>(`${this.api}/find/${nome}`);
  }

  findById(id: number): Observable<Bone> {
    return this.httpClient.get<Bone>(`${this.api}/${id}`);
  }

  create(dto: BoneCreateDTO):   Observable<Bone> {
    return this.httpClient.post<Bone>(this. api, dto);
  }

  update(bone: Bone): Observable<void> {
    return this.httpClient.put<void>(`${this.api}/${bone.id}`, bone);
  }

  remove(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.api}/${id}`);
  }
}