import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { authTokenInterceptor } from './auth-token.interceptor';

describe('authTokenInterceptor', () => {
  const auth = {
    isAuthenticated: () => true,
    validAccessToken: jasmine.createSpy().and.returnValue(of('fresh-access-token')),
    refreshSession: jasmine.createSpy().and.returnValue(of('renewed-access-token')),
    handleUnauthorized: jasmine.createSpy()
  };

  let client: HttpClient;
  let http: HttpTestingController;

  beforeEach(() => {
    auth.validAccessToken.calls.reset();
    auth.refreshSession.calls.reset();
    auth.handleUnauthorized.calls.reset();
    TestBed.configureTestingModule({ providers: [
      provideZonelessChangeDetection(),
      provideHttpClient(withInterceptors([authTokenInterceptor])),
      provideHttpClientTesting(),
      { provide: AuthService, useValue: auth }
    ] });
    client = TestBed.inject(HttpClient);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('obtains a valid token before sending a protected request', () => {
    client.get('/api/dashboard/resumen').subscribe();
    const request = http.expectOne('/api/dashboard/resumen');
    expect(auth.validAccessToken).toHaveBeenCalledTimes(1);
    expect(request.request.headers.get('Authorization')).toBe('Bearer fresh-access-token');
    request.flush({});
  });

  it('does not add authorization to login', () => {
    client.post('/api/auth/login', {}).subscribe();
    const request = http.expectOne('/api/auth/login');
    expect(auth.validAccessToken).not.toHaveBeenCalled();
    expect(request.request.headers.has('Authorization')).toBeFalse();
    request.flush({});
  });
});
