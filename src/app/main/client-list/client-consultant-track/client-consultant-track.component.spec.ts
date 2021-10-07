import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientConsultantTrackComponent } from './client-consultant-track.component';

describe('ClientConsultantTrackComponent', () => {
  let component: ClientConsultantTrackComponent;
  let fixture: ComponentFixture<ClientConsultantTrackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClientConsultantTrackComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientConsultantTrackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
