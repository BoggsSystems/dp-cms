import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { AuthenticationService } from './auth-service.service';
import { environment } from 'projects/DigitPop-CMS/src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BillsbyService {
  private readonly billsByUrl = environment.billsbyUrl;
  private readonly billsByKey = environment.billsbyKey;

  constructor(
    private httpClient: HttpClient,
    private authService: AuthenticationService
  ) {}

  getProductPlans(): Observable<any> {
    const productId = '5511';
    return this.httpClient.get(`${this.billsByUrl}/products/${productId}/plans`);
  }

  subscribeToPlan(
    planId: string,
    customerId: string,
    quantity: number,
    billingCycleCount: number,
    billingCycleType: string,
    startDate: string,
    couponCode?: string
  ): Observable<any> {
    const body = {
      customerUniqueId: customerId,
      productPlanId: planId,
      quantity,
      billingCycleCount,
      billingCycleType,
      startDate,
      couponCode
    };
    return this.httpClient.post(`${this.billsByUrl}/subscriptions`, body);
  }


  getCustomerDetails(id: any): Observable<any> {
    return this.httpClient.get(`${this.billsByUrl}/customers/${id}`);
  }

  getSubscriptionDetails(): Observable<any> {
    const subscriptionId = '4EDK89XEW7'; // replace with dynamic value if needed
    return this.httpClient.get(`${this.billsByUrl}/subscriptions/${subscriptionId}`);
  }

  cancelSubscription(): Observable<any> {
    const customerId = this.authService.currentUserValue.cid;
    const subscriptionId = this.authService.currentUserValue.sid;
    const params = new HttpParams().set('customerUniqueId', customerId);
    return this.httpClient.delete(`${this.billsByUrl}/subscriptions/${subscriptionId}`, { params });
  }

  pauseSubscription(): Observable<any> {
    const customerId = this.authService.currentUserValue.cid;
    const subscriptionId = this.authService.currentUserValue.sid;
    const body = { pauseSubscription: true, pauseSubscriptionCycleCount: 1 };
    const params = new HttpParams().set('cid', customerId);
    return this.httpClient.put(`${this.billsByUrl}/subscriptions/${subscriptionId}`, body, { params });
  }
}
