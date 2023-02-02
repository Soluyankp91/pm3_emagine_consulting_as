import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InsertMergeFieldPopupComponent } from './insert-merge-field-popup.component';

describe('InsertMergeFieldPopupComponent', () => {
  let component: InsertMergeFieldPopupComponent;
  let fixture: ComponentFixture<InsertMergeFieldPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InsertMergeFieldPopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InsertMergeFieldPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
