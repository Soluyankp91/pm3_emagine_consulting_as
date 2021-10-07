import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientInvoicingComponent } from './client-invoicing.component';

describe('ClientInvoicingComponent', () => {
  let component: ClientInvoicingComponent;
  let fixture: ComponentFixture<ClientInvoicingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClientInvoicingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientInvoicingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
