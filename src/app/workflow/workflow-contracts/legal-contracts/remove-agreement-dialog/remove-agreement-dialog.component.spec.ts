import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RemoveAgreementDialogComponent } from './remove-agreement-dialog.component';

describe('RemoveAgreementDialogComponent', () => {
  let component: RemoveAgreementDialogComponent;
  let fixture: ComponentFixture<RemoveAgreementDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RemoveAgreementDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RemoveAgreementDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
