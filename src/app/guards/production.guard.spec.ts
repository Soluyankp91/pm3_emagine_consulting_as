import { TestBed } from '@angular/core/testing';

import { ProductionGuard } from './production.guard';

describe('ProductionGuard', () => {
  let guard: ProductionGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(ProductionGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
