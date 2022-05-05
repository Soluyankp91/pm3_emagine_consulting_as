import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientConsultantsComponent } from './client-consultants.component';

describe('ClientConsultantsComponent', () => {
  let component: ClientConsultantsComponent;
  let fixture: ComponentFixture<ClientConsultantsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClientConsultantsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientConsultantsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
