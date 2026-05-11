import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BoneService } from '../../../services/bone.service';
import { MarcaService } from '../../../services/marca.service';
import { ModeloService } from '../../../services/modelo.service';
import { MaterialService } from '../../../services/material.service';
import { EstampaService } from '../../../services/estampa.service';
import { Marca } from '../../../models/marca.model';
import { Modelo } from '../../../models/modelo.model';
import { Material } from '../../../models/material.model';
import { Estampa } from '../../../models/estampa.model';

@Component({
  selector: 'app-bone-form',
  standalone: true,
  templateUrl: './bone-form.html',
  styleUrl: './bone-form.css',
  imports: [CommonModule, ReactiveFormsModule, RouterModule]
})
export class BoneForm implements OnInit {
  formGroup!: FormGroup;
  marcas: Marca[] = [];
  modelos: Modelo[] = [];
  materiais: Material[] = [];
  estampas: Estampa[] = [];
  estampasSelecionadas: number[] = [];
  bordados: string[] = ['COM_BORDADO', 'SEM_BORDADO', 'PERSONALIZADO'];

  constructor(
    private formBuilder: FormBuilder,
    private boneService: BoneService,
    private marcaService: MarcaService,
    private modeloService: ModeloService,
    private materialService: MaterialService,
    private estampaService: EstampaService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.formGroup = this.formBuilder.group({
      nome:               ['', Validators.required],
      cor:                ['', Validators.required],
      categoriaAba:       ['', Validators.required],
      tamanhoAba:         ['', Validators.required],
      profundidade:       ['', Validators.required],
      circunferencia:     ['', Validators.required],
      bordado:            [null, Validators.required],
      material:           [null, Validators.required],
      marca:              [null, Validators.required],
      modelo:             [null, Validators.required],
      preco:              ['', Validators.required],
      quantidadeEstoque:  ['', [Validators.required, Validators.min(1)]]
    });

    this.carregarMarcas();
    this.carregarModelos();
    this.carregarMateriais();
    this.carregarEstampas();
  }

  carregarMarcas(): void {
    this.marcaService.findAll().subscribe(data => this.marcas = data);
  }

  carregarModelos(): void {
    this.modeloService.findAll().subscribe(data => this.modelos = data);
  }

  carregarMateriais(): void {
    this.materialService.findAll().subscribe(data => this.materiais = data);
  }

  carregarEstampas(): void {
    this.estampaService.findAll().subscribe(data => this.estampas = data);
  }

  /** Converte formato CONSTANTE_CASE para Formato Com Espaços */
  formatarBordado(valor: string): string {
    return valor
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  toggleEstampa(id: number, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.estampasSelecionadas = [...this.estampasSelecionadas, id];
    } else {
      this.estampasSelecionadas = this.estampasSelecionadas.filter(e => e !== id);
    }
  }

  salvar(): void {
    if (this.formGroup.invalid) return;

    const form = this.formGroup.value;
    const dto = {
      nome:              form.nome,
      cor:               form.cor,
      idMaterial:        form.material.id,
      categoriaAba:      form.categoriaAba,
      tamanhoAba:        form.tamanhoAba,
      profundidade:      form.profundidade,
      circunferencia:    form.circunferencia,
      bordado:           form.bordado,
      idMarca:           form.marca.id,
      idModelo:          form.modelo.id,
      quantidadeEstoque: form.quantidadeEstoque,
      idsEstampas:       this.estampasSelecionadas,
      preco:             form.preco
    };

    this.boneService.create(dto).subscribe(() => {
      this.router.navigateByUrl('/bones');
    });
  }
}