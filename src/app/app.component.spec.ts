import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { CardTransformService } from './shared/card-transform.service';
import { CardFaceService } from './shared/card-face.service';
import { of } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA, Renderer2, Type } from '@angular/core';
import { By } from '@angular/platform-browser';
import { BrowserStorageService } from './core/services/browser-storage.service';
import { UnsplashImage } from '@models';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let cardTransformService: CardTransformService;
  let cardFaceService: CardFaceService;
  let renderer: Renderer2;

  const mockImage: UnsplashImage = {
    urls: { full: 'test-url', thumb: 'test-thumb' },
    alt_description: 'test-alt',
    width: 800,
    height: 600
  };

  beforeEach(async () => {
    const cardTransformServiceStub = {
      cardTranslations$: of({ wholeCard: { x: 0, y: 0, z: 0 } }),
      updateTranslations: jasmine.createSpy('updateTranslations'),
      getCurrentTranslations: jasmine.createSpy('getCurrentTranslations').and.returnValue({ wholeCard: { x: 0, y: 0, z: 0 } }),
      clampZoom: jasmine.createSpy('clampZoom').and.callFake((z: number) => Math.max(-50, Math.min(30, z)))
    };

    const cardFaceServiceStub = {
      getTopics: () => of([{ title: 'People', slug: 'people' }]),
      getCardImage: jasmine.createSpy('getCardImage').and.returnValue(of(mockImage)),
      cardFaceHistory: [{ src: 'url', srcThumb: 'thumb-url', alt: 'Test Image' }]
    };

    const browserStorageServiceStub = {
      getItem: jasmine.createSpy('getItem').and.returnValue(null),
      setItem: jasmine.createSpy('setItem'),
      removeItem: jasmine.createSpy('removeItem')
    };

    await TestBed.configureTestingModule({
      imports: [AppComponent, ReactiveFormsModule],
      providers: [
        { provide: CardTransformService, useValue: cardTransformServiceStub },
        { provide: CardFaceService, useValue: cardFaceServiceStub },
        { provide: BrowserStorageService, useValue: browserStorageServiceStub },
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
    spyOn(renderer, 'setAttribute').and.callFake(() => {});
    fixture.detectChanges();
  });

  afterEach(() => {
    document.body.removeChild(fixture.debugElement.nativeElement);
  });

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
    expect(cardFaceService.getCardImage).toHaveBeenCalledWith(component.searchForm.value as Record<string, string | number>);
  });

  it('should update the form values when an occasion is selected', () => {
    component.cardActionsForm.controls['occasions'].setValue('newJob');
    component['suggestByOccasion']();

    expect(component.cardActionsForm.controls['salutation'].value).toBeTruthy();
    expect(component.cardActionsForm.controls['cardMessage'].value).toEqual('Congratulations on the new job with us!');
    expect(component.cardActionsForm.controls['signOff'].value).toEqual('Yours Sincerely, Thortful');
  });

  it('should focus on the card face when focus method is called with "face"', () => {
    component.focus('face');

    expect(component.isOpen).toBeFalse();
    expect(cardTransformService.updateTranslations).toHaveBeenCalledWith({
      wholeCard: { x: 0, y: 0, z: component.wholeCardZ }
    });
  });

  it('should focus on the inside when focus method is called with "inside"', () => {
    component.focus('inside');

    expect(component.isOpen).toBeTrue();
    expect(cardTransformService.updateTranslations).toHaveBeenCalledWith({
      wholeCard: { x: 0, y: 0, z: component.wholeCardZ }
    });
  });

  it('should transform the card when transformCard method is called', () => {
    component.transformCard('x', -30);

    expect(cardTransformService.updateTranslations).toHaveBeenCalledWith({
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
