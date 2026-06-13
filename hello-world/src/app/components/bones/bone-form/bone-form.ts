import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BoneService } from '../../../services/bone.service';
import { ArquivoService } from '../../../services/arquivo.service';
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
  quickForm!: FormGroup;
  quickModal: 'marca' | 'modelo' | 'material' | 'estampa' | null = null;
  marcas: Marca[] = [];
  modelos: Modelo[] = [];
  materiais: Material[] = [];
  estampas: Estampa[] = [];
  estampasSelecionadas: number[] = [];
  bordados: string[] = ['COM_BORDADO', 'SEM_BORDADO', 'PERSONALIZADO'];

  imagemFid: string | null = null;
  previewImagem: string | null = null;
  uploadandoImagem = false;

  constructor(
    private formBuilder: FormBuilder,
    private boneService: BoneService,
    private arquivoService: ArquivoService,
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
      quantidadeEstoque:  ['', [Validators.required, Validators.min(1)]],
      imagemFid:          [null, Validators.required]
    });

    this.quickForm = this.formBuilder.group({
      nome: ['', Validators.required],
      categoria: [''],
      estilo: [''],
      tipo: ['DIGITAL'],
      posicao: [''],
      descricao: [''],
      resolucao: [''],
      corLinha: [''],
      quantCores: [null]
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
      preco:             form.preco,
      imagemFid:         this.imagemFid ?? undefined
    };

    this.boneService.create(dto).subscribe(() => {
      this.router.navigateByUrl('/bones');
    });
  }

  onImagemSelecionada(event: Event): void {
    const input = event.target as HTMLInputElement;
    const arquivo = input.files?.[0];

    if (!arquivo) return;

    // Criar preview
    const reader = new FileReader();
    reader.onload = () => {
      this.previewImagem = reader.result as string;
    };
    reader.readAsDataURL(arquivo);

    // Fazer upload
    this.uploadandoImagem = true;
    this.arquivoService.upload(arquivo).subscribe({
      next: (resposta) => {
        this.imagemFid = resposta.fid;
        this.formGroup.get('imagemFid')?.setValue(resposta.fid);
        this.uploadandoImagem = false;
      },
      error: () => {
        this.uploadandoImagem = false;
        alert('Erro ao fazer upload da imagem');
      }
    });
  }

  dropdownAberto: string | null = null;
  
  @HostListener('document:click')
  fecharDropdowns(): void {
    this.dropdownAberto = null;
  }
  
  toggleDropdown(campo: string): void {
    this.dropdownAberto = this.dropdownAberto === campo ? null : campo;
  }
  
  selecionarOpcao(campo: string, valor: any): void {
    this.formGroup.get(campo)?.setValue(valor);
    this.dropdownAberto = null;
  }

  abrirCadastroRapido(tipo: 'marca' | 'modelo' | 'material' | 'estampa', event?: Event): void {
    event?.stopPropagation();
    this.quickModal = tipo;
    this.quickForm.reset({
      nome: '',
      categoria: '',
      estilo: '',
      tipo: 'DIGITAL',
      posicao: '',
      descricao: '',
      resolucao: '',
      corLinha: '',
      quantCores: null
    });
  }

  fecharCadastroRapido(): void {
    this.quickModal = null;
  }

  salvarCadastroRapido(): void {
    if (!this.quickModal || this.quickForm.get('nome')?.invalid) {
      this.quickForm.markAllAsTouched();
      return;
    }

    const v = this.quickForm.value;

    if (this.quickModal === 'marca') {
      this.marcaService.create({ id: 0, nome: v.nome }).subscribe((marca) => {
        this.marcas = [...this.marcas, marca];
        this.selecionarOpcao('marca', marca);
        this.fecharCadastroRapido();
      });
      return;
    }

    if (this.quickModal === 'material') {
      this.materialService.create({ id: 0, nome: v.nome }).subscribe((material) => {
        this.materiais = [...this.materiais, material];
        this.selecionarOpcao('material', material);
        this.fecharCadastroRapido();
      });
      return;
    }

    if (this.quickModal === 'modelo') {
      const dto = { id: 0, nome: v.nome, categoria: v.categoria || 'Geral', estilo: v.estilo || 'Padrao' };
      this.modeloService.create(dto).subscribe((modelo) => {
        this.modelos = [...this.modelos, modelo];
        this.selecionarOpcao('modelo', modelo);
        this.fecharCadastroRapido();
      });
      return;
    }

    const common = { nome: v.nome, posicao: v.posicao || 'Frente', descricao: v.descricao || '' };
    const request = v.tipo === 'BORDADA'
      ? this.estampaService.createBordada({ ...common, corLinha: v.corLinha || 'Branco', quantCores: v.quantCores || 1 })
      : this.estampaService.createDigital({ ...common, resolucao: v.resolucao || '1080p' });

    request.subscribe((estampa) => {
      this.estampas = [...this.estampas, estampa];
      if (estampa?.id) {
        this.estampasSelecionadas = [...this.estampasSelecionadas, estampa.id];
      }
      this.fecharCadastroRapido();
    });
  }

  selecionarTipo(tipo: string): void {
    this.quickForm.get('tipo')?.setValue(tipo);
    this.dropdownAberto = null;
  }
}
