import { Bone } from './bone.model';

export interface ItemPedidoPayload {
  idBone: number;
  quantidade: number;
}

export interface PixPayload {
  chave: string;
  tipoChave: string;
}

export interface CartaoPayload {
  nomeTitular: string;
  numero: string;
  validade: string;
  cvv: string;
}

export interface BoletoPayload {
  codigoBarras: string;
  dataVencimento: string;
}

export interface PagamentoPayload {
  tipoPagamento: 'PIX' | 'CARTAO' | 'BOLETO';
  pix?: PixPayload;
  cartao?: CartaoPayload;
  boleto?: BoletoPayload;
}

export interface PedidoPayload {
  idEndereco: number;
  itens: ItemPedidoPayload[];
  pagamento: PagamentoPayload;
}

export interface ItemPedidoResponse {
  id: number;
  idPedido: number;
  bone: Bone;
  quantidade: number;
  subtotal: number;
}

export interface PagamentoResponse {
  id: number;
  valor: number;
  data: string;
  status: string;
  tipo: string;
}

export interface PedidoResponse {
  id: number;
  numeroUsuario?: number;
  data: string;
  cep: string;
  logradouro: string;
  numero: string;
  cidade: string;
  estado: string;
  pagamento: PagamentoResponse | null;
  itens: ItemPedidoResponse[];
  valorTotal: number;
}
