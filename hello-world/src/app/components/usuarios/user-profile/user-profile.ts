import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';

import { PedidoResponse } from '../../../models/pedido.model';
import { Usuario } from '../../../models/usuario.model';
import { Endereco, EnderecoPayload } from '../../../models/endereco.model';
import { SavedCard } from '../../../models/saved-card.model';
import { AuthService } from '../../../services/auth.service';
import { EnderecoService } from '../../../services/endereco.service';
import { PedidoService } from '../../../services/pedido.service';
import { SavedCardService } from '../../../services/saved-card.service';
import { UsuarioService } from '../../../services/usuario.service';

type ProfileSection = 'dados' | 'enderecos' | 'cartoes' | 'historico';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    DatePipe,
    FormsModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.css'
})
export class UserProfile implements OnInit {
  usuario?: Usuario;
  pedidos: PedidoResponse[] = [];
  enderecos: Endereco[] = [];
  cards: SavedCard[] = [];
  loading = true;
  savingProfile = false;
  sendingPasswordEmail = false;
  savingAddress = false;
  editingEnderecoId?: number;
  savingCard = false;
  activeSection: ProfileSection = 'dados';

  profileForm = {
    nome: '',
    email: '',
    senhaConfirmacao: ''
  };

  addressForm: EnderecoPayload = {
    nomeDestinatario: '',
    cep: '',
    logradouro: '',
    numero: '',
    idCidade: null,
    nomeCidade: '',
    siglaEstado: '',
    nomeEstado: ''
  };

  cardForm = {
    nomeTitular: '',
    numero: '',
    validade: '',
    cvv: ''
  };

  constructor(
    private usuarioService: UsuarioService,
    private pedidoService: PedidoService,
    private enderecoService: EnderecoService,
    private savedCardService: SavedCardService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const tab = this.route.snapshot.queryParamMap.get('tab');
    if (this.isProfileSection(tab)) {
      this.activeSection = tab;
    }
    this.loadProfile();
  }

  get showPurchaseHistory(): boolean {
    return this.authService.isUser() && !this.authService.isAdmin();
  }

  setActiveSection(section: ProfileSection): void {
    this.activeSection = section;
  }

  private isProfileSection(value: string | null): value is ProfileSection {
    return value === 'dados' || value === 'enderecos' || value === 'cartoes' || value === 'historico';
  }

  saveProfile(): void {
    if (!this.profileForm.senhaConfirmacao) {
      this.snackBar.open('Confirme sua senha para alterar o perfil.', 'Fechar', { duration: 3000 });
      return;
    }

    this.savingProfile = true;
    this.usuarioService.updateMe(this.profileForm).subscribe({
      next: (usuario) => {
        this.usuario = usuario;
        this.profileForm.senhaConfirmacao = '';
        this.savingProfile = false;
        this.snackBar.open('Perfil atualizado.', 'Fechar', { duration: 2500 });
      },
      error: () => {
        this.savingProfile = false;
        this.snackBar.open('Senha invalida ou dados nao aceitos.', 'Fechar', { duration: 3000 });
      }
    });
  }

