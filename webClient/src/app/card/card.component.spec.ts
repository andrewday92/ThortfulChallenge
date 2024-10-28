import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardComponent } from './card.component';
import { By } from '@angular/platform-browser';
import { CardFaceService } from '../shared/card-face.service';
import { CardTransformService } from '../shared/card-transform.service';
import { BehaviorSubject, of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { CoreModule } from '../core/core.module';

describe('CardComponent', () => {
  let component: CardComponent;
  let fixture: ComponentFixture<CardComponent>;

  beforeEach(() => {

    const cardTransformServiceStub = {
      cardTranslations$: new BehaviorSubject({ wholeCard: { x: 0, y: 0, z: 0 } })
    };

    const cardFaceServiceStub = {
      getTopics: () => new BehaviorSubject([{ title: 'People', slug: 'people' }]),
      getCardImage: jasmine.createSpy('getCardImage').and.returnValue(of({ urls: { full: 'test-url' }, alt_description: 'test-alt' })),
      cardFaceHistory: [{src: 'url', srcThumb: 'thumb-url', alt: 'Test Image' }]
    };

    TestBed.configureTestingModule({
      declarations: [CardComponent],
      imports: [CoreModule],
      providers: [
        { provide: CardTransformService, useValue: cardTransformServiceStub },
        { provide: CardFaceService, useValue: cardFaceServiceStub }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
    fixture = TestBed.createComponent(CardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call editContent when a salutation is clicked', () => {
    spyOn(component, 'editContent');
    const salutationField = fixture.debugElement.query(By.css('.salutation'));

    salutationField.triggerEventHandler('click', { preventDefault: () => {} });
    expect(component.editContent).toHaveBeenCalled();
  });
});
