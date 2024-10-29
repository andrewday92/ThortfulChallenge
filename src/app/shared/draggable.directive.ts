import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';
import { CardTransformService } from './card-transform.service';
import { cardTranslations } from '@models';


@Directive({
  selector: '[appDraggable]'
})
export class DraggableDirective {
  @Input() reducedMotion = false;
  public cardTranslations: cardTranslations = {wholeCard: {x: 0, y: -20, z: 0}};
  private _offsetX = 0;
  private _offsetY = 0;
  private _clientX: number | undefined;
  private _clientY: number | undefined;
  private _scrollY: number | undefined;
  private _nativeHostElement!: any;
  constructor(private _renderer: Renderer2, private _el: ElementRef, private _cardTransformService: CardTransformService) {
    this._nativeHostElement = this._el.nativeElement;
  }

  @HostListener('mousedown', ['$event'])
  @HostListener('touchstart', ['$event'])
  onDragStart(event: any): void {

    if(this.reducedMotion){
      event.preventDefault();

      const rect = this._nativeHostElement.getBoundingClientRect();
      this._offsetX = event.clientX - rect.left;
      this._offsetY = event.clientY - rect.top;

      const scrollCard = this._renderer.listen(this._el.nativeElement, 'wheel', (wheelEvent: WheelEvent) => {
        if (!this._scrollY) { this._scrollY = wheelEvent.deltaY}
        const cardNewZ = this.cardTranslations.wholeCard.z - this._scrollY;
        const boundedZoom: number = cardNewZ > 30  ? 30 : cardNewZ < -50 ? -50 : cardNewZ;
        if(boundedZoom < 30 && boundedZoom > -50){
          this._cardTransformService.cardTranslations$.next({
            wholeCard: {
              x: this.cardTranslations.wholeCard.x,
              y: this.cardTranslations.wholeCard.y,
              z: boundedZoom
            }
          });
        }
        this._scrollY -= wheelEvent.deltaY;

      });

      const moveCard = this._renderer.listen('document', 'touchmove', (moveEvent TouchEvent) => {
        this._renderer.addClass(this._el.nativeElement, 'smooth-transition');
        this.cardTranslations = this._cardTransformService.cardTranslations$.getValue();
        if (!this._clientX) { this._clientX = moveEvent.clientX}
        if (!this._clientY) { this._clientY = moveEvent.clientY}
        if((this._clientX !== moveEvent.clientX) || (this._clientY !== moveEvent.clientY)){
          this._cardTransformService.cardTranslations$.next({
            wholeCard: {
              x: this.cardTranslations.wholeCard.x - this._clientY + moveEvent.clientY,
              y: this.cardTranslations.wholeCard.y - this._clientX + moveEvent.clientX,
              z: this.cardTranslations.wholeCard.z
            }
          });
          this._clientX = moveEvent.clientX;
          this._clientY = moveEvent.clientY;
        }
      });
      this._renderer.listen('document', 'touchend', (mouseUpEvent: TouchEvent) => {
        scrollCard();
        moveCard();
        this._renderer.removeClass(this._el.nativeElement , 'smooth-transition');
        this._clientX = undefined;
        this._clientY = undefined;
        this._scrollY = undefined;
      });
    }
  }
}
