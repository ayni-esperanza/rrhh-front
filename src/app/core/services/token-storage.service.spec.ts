import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TokenStorageService } from './token-storage.service';

describe('TokenStorageService', () => {
  let service: TokenStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    service = TestBed.inject(TokenStorageService);
    localStorage.clear();
  });

  afterEach(() => localStorage.clear());

  it('keeps an expired access token when the refresh token is still active', () => {
    localStorage.setItem('rrhh_token', jwt(Math.floor(Date.now() / 1000) - 60));
    localStorage.setItem('rrhh_refresh_token', jwt(Math.floor(Date.now() / 1000) + 3600));
    localStorage.setItem('rrhh_user', JSON.stringify({ id: '1', name: 'Admin', email: 'admin@test.pe', role: 'admin', permissions: [] }));

    const state = service.getState();
    expect(state.token).not.toBeNull();
    expect(state.refreshToken).not.toBeNull();
    expect(service.isTokenExpiring(state.token)).toBeTrue();
  });

  function jwt(exp: number): string {
    const encode = (value: object) => btoa(JSON.stringify(value)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ exp })}.signature`;
  }
});