  requestPasswordReset(): void {
    if (!this.usuario?.email) {
      return;
    }

    this.sendingPasswordEmail = true;
    this.authService.forgotPassword(this.usuario.email).subscribe({
      next: () => {
        this.sendingPasswordEmail = false;
        this.snackBar.open('Enviamos o link de redefinicao para seu email.', 'Fechar', { duration: 3500 });
      },
      error: () => {
        this.sendingPasswordEmail = false;
        this.snackBar.open('Nao foi possivel enviar o email agora.', 'Fechar', { duration: 3000 });
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }

  saveAddress(): void {
    if (!this.showPurchaseHistory) {
      return;
    }

    if (!this.addressForm.nomeDestinatario || !this.addressForm.cep || !this.addressForm.logradouro || !this.addressForm.numero || !this.addressForm.nomeCidade || !this.addressForm.siglaEstado || !this.addressForm.nomeEstado) {
      this.snackBar.open('Preencha todos os dados do endereco.', 'Fechar', { duration: 3000 });
      return;
    }

    this.savingAddress = true;
    const request: Observable<unknown> = this.editingEnderecoId
      ? this.enderecoService.update(this.editingEnderecoId, this.addressForm)
      : this.enderecoService.create(this.addressForm);

    request.subscribe({
      next: () => {
        this.savingAddress = false;
        this.resetAddressForm();
        this.loadEnderecos();
        this.snackBar.open('Endereco salvo.', 'Fechar', { duration: 2500 });
      },
      error: () => {
        this.savingAddress = false;
        this.snackBar.open('Nao foi possivel salvar o endereco.', 'Fechar', { duration: 3000 });
      }
    });
  }

  editAddress(endereco: Endereco): void {
    this.editingEnderecoId = endereco.id;
    this.addressForm = {
      nomeDestinatario: endereco.nomeDestinatario || this.usuario?.nome || '',
      cep: endereco.cep,
      logradouro: endereco.logradouro,
      numero: endereco.numero,
      idCidade: null,
      nomeCidade: endereco.nomeCidade,
      siglaEstado: endereco.siglaEstado || '',
      nomeEstado: endereco.nomeEstado || ''
    };
  }

  removeAddress(endereco: Endereco): void {
    this.enderecoService.delete(endereco.id).subscribe({
      next: () => {
        this.enderecos = this.enderecos.filter((item) => item.id !== endereco.id);
        if (this.editingEnderecoId === endereco.id) this.resetAddressForm();
        this.snackBar.open('Endereco removido.', 'Fechar', { duration: 2500 });
      },
      error: () => this.snackBar.open('Nao foi possivel remover o endereco.', 'Fechar', { duration: 3000 })
    });
  }

  resetAddressForm(): void {
    this.editingEnderecoId = undefined;
    this.addressForm = {
      nomeDestinatario: this.usuario?.nome || '',
      cep: '',
      logradouro: '',
      numero: '',
      idCidade: null,
      nomeCidade: '',
      siglaEstado: '',
      nomeEstado: ''
    };
  }

  saveCard(): void {
    if (!this.validateCard()) {
      return;
    }

    this.savedCardService.save({
      ...this.cardForm,
      numero: this.onlyDigits(this.cardForm.numero)
    });
    this.cards = this.savedCardService.getCards();
    this.cardForm = { nomeTitular: '', numero: '', validade: '', cvv: '' };
    this.snackBar.open('Cartao cadastrado.', 'Fechar', { duration: 2500 });
  }

  formatCardNumber(): void {
    this.cardForm.numero = this.onlyDigits(this.cardForm.numero)
      .slice(0, 16)
      .replace(/(\d{4})(?=\d)/g, '$1 ');
  }

  formatCardValidity(): void {
    const digits = this.onlyDigits(this.cardForm.validade).slice(0, 4);
    this.cardForm.validade = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
  }

  formatCardCvv(): void {
    this.cardForm.cvv = this.onlyDigits(this.cardForm.cvv).slice(0, 4);
  }

  removeCard(card: SavedCard): void {
    this.savedCardService.remove(card.id);
    this.cards = this.savedCardService.getCards();
  }

  private loadProfile(): void {
    this.loading = true;
    this.usuarioService.findMe().subscribe({
      next: (usuario) => {
        this.usuario = usuario;
        this.profileForm.nome = usuario.nome;
        this.profileForm.email = usuario.email;
        this.loading = false;
        this.savedCardService.reload();
        this.cards = this.savedCardService.getCards();
        if (this.showPurchaseHistory) {
          this.loadEnderecos();
          this.loadPedidos();
        }
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Erro ao carregar perfil.', 'Fechar', { duration: 3000 });
      }
    });
  }

  private loadPedidos(): void {
    this.pedidoService.findAll().subscribe({
      next: (pedidos) => this.pedidos = pedidos.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()),
      error: () => this.snackBar.open('Erro ao carregar historico de compras.', 'Fechar', { duration: 3000 })
    });
  }

  private loadEnderecos(): void {
    this.enderecoService.findMine().subscribe({
      next: (enderecos) => this.enderecos = enderecos,
      error: () => this.snackBar.open('Erro ao carregar enderecos.', 'Fechar', { duration: 3000 })
    });
  }

  private validateCard(): boolean {
    const number = this.onlyDigits(this.cardForm.numero);
    const cvv = this.onlyDigits(this.cardForm.cvv);

    if (!this.cardForm.nomeTitular.trim()) {
      this.snackBar.open('Informe o nome do titular.', 'Fechar', { duration: 3000 });
      return false;
    }

    if (number.length !== 16) {
      this.snackBar.open('O numero do cartao deve ter 16 digitos.', 'Fechar', { duration: 3000 });
      return false;
    }

    if (!this.isValidCardDate(this.cardForm.validade)) {
      this.snackBar.open('A validade deve estar no formato MM/AA e nao pode estar vencida.', 'Fechar', { duration: 3000 });
      return false;
    }

    if (cvv.length < 3 || cvv.length > 4) {
      this.snackBar.open('O CVV deve ter 3 ou 4 digitos.', 'Fechar', { duration: 3000 });
      return false;
    }

    return true;
  }

  private isValidCardDate(value: string): boolean {
    const match = /^(\d{2})\/(\d{2})$/.exec(value);
    if (!match) return false;

    const month = Number(match[1]);
    const year = 2000 + Number(match[2]);
    if (month < 1 || month > 12) return false;

    return new Date(year, month, 0, 23, 59, 59) >= new Date();
  }

  private onlyDigits(value: string): string {
    return value.replace(/\D/g, '');
  }
}
