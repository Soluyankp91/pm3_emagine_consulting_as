import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagerSearchComponentComponent } from './manager-search-component.component';

describe('ManagerSearchComponentComponent', () => {
  let component: ManagerSearchComponentComponent;
  let fixture: ComponentFixture<ManagerSearchComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManagerSearchComponentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManagerSearchComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
