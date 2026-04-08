export interface Estampa {
  id: number;
  tipo: string;
  nome: string;
  posicao: string;
  descricao: string;
  corLinha?: string | null;
  quantCores?: number | null;
  resolucao?: string | null;
}