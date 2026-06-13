import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { SavedCard } from '../models/saved-card.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class SavedCardService {
  private readonly cardsSubject = new BehaviorSubject<SavedCard[]>([]);
  readonly cards$ = this.cardsSubject.asObservable();

  constructor(private authService: AuthService) {
    this.reload();
  }

  getCards(): SavedCard[] {
    return this.cardsSubject.value;
  }

  save(card: Omit<SavedCard, 'id'>): void {
    const cards = [...this.cardsSubject.value, { ...card, id: this.createId() }];
    this.persist(cards);
  }

  remove(id: string): void {
    this.persist(this.cardsSubject.value.filter((card) => card.id !== id));
  }

  reload(): void {
    this.cardsSubject.next(this.load());
  }

  private persist(cards: SavedCard[]): void {
    localStorage.setItem(this.storageKey(), JSON.stringify(cards));
    this.cardsSubject.next(cards);
  }

  private load(): SavedCard[] {
    const raw = localStorage.getItem(this.storageKey());
    if (!raw) return [];

    try {
      return JSON.parse(raw) as SavedCard[];
    } catch {
      return [];
    }
  }

  private storageKey(): string {
    return `bone-cards-${this.authService.getToken() || 'guest'}`;
  }

  private createId(): string {
    return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
  }
}
