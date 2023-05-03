import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

interface Data {
  source: string,
  campaignId: string,
  projectId: string,
  cid: string,
  sid: string
}

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
  cid: string;
  sid: string;
  templateAction = 'Signup/login,';
  templateReason: string;
  templateBenefit: string;

  constructor(@Inject(MAT_DIALOG_DATA) public data: Data) {
    const { source, campaignId, projectId, cid, sid } = this.data || {};

    this.source = source;
    this.campaignId = campaignId;
    this.projectId = projectId;

    if (this.source === 'subscribe') {
      this.cid = cid;
      this.sid = sid;
    }
  }

  ngOnInit(): void {

    if (this.source === 'plans' || this.source === 'subscribe') {
      this.templateReason = 'to activate';
      this.templateBenefit = 'your subscription';
    } else {
      this.templateReason = 'to save';
      this.templateBenefit = 'your points';
    }

  }

}
