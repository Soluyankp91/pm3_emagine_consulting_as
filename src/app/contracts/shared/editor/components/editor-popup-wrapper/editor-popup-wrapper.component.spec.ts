import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditorPopupWrapperComponent } from './editor-popup-wrapper.component';

describe('EditorPopupWrapperComponent', () => {
  let component: EditorPopupWrapperComponent;
  let fixture: ComponentFixture<EditorPopupWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ EditorPopupWrapperComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditorPopupWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
