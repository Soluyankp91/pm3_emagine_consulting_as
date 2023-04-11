import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalculatedMarginComponent } from './calculated-margin.component';

describe('CalculatedMarginComponent', () => {
  let component: CalculatedMarginComponent;
  let fixture: ComponentFixture<CalculatedMarginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CalculatedMarginComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalculatedMarginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
