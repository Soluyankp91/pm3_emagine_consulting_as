import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagerSearchComponent } from './manager-search.component';

describe('ManagerSearchComponentComponent', () => {
  let component: ManagerSearchComponent;
  let fixture: ComponentFixture<ManagerSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManagerSearchComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManagerSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
