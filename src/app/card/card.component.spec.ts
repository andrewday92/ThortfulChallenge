import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CardComponent } from './card.component';
import { By } from '@angular/platform-browser';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('CardComponent', () => {
  let component: CardComponent;
  let fixture: ComponentFixture<CardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CardComponent],
      schemas: [NO_ERRORS_SCHEMA]
    });
    fixture = TestBed.createComponent(CardComponent);
    component = fixture.componentInstance;

    // Set required inputs
    fixture.componentRef.setInput('isSidebarCollapsed', false);
    fixture.componentRef.setInput('salutation', 'Dear Andrew');
    fixture.componentRef.setInput('cardMessage', 'Test message');
    fixture.componentRef.setInput('signOff', 'Yours, Test');

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

  it('should emit focusCard when focus is called', () => {
    spyOn(component.focusCard, 'emit');
    component.focus('face');
    expect(component.focusCard.emit).toHaveBeenCalledWith('face');
  });

  it('should generate correct cardTransform string', () => {
    fixture.componentRef.setInput('wholeCardX', 10);
    fixture.componentRef.setInput('wholeCardY', 20);
    fixture.componentRef.setInput('wholeCardZ', 5);
    expect(component.cardTransform).toBe('translateZ(5em) rotateX(10deg) rotateY(20deg)');
  });

  it('should clean up media query listener on destroy', () => {
    spyOn(component['reducedMotionMediaQuery'], 'removeEventListener');
    component.ngOnDestroy();
    expect(component['reducedMotionMediaQuery'].removeEventListener).toHaveBeenCalledWith('change', jasmine.any(Function));
  });
});
