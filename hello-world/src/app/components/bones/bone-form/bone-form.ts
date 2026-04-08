import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { BoneService } from '../../../services/bone.service';
import { MarcaService } from '../../../services/marca.service';
import { ModeloService } from '../../../services/modelo.service';
import { MaterialService } from '../../../services/material.service';

import { Marca } from '../../../models/marca.model';
import { Modelo } from '../../../models/modelo.model';
import { Material } from '../../../models/material.model';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-bone-form',
  standalone: true,
  templateUrl: './bone-form.html',

  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ]
})
export class BoneForm implements OnInit {

  formGroup!: FormGroup;

  marcas: Marca[] = [];
  modelos: Modelo[] = [];
  materiais: Material[] = [];

  bordados: string[] = [
    'COM_BORDADO',
    'SEM_BORDADO',
    'PERSONALIZADO'
  ];
  
  constructor(
    private formBuilder: FormBuilder,
    private boneService: BoneService,
    private marcaService: MarcaService,
    private modeloService: ModeloService,
    private materialService: MaterialService,
    private router: Router
  ) {}

  ngOnInit(): void {

    this.formGroup = this.formBuilder.group({

      id: [null],

      nome: ['', Validators.required],
      cor: ['', Validators.required],

      categoriaAba: ['', Validators.required],
      tamanhoAba: ['', Validators.required],
      profundidade: ['', Validators.required],

      circunferencia: ['', Validators.required],

      bordado: ['', Validators.required],

      material: [null, Validators.required],
      marca: [null, Validators.required],
      modelo: [null, Validators.required],

      preco: ['', Validators.required]

    });

    this.carregarMarcas();
    this.carregarModelos();
    this.carregarMateriais();
  }

  carregarMarcas() {
    this.marcaService.findAll().subscribe(data => {
      this.marcas = data;
    });
  }

  carregarModelos() {
    this.modeloService.findAll().subscribe(data => {
      this.modelos = data;
    });
  }

  carregarMateriais() {
    this.materialService.findAll().subscribe(data => {
      this.materiais = data;
    });
  }

  salvar() {

    if (this.formGroup.valid) {

      const form = this.formGroup.value;

      const dto = {

        nome: form.nome,
        cor: form.cor,

        idMaterial: form.material.id,
        categoriaAba: form.categoriaAba,
        tamanhoAba: form.tamanhoAba,
        profundidade: form.profundidade,

        circunferencia: form. circunferencia,

        bordado: form.bordado,

        idMarca: form.marca.id,
        idModelo: form.modelo.id,

        quantidadeEstoque: form.quantidadeEstoque,

        idsEstampas: [],

        preco: form.preco

      };

      this.boneService.create(dto). subscribe(() => {
        this.router.navigateByUrl('/  bones');
      });

    }

  }
}