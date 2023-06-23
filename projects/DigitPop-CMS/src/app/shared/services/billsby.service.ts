import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { AuthenticationService } from './auth-service.service';
import { environment } from 'projects/DigitPop-CMS/src/environments/environment';
import { Observable } from 'rxjs';

interface Address {
  addressLine1: string;
  addressLine2: string;
  state: string;
  city: string;
  country: string;
  postCode: string;
}

interface cardDetails {
  fullName: string;
  paymentCardToken: string;
  expiryMonth: number;
  expiryYear: number;
  cardType: string;
  last4Digits: string;
}

interface SubscriptionData {
  firstName: string;
  lastName: string;
  email: string;
  cycleId: number;
  Units: number;
  address: Address;
  cardDetails: cardDetails
}

@Injectable({
  providedIn: 'root'
})
export class BillsbyService {
  private readonly billsByUrl = environment.billsbyUrl;
  private readonly billsByKey = environment.billsbyKey;

  constructor(
    private httpClient: HttpClient,
    private authService: AuthenticationService
  ) { }

  getProductPlans(): Observable<any> {
    const productId = '1142';
    return this.httpClient.get(`${this.billsByUrl}/products/${productId}/plans`);
  }

  subscribeToPlan(data: SubscriptionData): Observable<any> {
    const { firstName, lastName, email, cycleId, Units, address, cardDetails } = data;

    const body = {
      firstName,
      lastName,
      email,
      cycleId,
      Units,
      address,
      cardDetails
    };
    return this.httpClient.post(`${this.billsByUrl}/subscriptions`, body);
  }

  getCustomerDetails(cid: any): Observable<any> {
    return this.httpClient.get(`${this.billsByUrl}/customers/${cid}`);
  }

  getSubscriptionDetails(sid?: string): Observable<any> {
    if (!sid) {
      sid = this.authService.currentUserValue.sid;
    }
    return this.httpClient.get(`${this.billsByUrl}/subscriptions/${sid}`);
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
