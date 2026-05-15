import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { BoneService } from '../../../services/bone.service';
import { ArquivoService } from '../../../services/arquivo.service';
import { Bone } from '../../../models/bone.model';

@Component({
  selector: 'app-bone-menu',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './bone-menu.html',
  styleUrl: './bone-menu.css',
})
export class BoneMenu implements OnInit {
  bones: Bone[] = [];
  isLoading = false;

  constructor(
    private readonly boneService: BoneService,
    private readonly arquivoService: ArquivoService  // ← injetar aqui
  ) {}

  ngOnInit(): void {
    this.loadBones();
  }

  loadBones(): void {
    this.isLoading = true;
    this.boneService.findAll(0, 12).subscribe({
      next: (data) => {
        this.bones = data;
        this.isLoading = false;
      },
      error: () => {
        this.bones = [];
        this.isLoading = false;
      },
    });
  }

  getImage(bone: Bone): string {
    return bone.imagemFid
      ? this.arquivoService.getUrlDownload(bone.imagemFid)
      : `https://via.placeholder.com/400x280?text=${encodeURIComponent(bone.nome || 'Boné')}`;
  }
}