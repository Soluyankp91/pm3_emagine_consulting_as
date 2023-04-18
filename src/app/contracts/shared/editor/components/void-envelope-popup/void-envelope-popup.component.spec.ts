import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VoidEnvelopePopupComponent } from './void-envelope-popup.component';

describe('VoidEnvelopePopupComponent', () => {
  let component: VoidEnvelopePopupComponent;
  let fixture: ComponentFixture<VoidEnvelopePopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ VoidEnvelopePopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VoidEnvelopePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
