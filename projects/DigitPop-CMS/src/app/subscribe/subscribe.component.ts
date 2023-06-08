import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';

@Component({
  selector: 'digit-pop-subscribe',
  templateUrl: './subscribe.component.html',
  styleUrls: ['./subscribe.component.scss']
})

export class SubscribeComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private router: Router,
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
