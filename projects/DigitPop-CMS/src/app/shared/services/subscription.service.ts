import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SubscriptionData } from '../interfaces/subscription-data.json';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class SubscriptionService {
  readonly endpoint = `${environment.apiUrl}/api/subscription`;

  constructor(private http: HttpClient) { }

  createSubscription(subscriptionData: SubscriptionData): Observable<any> {
    return this.http.post<any>(this.endpoint, subscriptionData);
  }
}
