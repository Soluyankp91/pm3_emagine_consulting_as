import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LegalContractItemComponent } from './legal-contract-item.component';

describe('LegalContractItemComponent', () => {
  let component: LegalContractItemComponent;
  let fixture: ComponentFixture<LegalContractItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LegalContractItemComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LegalContractItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
