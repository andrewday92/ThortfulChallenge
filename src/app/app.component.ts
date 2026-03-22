import { Component, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { CardTransformService } from './shared/card-transform.service';
import { CardFaceService } from './shared/card-face.service';
import { Subject, takeUntil } from 'rxjs';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { occasions, CardFace, CardTranslations, Topic, UnsplashImage, OccasionKey } from '@models';
import { CardComponent } from './card/card.component';
import { AsyncPipe, KeyValuePipe, NgOptimizedImage } from '@angular/common';
import { BrowserStorageService, StorageTypes } from './core/services/browser-storage.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CardComponent,
    AsyncPipe,
    KeyValuePipe,
    NgOptimizedImage
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  protected _cardFaceHistory: Array<CardFace> = [];
  protected counter: number = 50;
  private _destroy$: Subject<void> = new Subject();
  public wholeCardX: number = 0;
  public wholeCardY: number = 0;
  public wholeCardZ: number = 0;
  public isOpen: boolean = false;
  public topics$ = this._cardFaceService.getTopics();
  public occasions = occasions;
  loading = false;

  public searchForm = new FormGroup({
    topics: new FormControl('people'),
    query: new FormControl('New Job')
  });

  public cardActionsForm = new FormGroup({
    occasions: new FormControl<OccasionKey>('newJob'),
    salutation: new FormControl(occasions.newJob.salutation[0], [Validators.maxLength(20)]),
    cardMessage: new FormControl(occasions.newJob.cardMessage, [Validators.maxLength(50)]),
    signOff: new FormControl(occasions.newJob.signOff, [Validators.maxLength(30)])
  });

  protected isSidebarCollapsed: boolean = (window.innerWidth < 600);
  protected salutation: string = this.cardActionsForm.controls.salutation.value ?? '';
  protected cardMessage: string = this.cardActionsForm.controls.cardMessage.value ?? '';
  protected signOff: string = this.cardActionsForm.controls.signOff.value ?? '';

  constructor(
    private _cardTransformService: CardTransformService,
    private _cardFaceService: CardFaceService,
    private _browserStorageService: BrowserStorageService,
    private _renderer: Renderer2
  ) {}

  ngOnInit(): void {
    // Load card face history via the storage service rather than direct localStorage access
    const stored = this._browserStorageService.getItem('cardFaceHistory', StorageTypes.Local);
    if (stored && typeof stored === 'string') {
      this._cardFaceHistory = JSON.parse(stored);
    }

    this._cardTransformService.cardTranslations$
      .pipe(takeUntil(this._destroy$))
      .subscribe((translationData: CardTranslations) => {
        this.wholeCardX = Math.round(translationData.wholeCard.x);
        this.wholeCardY = Math.round(translationData.wholeCard.y);
        this.wholeCardZ = translationData.wholeCard.z;
      });

    this.cardActionsForm.valueChanges
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (message) => {
          this.cardMessage = message.cardMessage ?? '';
          this.salutation = message.salutation ?? '';
          this.signOff = message.signOff ?? '';
        },
        error: (err) => {
          console.error(err);
        }
      });

    this.counter -= this._cardFaceHistory.length;
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  public searchCardFace(): void {
    if (window.innerWidth < 600) {
      this.isSidebarCollapsed = true;
    }
    const searchValue = this.searchForm.value;
    this._cardFaceService.getCardImage(searchValue as Record<string, string | number>)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (image: UnsplashImage) => {
          this.changeCardFace(image.urls.full, image.alt_description);
          this._cardFaceHistory = this._cardFaceService.cardFaceHistory;
        },
        error: (err) => {
          console.error(err);
        }
      });
  }

  public changeCardFace(src: string, alt: string): void {
    this.loading = true;
    this.focus('face');
    const dynamicImageNode = this._renderer.selectRootElement('#dynamicImage', false);
    --this.counter;
    this._renderer.setAttribute(dynamicImageNode, 'src', src);
    this.isSidebarCollapsed = window.innerWidth < 600;

    this._renderer.listen(dynamicImageNode, 'load', () => {
      this._renderer.setAttribute(dynamicImageNode, 'ngSrc', src);
      this._renderer.setAttribute(dynamicImageNode, 'alt', alt);
      this.loading = false;
    });
  }

  public focus(type: 'face' | 'inside'): void {
    this.isOpen = (type === 'inside');
    this._cardTransformService.updateTranslations({
      wholeCard: {
        x: 0,
        y: 0,
        z: this.wholeCardZ
      }
    });
  }

  public transformCard(dimension: 'x' | 'y' | 'z', unit: number = 31): void {
    let newZ = this.wholeCardZ;
    if (dimension === 'z') {
      newZ = this._cardTransformService.clampZoom(this.wholeCardZ - unit);
    }
    this._cardTransformService.updateTranslations({
      wholeCard: {
        x: dimension === 'x' ? this.wholeCardX - unit : this.wholeCardX,
        y: dimension === 'y' ? this.wholeCardY - unit : this.wholeCardY,
        z: dimension === 'z' ? newZ : this.wholeCardZ,
      }
    });
  }

  protected suggestByOccasion(): void {
    const occasion = this.cardActionsForm.controls.occasions.value as OccasionKey;
    const occasionData = occasions[occasion];
    this.cardActionsForm.controls.salutation.setValue(
      occasionData.salutation[Math.floor(Math.random() * occasionData.salutation.length)]
    );
    this.cardActionsForm.controls.cardMessage.setValue(occasionData.cardMessage);
    this.cardActionsForm.controls.signOff.setValue(occasionData.signOff);
    this.searchForm.controls.query.setValue(occasionData.title);
  }
}
