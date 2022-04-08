import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddOrEditProjectLineDialogComponent } from './add-or-edit-project-line-dialog.component';

describe('AddOrEditProjectLineDialogComponent', () => {
  let component: AddOrEditProjectLineDialogComponent;
  let fixture: ComponentFixture<AddOrEditProjectLineDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddOrEditProjectLineDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddOrEditProjectLineDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
