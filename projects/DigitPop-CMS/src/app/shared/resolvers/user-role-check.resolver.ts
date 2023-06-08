import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

import { SubscriptionService } from '../services/subscription.service';
import { BusinessUserService } from '../services/accounts/business-user.service';

@Injectable({
  providedIn: 'root'
})
export class UserRoleCheckResolver implements Resolve<boolean> {
  cid = '';
  sid = '';

  constructor(
    private router: Router,
    private subscriptionService: SubscriptionService,
    private businessUser: BusinessUserService
  ) { }

  resolve(route: ActivatedRouteSnapshot): Observable<boolean> {
    this.extractNavigationExtras();

    if (this.businessUser.currentUserValue?._id) {
      const user =
        localStorage.getItem('currentuser') ||
        sessionStorage.getItem('currentuser');

      if (user && this.cid && this.sid) {
        const userId = JSON.parse(user)._id;
        return this.createSubscription(userId, this.cid, this.sid).pipe(
          switchMap(() => of(false)),
          tap(() => this.router.navigate(['/cms/dashboard']))
        );
      } else {
        this.router.navigate(['/cms/dashboard']);
        return of(false);
      }
    } else {
      return of(true);
    }
  }

  private extractNavigationExtras = () => {
    const nav = this.router.getCurrentNavigation();
    const { cid, sid } = nav?.extras?.state || {};

    if (cid && sid) {
      this.cid = cid;
      this.sid = sid;
    }
  };

  private createSubscription = (userId: string, cid?: string, sid?: string): Observable<void> => {
    const data: any = {};
    data.user = userId;
    data.subscriptionDate = new Date();
    data.renewalDate = new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000);

    if (cid && sid) {
      data.billsByCid = cid;
      data.billsBySid = sid;
    } else {
      data.plan = 'free';
    }

    return this.subscriptionService.createSubscription(data);
  };
}
