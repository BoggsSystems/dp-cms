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

    return this.redirectToHome(cid, sid);
  }

  redirectToHome = (cid: string, sid: string) => {
    const navigationExtras: NavigationExtras = {
      state: {
        cid: cid,
        sid: sid
      },
    };

    return this.router.navigate(['/signup'], navigationExtras);
  }

}
