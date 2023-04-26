import {Component, OnInit} from '@angular/core';
import {BillsbyService} from '../shared/services/billsby.service';
import {Plan} from '../shared/interfaces/plan.json';

@Component({
  selector: 'digit-pop-subscription-plans',
  templateUrl: './subscription-plans.component.html',
  styleUrls: ['./subscription-plans.component.scss']
})

export class SubscriptionPlansComponent implements OnInit {

  plans: Plan[];

  constructor(private billsByService: BillsbyService) {
    billsByService.getProductPlans().subscribe((res: Plan[]) => {
      console.log(res);
      this.plans = res;
    });
  }

  ngOnInit(): void {
  }


  // firstName
  // string
  // required
  // The customer's first name
  //
  // lastName
  // string
  // required
  // The customer's last name
  //
  // email
  // string
  // required
  // The customer's email address
  //
  // cycleId
  // int32
  // required
  // The unique identifier of the cycle in Billsby
  //
  // Units
  // int32
  // required
  // The number of units included in the subscription (min. 1)
  //
  // address
  // object
  // required

  subscribeToPlan(planId: string) {

  }

}
