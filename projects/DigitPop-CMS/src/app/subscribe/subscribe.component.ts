import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { AuthenticationService } from '../shared/services/auth-service.service';
import { SubscriptionService } from '../shared/services/subscription.service';
import { MatDialog } from '@angular/material/dialog';
import { VisitorPopupComponent } from '../visitor-popup/visitor-popup.component';


@Component({
  selector: 'digit-pop-subscribe',
  templateUrl: './subscribe.component.html',
  styleUrls: ['./subscribe.component.scss']
})
  
export class SubscribeComponent implements OnInit {

  popupOpened = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private subscriptionService: SubscriptionService,
    private auth: AuthenticationService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    const cid = this.route.snapshot.queryParamMap.get('cid');
    const sid = this.route.snapshot.queryParamMap.get('sid');
    
    if (!this.auth.currentUserValue) {
      return this.redirectToHomePopup(cid, sid);
    }

    return false;
  }

  createSubscription = (userId: string) => {
    this.subscriptionService.createSubscription({
      user: userId,
      plan: 'starter',
      subscriptionDate: new Date(),
      renewalDate: new Date(new Date().getTime() + (30 * 24 * 60 * 60 * 1000)) // 30 days from now
    }).subscribe(response => {
      // console.log(response);
      // this.dialogRef.close();
      // this.router.navigate(['/cms/dashboard']);
    });
  }

  openVisitorPopup = (cid: string, sid: string) => {
    if (this.popupOpened) { return; }
    this.popupOpened = true;
    const dialogRef = this.dialog.open(VisitorPopupComponent, {
      maxWidth: '90%',
      data: {
        source: 'subscribe',
        cid: cid,
        sid: sid
      }, panelClass: 'dpop-modal'
    });

    dialogRef.afterClosed().subscribe(() => {
      this.popupOpened = false;
    });
  }

  redirectToHomePopup = (cid: string, sid: string) => {
    const navigationExtras: NavigationExtras = {
      state: {
        test: 'yes',
        cid: cid,
        sid: sid
      },
    };

    return this.router.navigate(['/home'], navigationExtras);
  }

}
