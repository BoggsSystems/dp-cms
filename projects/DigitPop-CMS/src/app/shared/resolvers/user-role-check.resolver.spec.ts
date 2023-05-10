import { TestBed } from '@angular/core/testing';

import { UserRoleCheckResolver } from './user-role-check.resolver';

describe('UserRoleCheckResolver', () => {
  let resolver: UserRoleCheckResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(UserRoleCheckResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
