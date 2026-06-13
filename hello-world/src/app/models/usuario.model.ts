export type Perfil = 'ADM' | 'USER';

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  perfil: Perfil;
}

export interface UsuarioPayload {
  nome: string;
  email: string;
  senha?: string;
  perfil: Perfil;
}

export interface UsuarioPerfilPayload {
  nome: string;
  email: string;
  senhaConfirmacao: string;
}

export interface UsuarioSenhaPayload {
  senhaAtual: string;
  novaSenha: string;
}
