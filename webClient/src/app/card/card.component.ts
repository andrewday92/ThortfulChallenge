import { Component, Input, OnInit, Renderer2 } from '@angular/core';
import { CardTransformService } from '../shared/card-transform.service';
import { CardFaceService } from '../shared/card-face.service';
import { Subject, takeUntil } from 'rxjs';
import { cardTranslations } from '../shared/models';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit {
  protected reducedMotionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  protected reducedMotion: boolean = this.reducedMotionMediaQuery.matches;
  private _destroy$: Subject<void> = new Subject();
  public wholeCardX: number = 0;
  public wholeCardY: number = 0;
  public wholeCardZ: number = 0;
  protected isSidebarCollapsed = (window.innerWidth < 600);
  @Input() salutation!: string;
  @Input() cardMessage!: string;
  @Input() signOff!: string;

  @Input() isOpen: boolean = false;
  @Input() loading: boolean = false;

  constructor(private _cardTransformService: CardTransformService, private _cardFaceService: CardFaceService,
    private _renderer: Renderer2) {}

  ngOnInit(): void {
    this._cardTransformService.cardTranslations$
    .pipe(takeUntil(this._destroy$))
    .subscribe((translationData: cardTranslations) => {
      this.wholeCardX = translationData.wholeCard.x;
      this.wholeCardY = translationData.wholeCard.y;
      this.wholeCardZ = translationData.wholeCard.z;
    });

    this._renderer.listen(this.reducedMotionMediaQuery, 'change', () => {
      this.reducedMotion = this.reducedMotionMediaQuery.matches;
    });
  }

  public editContent(event: MouseEvent, type: 'salutation' | 'cardMessage' | 'signOff'){
    event.preventDefault();
    this.isSidebarCollapsed = false;
    this._renderer.selectRootElement(`#${type}Field`).focus();
  }

  public focus(type: 'face' | 'inside'){
    this.isOpen = (type === 'inside');
    this._cardTransformService.cardTranslations$.next({
      wholeCard: {
        x: 0,
        y: 0,
        z: this.wholeCardZ
      }
    });
  }
}
