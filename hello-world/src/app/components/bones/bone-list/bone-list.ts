import { Component, OnInit } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from "@angular/router";
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import {MatPaginatorModule} from '@angular/material/paginator';

import { Bone } from '../../../models/bone.model';
import { BoneService } from '../../../services/bone.service';
import { PageEvent, MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-bone-list',
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    RouterLink,
    MatFormFieldModule,
    MatTableModule,
    MatInputModule,
    MatPaginator
],
  templateUrl: './bone-list.html',
  styleUrl: './bone-list.css',
})
export class BoneList implements OnInit {

  totalRecords = 0;
  page = 0;
  pageSize = 2;

  displayedColumns: string[] = [
    'numero',
    'nome',
    'cor',
    'categoriaAba',
    'tamanhoAba',
    'profundidade',
    'circunferencia',
    'marca',
    'modelo',
    'material',
    'bordado',
    'preco',
    'acao'
  ];

  dataSource = new MatTableDataSource<Bone>([]);

  constructor(private boneService: BoneService) {}

  ngOnInit(): void {
    this.boneService.findAll(this.page, this.pageSize).subscribe(data => {
      this.dataSource.data = data;
    });

    this.boneService.count().subscribe(data => {
      this.totalRecords = data;
    });

      this.dataSource.filterPredicate = (data: Bone, filter: string) => {
        const texto = (
        (data.nome ?? '') +
        (data.cor ?? '') +
        (data.categoriaAba ?? '') +
        (data.tamanhoAba ?? '') +
        (data.profundidade ?? '') +
        (data.circunferencia ?? '') +
        (data.nomeMarca ?? '') +
        (data.nomeModelo ?? '') +
        (data.nomeMaterial ?? '') +
        (data.bordado?.nome ?? '')
      ).toLowerCase();

      return texto.includes(filter);
    };
  };
  
  paginar(event: PageEvent): void{
      this.page = event.pageIndex;
      this.pageSize = event.pageSize;
      this.ngOnInit(); // para fazer a nova busca de dados
    }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

}