import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

import { AuthenticationService } from '../services/auth-service.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(private authenticationService: AuthenticationService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(
            catchError((error) => this.handleHttpError(request, next, error))
        );
    }

    private handleHttpError(request: HttpRequest<any>, next: HttpHandler, error: any): Observable<HttpEvent<any>> {
        if (error.status === 401) {
            return this.authenticationService.refreshToken().pipe(
                switchMap((response: string) => this.handleTokenRefresh(request, next, response)),
                catchError((err) => this.handleTokenRefreshError(err))
            );
        }

        // Handle other error cases
        return throwError(error);
    }

    private handleTokenRefresh(request: HttpRequest<any>, next: HttpHandler, response: string): Observable<HttpEvent<any>> {
        if (response) {
            const updatedRequest = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${response}`,
                },
            });

            return next.handle(updatedRequest); // Retry the request with the updated headers
        } else {
            this.authenticationService.logout(); // Failed to refresh the token, logout the user
            return throwError('Failed to refresh token');
        }
    }

    private handleTokenRefreshError(error: any): Observable<never> {
        this.authenticationService.logout(); // Failed to refresh the token, logout the user
        return throwError('Failed to refresh token');
    }
}
