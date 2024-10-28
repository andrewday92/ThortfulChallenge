import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { cardTranslations } from '@models';
@Injectable({
  providedIn: 'root'
})
export class CardTransformService {
  public cardTranslations$: BehaviorSubject<cardTranslations> = new BehaviorSubject({wholeCard: {x: 0, y: 0, z: 0}});

  constructor() { }
}
