import { Bordado } from './bordado.model';
import { Estampa } from './estampa.model';
import { Estoque } from './estoque.model';

export interface Bone {
  id: number;
  nome: string;
  cor: string;
  nomeMaterial: string;
  categoriaAba: string;
  tamanhoAba: number;
  profundidade: number;
  circunferencia: string;
  bordado: Bordado;
  nomeMarca: string;
  estoque: Estoque | null;
  nomeModelo: string;
  estampas: Estampa[] | null;
  preco: number;
}