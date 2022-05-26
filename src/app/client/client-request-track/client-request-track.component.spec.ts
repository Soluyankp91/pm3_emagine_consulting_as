import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientRequestTrackComponent } from './client-request-track.component';

describe('ClientRequestTrackComponent', () => {
  let component: ClientRequestTrackComponent;
  let fixture: ComponentFixture<ClientRequestTrackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClientRequestTrackComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientRequestTrackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
