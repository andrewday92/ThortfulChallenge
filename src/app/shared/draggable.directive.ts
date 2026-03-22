import { Directive, ElementRef, HostListener, Input, OnDestroy, Renderer2 } from '@angular/core';
import { CardTransformService } from './card-transform.service';
import { CardTranslations } from '@models';


@Directive({
  selector: '[appDraggable]',
  standalone: true
})
export class DraggableDirective implements OnDestroy {
  @Input() reducedMotion = false;
  private _clientX: number | undefined;
  private _clientY: number | undefined;
  private _scrollY: number | undefined;
  private _rafId: number | null = null;

  /** Track active listener teardown functions to prevent memory leaks */
  private _activeScrollListener: (() => void) | null = null;
  private _activeMoveListener: (() => void) | null = null;
  private _activePointerUpListener: (() => void) | null = null;

  constructor(
    private _renderer: Renderer2,
    private _el: ElementRef,
    private _cardTransformService: CardTransformService
  ) {}

  ngOnDestroy(): void {
    this._cleanupListeners();
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
    }
  }

  @HostListener('pointerdown', ['$event'])
  onDragStart(event: PointerEvent): void {

    if (this.reducedMotion) {
      event.preventDefault();

      // Clean up any previously active listeners before registering new ones
      this._cleanupListeners();

      this._activeScrollListener = this._renderer.listen(this._el.nativeElement, 'wheel', (wheelEvent: WheelEvent) => {
        if (!this._scrollY) { this._scrollY = wheelEvent.deltaY; }
        const current = this._cardTransformService.getCurrentTranslations();
        const cardNewZ = current.wholeCard.z - this._scrollY;
        const boundedZoom = this._cardTransformService.clampZoom(cardNewZ);
        this._cardTransformService.updateTranslations({
          wholeCard: {
            x: current.wholeCard.x,
            y: current.wholeCard.y,
            z: boundedZoom
          }
        });
        this._scrollY -= wheelEvent.deltaY;
      });

      this._activeMoveListener = this._renderer.listen('document', 'pointermove', (moveEvent: PointerEvent) => {
        // Throttle updates to animation frames for smoother performance
        if (this._rafId) { return; }
        this._rafId = requestAnimationFrame(() => {
          this._rafId = null;
          this._renderer.addClass(this._el.nativeElement, 'smooth-transition');
          const current = this._cardTransformService.getCurrentTranslations();
          if (!this._clientX) { this._clientX = moveEvent.clientX; }
          if (!this._clientY) { this._clientY = moveEvent.clientY; }
          if ((this._clientX !== moveEvent.clientX) || (this._clientY !== moveEvent.clientY)) {
            this._cardTransformService.updateTranslations({
              wholeCard: {
                x: current.wholeCard.x - this._clientY + moveEvent.clientY,
                y: current.wholeCard.y - this._clientX + moveEvent.clientX,
                z: current.wholeCard.z
              }
            });
            this._clientX = moveEvent.clientX;
            this._clientY = moveEvent.clientY;
          }
        });
      });

      this._activePointerUpListener = this._renderer.listen('document', 'pointerup', () => {
        this._cleanupListeners();
        this._renderer.removeClass(this._el.nativeElement, 'smooth-transition');
        this._clientX = undefined;
        this._clientY = undefined;
        this._scrollY = undefined;
      });
    }
  }

  /** Tear down all active event listeners to prevent accumulation */
  private _cleanupListeners(): void {
    if (this._activeScrollListener) {
      this._activeScrollListener();
      this._activeScrollListener = null;
    }
    if (this._activeMoveListener) {
      this._activeMoveListener();
      this._activeMoveListener = null;
    }
    if (this._activePointerUpListener) {
      this._activePointerUpListener();
      this._activePointerUpListener = null;
    }
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
  }
}
