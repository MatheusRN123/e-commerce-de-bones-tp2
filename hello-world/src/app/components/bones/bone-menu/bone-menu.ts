import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { BoneService } from '../../../services/bone.service';
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

  constructor(private readonly boneService: BoneService) {}

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
    return (
      bone.imagemUrl ||
      `https://via.placeholder.com/400x280?text=${encodeURIComponent(bone.nome || 'Bon%C3%A9')}`
    );
  }
}
