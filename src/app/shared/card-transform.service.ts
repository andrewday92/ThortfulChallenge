import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { cardTranslations } from '@models';

@Injectable({
  providedIn: 'root'
})
export class CardTransformService {
  private _cardTranslations$ = new BehaviorSubject<cardTranslations>({wholeCard: {x: 0, y: 0, z: 0}});

  /** Observable stream of card translations for subscribers */
  public readonly cardTranslations$: Observable<cardTranslations> = this._cardTranslations$.asObservable();

  /** Update the card translations */
  public updateTranslations(translations: cardTranslations): void {
    this._cardTranslations$.next(translations);
  }

  /** Get the current translation values synchronously */
  public getCurrentTranslations(): cardTranslations {
    return this._cardTranslations$.getValue();
  }
}
