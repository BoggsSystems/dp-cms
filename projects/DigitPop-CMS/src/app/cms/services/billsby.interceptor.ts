import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BillsbyService } from '../../shared/services/billsby.service';

@Injectable()
export class BillsbyInterceptor implements HttpInterceptor {
    constructor(private billsbyService: BillsbyService) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const headers = request.headers.set('apikey', environment.billsbyKey);
        const clonedRequest = request.clone({ headers });
        return next.handle(clonedRequest);
    }
}
