import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'digit-pop-visitor-popup',
  templateUrl: './visitor-popup.component.html',
  styleUrls: ['./visitor-popup.component.scss']
})

export class VisitorPopupComponent implements OnInit {

  source: string;
  campaignId: string;
  xchaneUserId: string;
  projectId: string;
  templateAction = 'Signup/login,';
  templateReason: string;
  templateBenefit: string;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { source: string, campaignId: string, projectId: string }) {
    const { source, campaignId, projectId } = this.data || {};

    this.source = source;
    this.campaignId = campaignId;
    this.projectId = projectId;
  }

  ngOnInit(): void {

    if (this.source === 'plans') {
      this.templateReason = 'to activate';
      this.templateBenefit = 'your subscription';
    } else {
      this.templateReason = 'to save';
      this.templateBenefit = 'your points';
    }

  }

}
