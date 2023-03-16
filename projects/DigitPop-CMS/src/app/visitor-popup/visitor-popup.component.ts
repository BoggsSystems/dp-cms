import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'digit-pop-visitor-popup',
  templateUrl: './visitor-popup.component.html',
  styleUrls: ['./visitor-popup.component.scss']
})
export class VisitorPopupComponent implements OnInit {
  campaignId: string;
  xchaneUserId: string;
  projectId: string;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { campaignId: string, projectId: string }) {
  }

  ngOnInit(): void {
    if (this.data) {
      this.campaignId = this.data.campaignId;
      this.projectId = this.data.projectId;
    }
  }

}
