import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { CardTransformService } from './shared/card-transform.service';
import { CardFaceService } from './shared/card-face.service';
import { BehaviorSubject, of } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA, Renderer2, Type } from '@angular/core';
import { By } from '@angular/platform-browser';
import { SharedModule } from './shared/shared.module';
import { CoreModule } from './core/core.module';
import { CardComponent } from './card/card.component';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let cardTransformService: CardTransformService;
  let cardFaceService: CardFaceService;
  let renderer: Renderer2;
  beforeEach(async () => {
    const cardTransformServiceStub = {
      cardTranslations$: new BehaviorSubject({ wholeCard: { x: 0, y: 0, z: 0 } })
    };

    const cardFaceServiceStub = {
      getTopics: () => new BehaviorSubject([{ title: 'People', slug: 'people' }]),
      getCardImage: jasmine.createSpy('getCardImage').and.returnValue(of({ urls: { full: 'test-url' }, alt_description: 'test-alt' })),
      cardFaceHistory: [{src: 'url', srcThumb: 'thumb-url', alt: 'Test Image' }]
    };


    await TestBed.configureTestingModule({
      declarations: [AppComponent, CardComponent],
      imports: [ReactiveFormsModule, SharedModule, CoreModule],
      providers: [
        { provide: CardTransformService, useValue: cardTransformServiceStub },
        { provide: CardFaceService, useValue: cardFaceServiceStub },
        { provide: Renderer2 }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();


  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    cardTransformService = TestBed.inject(CardTransformService);
    cardFaceService = TestBed.inject(CardFaceService);
    renderer = fixture.componentRef.injector.get<Renderer2>(Renderer2 as Type<Renderer2>);
    spyOn(renderer, 'setAttribute').and.callFake((_el: any, _attr: string, _attrValue: string) => {});
    fixture.detectChanges();
  });
  afterEach(() => {
    document.body.removeChild(fixture.debugElement.nativeElement);
  })

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle the sidebar collapse state when button is clicked', () => {
    const button = fixture.debugElement.query(By.css('.btn-action__collapse'));
    expect(component['isSidebarCollapsed']).toBeFalse();

    button.triggerEventHandler('click', null);
    fixture.detectChanges();

    expect(component['isSidebarCollapsed']).toBeTrue();

    button.triggerEventHandler('click', null);
    fixture.detectChanges();

    expect(component['isSidebarCollapsed']).toBeFalse();
  });

  it('should update the card face when searchCardFace is called', () => {
    component.searchCardFace();
    expect(cardFaceService.getCardImage).toHaveBeenCalledWith(component.searchForm.value);
  });

  it('should update the form values when an occasion is selected', () => {
    component.cardActionsForm.controls['occasions'].setValue('newJob');
    component['suggestByOccasion']();

    expect(component.cardActionsForm.controls['salutation'].value).toBeTruthy();
    expect(component.cardActionsForm.controls['cardMessage'].value).toEqual('Congratulations on the new job with us!');
    expect(component.cardActionsForm.controls['signOff'].value).toEqual('Yours Sincerely, Thortful');
  });

  it('should focus on the card face when focus method is called with "face"', () => {
    spyOn(cardTransformService.cardTranslations$, 'next');
    component.focus('face');

    expect(component.isOpen).toBeFalse();
    expect(cardTransformService.cardTranslations$.next).toHaveBeenCalledWith({
      wholeCard: { x: 0, y: 0, z: component.wholeCardZ }
    });
  });

  it('should focus on the inside when focus method is called with "inside"', () => {
    spyOn(cardTransformService.cardTranslations$, 'next');
    component.focus('inside');

    expect(component.isOpen).toBeTrue();
    expect(cardTransformService.cardTranslations$.next).toHaveBeenCalledWith({
      wholeCard: { x: 0, y: 0, z: component.wholeCardZ }
    });
  });

  it('should transform the card when transformCard method is called', () => {
    spyOn(cardTransformService.cardTranslations$, 'next');
    component.transformCard('x', -30);

    expect(cardTransformService.cardTranslations$.next).toHaveBeenCalledWith({
      wholeCard: { x: 30, y: 0, z: 0 }
    });
  });

  it('should reset the searchForm when reset button is clicked', () => {
    const resetButton = fixture.debugElement.query(By.css('.btn-action[aria-label="Reset search topic and query fields to blank"]'));
    spyOn(component.searchForm, 'reset');

    resetButton.triggerEventHandler('click', null);
    expect(component.searchForm.reset).toHaveBeenCalled();
  });
});
