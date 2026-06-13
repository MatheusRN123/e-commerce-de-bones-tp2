export interface Coupon {
  id: number;
  codigo: string;
  descricao: string;
  percentualDesconto: number;
  valorMinimo: number;
  ativo: boolean;
  dataValidade: string | null;
}

export interface CouponPayload {
  codigo: string;
  descricao: string;
  percentualDesconto: number;
  valorMinimo: number;
  ativo: boolean;
  dataValidade: string | null;
}

export interface CouponValidation {
  id: number;
  codigo: string;
  descricao: string;
  percentualDesconto: number;
  valorMinimo: number;
  dataValidade: string | null;
  subtotal: number;
  valorDesconto: number;
  total: number;
}
