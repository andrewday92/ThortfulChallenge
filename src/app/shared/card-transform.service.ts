import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CardTranslations, ZOOM_BOUNDS } from '@models';

@Injectable({
  providedIn: 'root'
})
export class CardTransformService {
  private _cardTranslations$ = new BehaviorSubject<CardTranslations>({wholeCard: {x: 0, y: 0, z: 0}});
  public cardTranslations$: Observable<CardTranslations> = this._cardTranslations$.asObservable();

  public updateTranslations(value: CardTranslations): void {
    this._cardTranslations$.next(value);
  }

  public getCurrentTranslations(): CardTranslations {
    return this._cardTranslations$.getValue();
  }

  /** Clamp a zoom value within the shared bounds */
  public clampZoom(z: number): number {
    return Math.max(ZOOM_BOUNDS.min, Math.min(ZOOM_BOUNDS.max, z));
  }
}
