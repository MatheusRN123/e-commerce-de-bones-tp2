import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
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
  selector: 'app-bone-edit',
  standalone: true,
  templateUrl: './bone-edit.html',
  styleUrl: './bone-edit.css',
  imports: [CommonModule, ReactiveFormsModule, RouterModule]
})
export class BoneEdit implements OnInit {
  formGroup!: FormGroup;
  marcas: Marca[] = [];
  modelos: Modelo[] = [];
  materiais: Material[] = [];
  estampas: Estampa[] = [];
  estampasSelecionadas: number[] = [];
  bordados: string[] = ['COM_BORDADO', 'SEM_BORDADO', 'PERSONALIZADO'];

  private boneId!: number;

  constructor(
    private formBuilder: FormBuilder,
    private boneService: BoneService,
    private marcaService: MarcaService,
    private modeloService: ModeloService,
    private materialService: MaterialService,
    private estampaService: EstampaService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.boneId = Number(this.route.snapshot.paramMap.get('id'));

    this.formGroup = this.formBuilder.group({
      nome:              ['', Validators.required],
      cor:               ['', Validators.required],
      categoriaAba:      ['', Validators.required],
      tamanhoAba:        ['', Validators.required],
      profundidade:      ['', Validators.required],
      circunferencia:    ['', Validators.required],
      bordado:           [null, Validators.required],
      material:          [null, Validators.required],
      marca:             [null, Validators.required],
      modelo:            [null, Validators.required],
      preco:             ['', Validators.required],
      quantidadeEstoque: ['', [Validators.required, Validators.min(1)]]
    });

    // Carrega listas e depois preenche os campos com os dados do boné
    this.carregarListas().then(() => this.carregarBoне());
  }

  /** Converte formato CONSTANTE_CASE para Formato Com Espaços */
  formatarBordado(valor: string): string {
    return valor
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  /** Converte de volta: "Com Bordado" → "COM_BORDADO" */
  private desformatarBordado(valor: string): string {
    return valor
      .split(' ')
      .map(word => word.toUpperCase())
      .join('_');
  }

  /** Carrega todas as listas em paralelo e resolve quando todas chegarem */
  private carregarListas(): Promise<void> {
    return new Promise(resolve => {
      let pendentes = 4;
      const feito = () => { if (--pendentes === 0) resolve(); };

      this.marcaService.findAll().subscribe(data => { this.marcas = data; feito(); });
      this.modeloService.findAll().subscribe(data => { this.modelos = data; feito(); });
      this.materialService.findAll().subscribe(data => { this.materiais = data; feito(); });
      this.estampaService.findAll().subscribe(data => { this.estampas = data; feito(); });
    });
  }

  private carregarBoне(): void {
    this.boneService.findById(this.boneId).subscribe(bone => {
      console.log('Bone carregado:', bone);
      
      // Encontra os objetos completos nas listas comparando pelos nomes
      const marca    = this.marcas.find(m => m.nome === bone.nomeMarca);
      const modelo   = this.modelos.find(m => m.nome === bone.nomeModelo);
      const material = this.materiais.find(m => m.nome === bone.nomeMaterial);

      this.formGroup.patchValue({
        nome:              bone.nome,
        cor:               bone.cor,
        categoriaAba:      bone.categoriaAba,
        tamanhoAba:        bone.tamanhoAba,
        profundidade:      bone.profundidade,
        circunferencia:    bone.circunferencia,
        bordado:           this.desformatarBordado(bone.bordado),
        marca,
        modelo,
        material,
        preco:             bone.preco,
        quantidadeEstoque: bone.quantidadeEstoque
      });

      // Pré-seleciona as estampas já associadas ao boné
      this.estampasSelecionadas = bone.estampas?.map((e: Estampa) => e.id) ?? [];
    });
  }

  toggleEstampa(id: number, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.estampasSelecionadas = checked
      ? [...this.estampasSelecionadas, id]
      : this.estampasSelecionadas.filter(e => e !== id);
  }

  atualizar(): void {
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

    this.boneService.update(this.boneId, dto).subscribe(() => {
      this.router.navigateByUrl('/bones');
    });
  }
}