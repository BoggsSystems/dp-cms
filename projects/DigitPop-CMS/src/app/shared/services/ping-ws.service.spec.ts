import { TestBed } from '@angular/core/testing';

import { PingWsService } from './ping-ws.service';

describe('PingWsService', () => {
  let service: PingWsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PingWsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
