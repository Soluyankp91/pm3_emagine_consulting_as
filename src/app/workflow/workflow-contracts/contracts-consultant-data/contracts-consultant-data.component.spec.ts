import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractsConsultantDataComponent } from './contracts-consultant-data.component';

describe('ContractsConsultantDataComponent', () => {
  let component: ContractsConsultantDataComponent;
  let fixture: ComponentFixture<ContractsConsultantDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContractsConsultantDataComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContractsConsultantDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
