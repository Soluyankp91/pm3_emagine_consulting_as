import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowExtensionComponent } from './workflow-extension.component';

describe('WorkflowExtensionComponent', () => {
  let component: WorkflowExtensionComponent;
  let fixture: ComponentFixture<WorkflowExtensionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkflowExtensionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkflowExtensionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
