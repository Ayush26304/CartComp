import { TestBed } from '@angular/core/testing';

import { Userprofile } from './userprofile';

describe('Userprofile', () => {
  let service: Userprofile;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Userprofile);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
