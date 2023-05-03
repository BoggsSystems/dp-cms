import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthenticationService } from '../shared/services/auth-service.service';
import { SubscriptionService } from '../shared/services/subscription.service';

@Component({
  selector: 'digit-pop-subscribe',
  templateUrl: './subscribe.component.html',
  styleUrls: ['./subscribe.component.scss']
})
  
export class SubscribeComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private subscriptionService: SubscriptionService,
    private auth: AuthenticationService,
  ) { }

  ngOnInit(): void {
    const sid = this.route.snapshot.queryParamMap.get('sid');
    const cid = this.route.snapshot.queryParamMap.get('cid');
    
    // console.log(this.auth.currentUserValue);
    console.log(sid, cid);
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

}
