import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientRatesAndFeesComponent } from './client-rates-and-fees.component';

describe('ClientRatesAndFeesComponent', () => {
  let component: ClientRatesAndFeesComponent;
  let fixture: ComponentFixture<ClientRatesAndFeesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClientRatesAndFeesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientRatesAndFeesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
