import { Component, OnInit } from '@angular/core';
import { BillsbyService } from '../shared/services/billsby.service';
import { Plan } from '../shared/interfaces/plan.json';
import {VisitorPopupComponent} from '../visitor-popup/visitor-popup.component';
import {MatDialog} from '@angular/material/dialog';

@Component({
  selector: 'digit-pop-subscription-plans',
  templateUrl: './subscription-plans.component.html',
  styleUrls: ['./subscription-plans.component.scss']
})

export class SubscriptionPlansComponent implements OnInit {

  plans: Plan[];
  popupOpened = false;

  constructor(private billsByService: BillsbyService, private dialog: MatDialog) {
    this.billsByService.getProductPlans().subscribe((res: Plan[]) => {
      this.plans = res;
    });
  }

  ngOnInit(): void {}

  removeCurrencyChar(formattedPrice: string): string {
    const newString = formattedPrice.substring(1);
    return newString;
  }

  openVisitorPopup = () => {
    if (this.popupOpened) { return; }
    this.popupOpened = true;
    const dialogRef = this.dialog.open(VisitorPopupComponent, {
      maxWidth: '90%',
      data: {
        source: 'plans'
      }, panelClass: 'dpop-modal'
    });

    dialogRef.afterClosed().subscribe(() => {
      this.popupOpened = false;
    });
  }

}
