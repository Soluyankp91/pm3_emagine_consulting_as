import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SourcingShortcutComponent } from './sourcing-shortcut.component';

describe('SourcingShortcutComponent', () => {
  let component: SourcingShortcutComponent;
  let fixture: ComponentFixture<SourcingShortcutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SourcingShortcutComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SourcingShortcutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
