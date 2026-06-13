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

  search(term: string, page: number, pageSize: number): Observable<Bone[]> {
    return this.httpClient.get<Bone[]>(`${this.api}/search`, {
      params: {
        term,
        page: page.toString(),
        pageSize: pageSize.toString()
      }
    });
  }

  countSearch(term: string): Observable<number> {
    return this.httpClient.get<number>(`${this.api}/search/count`, {
      params: { term }
    });
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

  update(id: number, dto: any): Observable<any> {
    return this.httpClient.put<void>(`${this.api}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.api}/${id}`);
  }
}
