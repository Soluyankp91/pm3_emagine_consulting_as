import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignersTableComponent } from './signers-table.component';

describe('SignersTableComponent', () => {
  let component: SignersTableComponent;
  let fixture: ComponentFixture<SignersTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SignersTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignersTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
