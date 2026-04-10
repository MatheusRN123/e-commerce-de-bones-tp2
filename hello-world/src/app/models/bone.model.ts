import { Estampa } from './estampa.model';

export interface Bone {
  id: number;
  nome: string;
  cor: string;
  nomeMaterial: string;
  categoriaAba: string;
  tamanhoAba: number;
  profundidade: number;
  circunferencia: string;
  bordado: string;
  nomeMarca: string;
  quantidadeEstoque: number;
  nomeModelo: string;
  estampas: Estampa[] | null;
  preco: number;
}