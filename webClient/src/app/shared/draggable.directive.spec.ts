import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { Component, Renderer2, ElementRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { DraggableDirective } from './draggable.directive';
import { CardTransformService } from './card-transform.service';
import { cardTranslations } from '@models';
import { Subject } from 'rxjs';

// Mock Component for testing the directive
@Component({
  template: `<div appDraggable [reducedMotion]="true"></div>`
})
class TestComponent {}

describe('DraggableDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let renderer: Renderer2;
  let elementRef: ElementRef;
  let cardTransformService: CardTransformService;
  let directive: DraggableDirective;
  let nativeElement: any;

  beforeEach(() => {
    const mockCardTransformService = {
      cardTranslations$: new Subject<cardTranslations>()
    };

    TestBed.configureTestingModule({
      declarations: [TestComponent, DraggableDirective],
      providers: [
        Renderer2,
        { provide: CardTransformService, useValue: mockCardTransformService },
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });

    fixture = TestBed.createComponent(TestComponent);
    renderer = TestBed.inject(Renderer2);
    cardTransformService = TestBed.inject(CardTransformService);
    nativeElement = fixture.nativeElement.querySelector('div');
    elementRef = new ElementRef(nativeElement);

    directive = new DraggableDirective(renderer, elementRef, cardTransformService);
  });

  it('should create the directive', () => {
    expect(directive).toBeTruthy();
  });
});
