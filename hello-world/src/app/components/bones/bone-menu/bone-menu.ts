import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BoneService } from '../../../services/bone.service';
import { ArquivoService } from '../../../services/arquivo.service';
import { WishlistService } from '../../../services/wishlist.service';
import { CartService } from '../../../services/cart.service';
import { Bone } from '../../../models/bone.model';

@Component({
  selector: 'app-bone-menu',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, FormsModule, RouterLink, MatSnackBarModule],
  templateUrl: './bone-menu.html',
  styleUrl: './bone-menu.css',
})
export class BoneMenu implements OnInit {
  bones: Bone[] = [];
  wishlistIds = new Set<number>();
  termoBusca = '';
  totalRecords = 0;
  page = 0;
  pageSize = 12;
  isLoading = false;

  constructor(
    private readonly boneService: BoneService,
    private readonly arquivoService: ArquivoService,
    private readonly wishlistService: WishlistService,
    private readonly cartService: CartService,
    private readonly router: Router,
    private readonly snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadBones();
    this.loadWishlist();
  }

  loadBones(): void {
    this.isLoading = true;
    this.boneService.search(this.termoBusca.trim(), this.page, this.pageSize).subscribe({
      next: (data) => {
        this.bones = data;
        this.isLoading = false;
      },
      error: () => {
        this.bones = [];
        this.isLoading = false;
      },
    });
    this.loadTotal();
  }

  loadTotal(): void {
    this.boneService.countSearch(this.termoBusca.trim()).subscribe({
      next: (total) => {
        this.totalRecords = total;
      },
      error: () => {
        this.totalRecords = 0;
      }
    });
  }

  loadWishlist(): void {
    this.wishlistService.findIds().subscribe({
      next: (ids) => {
        this.wishlistIds = new Set(ids);
      }
    });
  }

  aplicarFiltro(): void {
    this.page = 0;
    this.loadBones();
  }

  onSearchChange(): void {
    if (this.termoBusca.trim()) return;
    this.aplicarFiltro();
  }

  totalPages(): number {
    return Math.max(1, Math.ceil(this.totalRecords / this.pageSize));
  }

  canGoPrevious(): boolean {
    return this.page > 0;
  }

  canGoNext(): boolean {
    return this.page + 1 < this.totalPages();
  }

  goPrevious(): void {
    if (!this.canGoPrevious()) return;
    this.page--;
    this.loadBones();
  }

  goNext(): void {
    if (!this.canGoNext()) return;
    this.page++;
    this.loadBones();
  }

  changePageSize(value: string): void {
    this.pageSize = Number(value);
    this.page = 0;
    this.loadBones();
  }

  getImage(bone: Bone): string {
    return bone.imagemFid
      ? this.arquivoService.getUrlDownload(bone.imagemFid)
      : `https://via.placeholder.com/400x280?text=${encodeURIComponent(bone.nome || 'Bone')}`;
  }

  estaNaListaDesejos(bone: Bone): boolean {
    return this.wishlistIds.has(bone.id);
  }

  alternarListaDesejos(bone: Bone): void {
    if (this.estaNaListaDesejos(bone)) {
      this.removerDesejo(bone);
      return;
    }

    this.adicionarDesejo(bone);
  }

  private adicionarDesejo(bone: Bone): void {
    this.wishlistService.add(bone.id).subscribe({
      next: () => {
        this.wishlistIds.add(bone.id);
        this.wishlistIds = new Set(this.wishlistIds);
        this.snackBar.open('Adicionado a lista de desejos.', 'Fechar', { duration: 2500 });
      },
      error: () => this.snackBar.open('Erro ao atualizar lista de desejos.', 'Fechar', { duration: 3000 })
    });
  }

  private removerDesejo(bone: Bone): void {
    this.wishlistService.remove(bone.id).subscribe({
      next: () => {
        this.wishlistIds.delete(bone.id);
        this.wishlistIds = new Set(this.wishlistIds);
        this.snackBar.open('Removido da lista de desejos.', 'Fechar', { duration: 2500 });
      },
      error: () => this.snackBar.open('Erro ao atualizar lista de desejos.', 'Fechar', { duration: 3000 })
    });
  }

  adicionarCarrinho(bone: Bone): void {
    this.cartService.add(bone);
    this.snackBar.open(`${bone.nome} adicionado ao carrinho.`, 'Ver carrinho', { duration: 3000 })
      .onAction()
      .subscribe(() => this.router.navigateByUrl('/carrinho'));
  }
}
