import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CardTranslations, ZOOM_BOUNDS } from '@models';

@Injectable({
  providedIn: 'root'
})
export class CardTransformService {
  private _cardTranslations$ = new BehaviorSubject<CardTranslations>({wholeCard: {x: 0, y: 0, z: 0}});

  /** Observable stream of card translations for subscribers */
  public readonly cardTranslations$: Observable<CardTranslations> = this._cardTranslations$.asObservable();

  /** Update the card translations */
  public updateTranslations(translations: CardTranslations): void {
    this._cardTranslations$.next(translations);
  }

  /** Get the current translation values synchronously */
  public getCurrentTranslations(): CardTranslations {
    return this._cardTranslations$.getValue();
  }

  /** Clamp a zoom value within the shared bounds */
  public clampZoom(z: number): number {
    return Math.max(ZOOM_BOUNDS.min, Math.min(ZOOM_BOUNDS.max, z));
  }
}
