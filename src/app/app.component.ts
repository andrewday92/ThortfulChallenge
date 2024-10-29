import { Component, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { CardTransformService } from './shared/card-transform.service';
import { CardFaceService } from './shared/card-face.service';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { occasions, CardFace, cardTranslations } from '@models';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit , OnDestroy{
  protected _cardFaceHistory: Array<CardFace> = JSON.parse(localStorage.getItem('cardFaceHistory') ?? '[]');
  protected counter: number = 50;
  private _destroy$: Subject<void> = new Subject();
  public wholeCardX: number = 0;
  public wholeCardY: number = 0;
  public wholeCardZ: number = 0;
  public isOpen: boolean = false;
  public topics: BehaviorSubject<[{title: string, slug: string}] | undefined> = new BehaviorSubject<[{title: string, slug: string}] | undefined>(undefined);
  public occasions: BehaviorSubject<object | undefined> = new BehaviorSubject<object | undefined>(occasions);
  protected image = new Image();
  loading = false;
  public searchForm: FormGroup = new FormGroup({
    topics: new FormControl('people'),
    query: new FormControl('New Job')
  });
  public cardActionsForm: FormGroup = new FormGroup({
    occasions: new FormControl(Object.keys(occasions)[0]),
    salutation: new FormControl(occasions.newJob.salutation[0], [Validators.maxLength(20)]),
    cardMessage: new FormControl(occasions.newJob.cardMessage, [Validators.maxLength(50)]),
    signOff: new FormControl(occasions.newJob.signOff, [Validators.maxLength(30)])
  })
  protected isSidebarCollapsed: boolean = (window.innerWidth < 600);
  protected salutation: string = this.cardActionsForm.controls['salutation'].value;
  protected cardMessage: string = this.cardActionsForm.controls['cardMessage'].value;
  protected signOff: string = this.cardActionsForm.controls['signOff'].value;
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
    this.topics = this._cardFaceService.getTopics() as BehaviorSubject<[{title: string, slug: string}] | undefined>;
    this.cardActionsForm
      .valueChanges.pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (message)=> {
          this.cardMessage = message.cardMessage;
          this.salutation = message.salutation;
          this.signOff = message.signOff;
        },
        error: (err) => {
          console.error(err)
        }
      });
    this.counter -= this._cardFaceHistory.length;

  }
  ngOnDestroy(): void {
      this._destroy$.next();
  }

  public toggleCard(){
    this.isOpen = !this.isOpen;
  }

  public searchCardFace(){
    if(window.innerWidth < 600){
      this.isSidebarCollapsed = true;
    }
    let searchValue = this.searchForm.value;
    this._cardFaceService.getCardImage(searchValue)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (images)=> {
          this.changeCardFace(images.urls.full, images.alt_description);
          this._cardFaceHistory = this._cardFaceService.cardFaceHistory;
        },
        error:  (err) => {
          console.error(err)
        }
      });
  }

  public changeCardFace(src: any, alt: any): void {
    this.loading = true;
    this.focus('face');
    const dynamicImageNode = this._renderer.selectRootElement('#dynamicImage', false);
    --this.counter;
    this._renderer.setAttribute(dynamicImageNode, 'src', src);
    this.isSidebarCollapsed = window.innerWidth < 600;

    this._renderer.listen(dynamicImageNode, 'load', ()=> {
      this._renderer.setAttribute(dynamicImageNode, 'ngSrc', src);
      this._renderer.setAttribute(dynamicImageNode, 'alt', alt);
      this.loading = false;
    })
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

  public transformCard(dimension: 'x' | 'y' | 'z', unit: number = 31): void{
    let boundedZoom: number = this.wholeCardZ - unit;
    if(dimension === 'z'){
      boundedZoom = boundedZoom > 31 ? 31 : boundedZoom < -51 ? -51 : boundedZoom;
    }
    this._cardTransformService.cardTranslations$.next({
      wholeCard: {
        x: dimension === 'x' ? this.wholeCardX - unit : this.wholeCardX,
        y: dimension === 'y' ? this.wholeCardY - unit : this.wholeCardY,
        z: dimension === 'z' ? boundedZoom : this.wholeCardZ,
      }
    });
  }

  protected suggestByOccasion(){
    let occasion: 'newJob' | 'birthday' | 'funeral' | 'wedding';
    occasion = this.cardActionsForm.controls['occasions'].value;
    let occasionData = occasions[occasion];
    this.cardActionsForm.controls['salutation'].setValue(occasionData.salutation[Math.floor(Math.random() * occasionData.salutation.length)]);
    this.cardActionsForm.controls['cardMessage'].setValue(occasionData.cardMessage);
    this.cardActionsForm.controls['signOff'].setValue(occasionData.signOff);
    this.searchForm.controls['query'].setValue(occasionData.title);
  }
}
