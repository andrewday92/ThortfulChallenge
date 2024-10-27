import { occasions } from './shared/models/occasions.model';
import { Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { CardTransformService } from './shared/card-transform.service';
import { CardFaceService } from './shared/card-face.service';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { cardTranslations } from '@models';
import { BrowserStorageService } from './core/services/local-storage.service';

export type imageData = {
  url: string,
  alt: string
}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit , OnDestroy{
  @ViewChild('salutationEl') salutationEl!: ElementRef;
  @ViewChild('cardMessageEl') cardMessageEl!: ElementRef;
  @ViewChild('signOffEl') signOffEl!: ElementRef;
  protected _cardFaceHistory: Array<{src: string, alt: string}> = [];
  protected counter: number = 50;
  private _destroy$: Subject<void> = new Subject();
  public wholeCardX: number = 0;
  public wholeCardY: number = 0;
  public wholeCardZ: number = 0;
  public isOpen: boolean = false;
  public topics: BehaviorSubject<[{title: string, slug: string}] | undefined> = new BehaviorSubject<[{title: string, slug: string}] | undefined>(undefined);
  public occasions: BehaviorSubject<object | undefined> = new BehaviorSubject<object | undefined>(occasions);
  title = 'client';
  protected image = new Image();
  loading = false;
  public searchForm: FormGroup = new FormGroup({
    topics: new FormControl(''),
    query: new FormControl('')
  });
  public cardActionsForm: FormGroup = new FormGroup({
    occasions: new FormControl(Object.keys(occasions)[0]),
    salutation: new FormControl(occasions.newJob.salutation[0], [Validators.maxLength(20)]),
    cardMessage: new FormControl(occasions.newJob.cardMessage),
    signOff: new FormControl(occasions.newJob.signOff)
  })
  protected isSidebarCollapsed = (window.innerWidth < 600);
  protected salutation: string = this.cardActionsForm.controls['salutation'].value;
  protected cardMessage: string = this.cardActionsForm.controls['cardMessage'].value;
  protected signOff: string= this.cardActionsForm.controls['signOff'].value;
  constructor(private _cardTransformService: CardTransformService, private _cardFaceService: CardFaceService, private _renderer: Renderer2, private _localStorageService: BrowserStorageService) {}

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
      .subscribe((message)=> {
        this.cardMessage = message.cardMessage;
        this.salutation = message.salutation;
        this.signOff = message.signOff;
      });
    this._cardFaceHistory = JSON.parse(localStorage.getItem('cardFaceHistory') ?? '[]');
    this.counter -= this._cardFaceHistory.length
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
      .subscribe((images)=> {
        this.loading = true;
        this.image.src = images.urls.full;
        this.image.alt = images.alt_description;
        this.image.id = 'dynamicImage';
        this.image.onload = () => {
          --this.counter;
          let dynamicImageNode = document.getElementById('dynamicImage');
          if (!dynamicImageNode) {
            document.getElementById('imageContainer')?.append(this.image);
          } else {
            dynamicImageNode?.replaceWith(this.image);
          }
          this._cardFaceHistory = this._cardFaceService.cardFaceHistory;
          this.loading = false;
        }
      });
  }

  public changeCardFace(face: any): void {
    this.loading = true;
    this.focus('face');
    this.image.src = face.src;
    this.image.alt = face.alt;
    this.image.id = 'dynamicImage';
    this.image.onload = () => {
      let dynamicImageNode = document.getElementById('dynamicImage');
      if (!dynamicImageNode) {
        document.getElementById('imageContainer')?.append(this.image);
      } else {
        dynamicImageNode?.replaceWith(this.image);
      }
      if(window.innerWidth < 600){
        this.isSidebarCollapsed = !this.isSidebarCollapsed;

      }
      this.isOpen = false;
      this._cardFaceHistory = this._cardFaceService.cardFaceHistory;

      this.loading = false;
    }
  }

  public focus(type: 'face' | 'inside'){
    this.isOpen = (type === 'inside');
    this._cardTransformService.cardTranslations$.next({
      wholeCard: {
        x: 0,
        y: -20,
        z: this.wholeCardZ
      }
    });
  }

  public editContent(event: Event, type: 'salutation' | 'cardMessage' | 'signOff'){
    event.preventDefault();
    this._renderer.selectRootElement(`#${type}Field`).focus();
  }

  public transformCard(dimension: 'x' | 'y' | 'z', unit: number = 30): void{
    let boundedZoom: number = this.wholeCardZ - unit;
    if(dimension === 'z'){
      boundedZoom = boundedZoom > 30 ? 30 : boundedZoom < -50 ? -50 : boundedZoom;
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
  }
}
