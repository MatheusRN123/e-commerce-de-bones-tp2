import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { Bone } from '../../../models/bone.model';
import { ArquivoService } from '../../../services/arquivo.service';
import { WishlistService } from '../../../services/wishlist.service';

@Component({
  selector: 'app-wishlist-list',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterLink, MatButtonModule, MatIconModule, MatSnackBarModule],
  templateUrl: './wishlist-list.html',
  styleUrl: './wishlist-list.css'
})
export class WishlistList implements OnInit {
  bones: Bone[] = [];
  loading = true;

  constructor(
    private wishlistService: WishlistService,
    private arquivoService: ArquivoService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.loading = true;
    this.wishlistService.findAll().subscribe({
      next: (bones) => {
        this.bones = bones;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Erro ao carregar lista de desejos.', 'Fechar', { duration: 3000 });
      }
    });
  }

  remover(bone: Bone): void {
    this.wishlistService.remove(bone.id).subscribe({
      next: () => {
        this.bones = this.bones.filter((item) => item.id !== bone.id);
        this.snackBar.open('Removido da lista de desejos.', 'Fechar', { duration: 2500 });
      },
      error: () => this.snackBar.open('Nao foi possivel remover.', 'Fechar', { duration: 3000 })
    });
  }

  getUrlImagem(imagemFid?: string): string {
    return imagemFid ? this.arquivoService.getUrlDownload(imagemFid) : '/assets/placeholder-image.png';
  }
}
