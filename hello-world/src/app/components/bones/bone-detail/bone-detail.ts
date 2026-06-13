import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { Bone } from '../../../models/bone.model';
import { ArquivoService } from '../../../services/arquivo.service';
import { BoneService } from '../../../services/bone.service';
import { CartService } from '../../../services/cart.service';
import { WishlistService } from '../../../services/wishlist.service';

@Component({
  selector: 'app-bone-detail',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterLink, MatButtonModule, MatIconModule, MatSnackBarModule],
  templateUrl: './bone-detail.html',
  styleUrl: './bone-detail.css'
})
export class BoneDetail implements OnInit {
  bone?: Bone;
  loading = true;
  inWishlist = false;
  returnUrl = '/menu';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private boneService: BoneService,
    private arquivoService: ArquivoService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/menu';
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.router.navigateByUrl(this.returnUrl);
      return;
    }

    this.boneService.findById(id).subscribe({
      next: (bone) => {
        this.bone = bone;
        this.loading = false;
        this.carregarEstadoWishlist();
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Produto nao encontrado.', 'Fechar', { duration: 3000 });
        this.router.navigateByUrl(this.returnUrl);
      }
    });
  }

  carregarEstadoWishlist(): void {
    this.wishlistService.findIds().subscribe({
      next: (ids) => {
        this.inWishlist = !!this.bone && ids.includes(this.bone.id);
      }
    });
  }

  toggleWishlist(): void {
    if (!this.bone) return;

    if (this.inWishlist) {
      this.removerWishlist(this.bone.id);
      return;
    }

    this.adicionarWishlist(this.bone.id);
  }

  private adicionarWishlist(boneId: number): void {
    this.wishlistService.add(boneId).subscribe({
      next: () => {
        this.inWishlist = true;
        this.snackBar.open('Adicionado a lista de desejos.', 'Fechar', { duration: 2500 });
      },
      error: () => this.snackBar.open('Nao foi possivel atualizar a lista de desejos.', 'Fechar', { duration: 3000 })
    });
  }

  private removerWishlist(boneId: number): void {
    this.wishlistService.remove(boneId).subscribe({
      next: () => {
        this.inWishlist = false;
        this.snackBar.open('Removido da lista de desejos.', 'Fechar', { duration: 2500 });
      },
      error: () => this.snackBar.open('Nao foi possivel atualizar a lista de desejos.', 'Fechar', { duration: 3000 })
    });
  }

  adicionarCarrinho(): void {
    if (!this.bone) return;

    this.cartService.add(this.bone);
    this.snackBar.open(`${this.bone.nome} adicionado ao carrinho.`, 'Ver carrinho', { duration: 3000 })
      .onAction()
      .subscribe(() => this.router.navigateByUrl('/carrinho'));
  }

  getUrlImagem(imagemFid?: string): string {
    return imagemFid ? this.arquivoService.getUrlDownload(imagemFid) : '/assets/placeholder-image.png';
  }
}
