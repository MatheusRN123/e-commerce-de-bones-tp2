export interface Endereco {
  id: number;
  nomeDestinatario?: string;
  cep: string;
  logradouro: string;
  numero: string;
  nomeCidade: string;
  siglaEstado?: string;
  nomeEstado?: string;
}

export interface EnderecoPayload {
  nomeDestinatario: string;
  cep: string;
  logradouro: string;
  numero: string;
  idCidade?: number | null;
  nomeCidade: string;
  siglaEstado: string;
  nomeEstado: string;
}
