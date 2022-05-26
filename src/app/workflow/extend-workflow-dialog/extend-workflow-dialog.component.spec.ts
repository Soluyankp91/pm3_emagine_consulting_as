import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtendWorkflowDialogComponent } from './extend-workflow-dialog.component';

describe('ExtendWorkflowDialogComponent', () => {
  let component: ExtendWorkflowDialogComponent;
  let fixture: ComponentFixture<ExtendWorkflowDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExtendWorkflowDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExtendWorkflowDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
