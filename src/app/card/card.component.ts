import { Component, OnInit, Renderer2, input, output } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { DraggableDirective } from '../shared/draggable.directive';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [NgOptimizedImage, DraggableDirective],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss'
})
export class CardComponent implements OnInit {
  protected reducedMotionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  protected reducedMotion: boolean = this.reducedMotionMediaQuery.matches;

  isSidebarCollapsed = input.required<boolean>();
  isSidebarCollapsedEmitter = output<boolean>();

  wholeCardX = input<number>(0);
  wholeCardY = input<number>(0);
  wholeCardZ = input<number>(0);

  salutation = input.required<string>();
  cardMessage = input.required<string>();
  signOff = input.required<string>();

  isOpen = input<boolean>(false);
  loading = input<boolean>(false);

  /** Emits the card focus type so the parent can handle the transform service call */
  focusCard = output<'face' | 'inside'>();

  constructor(private _renderer: Renderer2) {}

  ngOnInit(): void {
    this.reducedMotionMediaQuery.addEventListener('change', () => {
      this.reducedMotion = this.reducedMotionMediaQuery.matches;
    });
  }

  get cardTransform(): string {
    return `translateZ(${this.wholeCardZ() || 0}em) rotateX(${this.wholeCardX() || 0}deg) rotateY(${this.wholeCardY() || 0}deg)`;
  }

  public editContent(event: MouseEvent, type: 'salutation' | 'cardMessage' | 'signOff'): void {
    event.preventDefault();
    this.isSidebarCollapsedEmitter.emit(false);
    this._renderer.selectRootElement(`#${type}Field`).focus();
  }

  public focus(type: 'face' | 'inside'): void {
    this.focusCard.emit(type);
  }
}
