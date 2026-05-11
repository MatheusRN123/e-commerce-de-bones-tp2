import { Estampa } from './estampa.model';

export interface Bone {
  id: number;
  nome: string;
  imagemFid?: string;
  cor: string;
  nomeMaterial: string;
  idMaterial: number;
  categoriaAba: string;
  tamanhoAba: number;
  profundidade: number;
  circunferencia: string;
  bordado: string;
  nomeMarca: string;
  idMarca: number;
  quantidadeEstoque: number;
  nomeModelo: string;
  idModelo: number;
  estampas: Estampa[] | null;
  preco: number;
}