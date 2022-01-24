import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientWorkflowTrackComponent } from './client-workflow-track.component';

describe('ClientWorkflowTrackComponent', () => {
  let component: ClientWorkflowTrackComponent;
  let fixture: ComponentFixture<ClientWorkflowTrackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClientWorkflowTrackComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientWorkflowTrackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
