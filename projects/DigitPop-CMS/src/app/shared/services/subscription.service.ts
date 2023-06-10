import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BusinessUserService } from './accounts/business-user.service';
import { SubscriptionData } from '../interfaces/subscription-data.json';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class SubscriptionService {
  readonly endpoint = `${environment.apiUrl}/api/subscription`;

  constructor(
    private http: HttpClient,
    private businessUser: BusinessUserService
  ) { }

  createSubscription(subscriptionData: SubscriptionData): Observable<any> {
    return this.http.post<any>(this.endpoint, subscriptionData);
  }

  getSubscription(subscriptionId: string): Observable<any> {
    return this.http.get<any>(`${this.endpoint}/${subscriptionId}`);
  }

  downgradeToFreePlan(currentSubscription?: string): Observable<any> {
    if (!currentSubscription) {
      currentSubscription = this.businessUser.currentUserValue?.subscription;
    }

    return this.http.delete<any>(`${this.endpoint}/${currentSubscription}`);
  }

}
