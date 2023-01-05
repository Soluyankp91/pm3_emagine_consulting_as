import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractsSyncDataComponent } from './contracts-sync-data.component';

describe('ContractsSyncDataComponent', () => {
  let component: ContractsSyncDataComponent;
  let fixture: ComponentFixture<ContractsSyncDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContractsSyncDataComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContractsSyncDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
