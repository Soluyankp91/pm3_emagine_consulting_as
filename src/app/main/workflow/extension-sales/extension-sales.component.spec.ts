import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtensionSalesComponent } from './extension-sales.component';

describe('ExtensionSalesComponent', () => {
  let component: ExtensionSalesComponent;
  let fixture: ComponentFixture<ExtensionSalesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExtensionSalesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExtensionSalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
