import { Component, EventEmitter, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { environment } from 'projects/DigitPop-CMS/src/environments/environment';

@Component({
  selector: 'digit-pop-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss'],
})

export class PreviewComponent implements OnInit {
  iFrameSrc: any;
  campaignId: string | boolean;
  categoryId: string | boolean;
  videoTour = true;
  isPreview: boolean;
  onAdd = new EventEmitter();

  constructor(public dialogRef: MatDialogRef<PreviewComponent>, @Inject(MAT_DIALOG_DATA) data: any) {
    this.isPreview = data.isPreview ? data.isPreview : false;
    const uuid = sessionStorage.getItem('uuid');
    // this.iFrameSrc = `${environment.playerUrl}/ad/${data.id}/preview/${this.isPreview}/userId/${data.userId !== false ? data.userId : uuid}`;
    this.iFrameSrc = `${environment.playerUrl}/ad/${data.id}`;

    this.sendMessage(environment.playerUrl, 'parentComponentLoaded');

    addEventListener('message', (event) => {
      if (event.data.action === 'getCampaignId') {
        this.sendMessage(event, {
          onPremise: true,
          campaignId: data.campaignId ? data.campaignId : false,
          categoryId: data.categoryId ? data.categoryId : false,
          isPreview: data.isPreview ? data.isPreview : false,
          tour: 'tour' in data ?? data.tour
        });
      }
    });
  }

  ngOnInit(): void {
  }

  sendMessage = (target: MessageEvent<any> | string, message: any): void => {
    let targetOrigin: string;
    const iframe = document.getElementById('player') as HTMLIFrameElement;

    if (typeof target === 'string') {
      targetOrigin = target;
    } else if (target instanceof MessageEvent) {
      targetOrigin = target.origin;

      if (target.data === 'exit') {
        this.onAdd.emit();
        return;
      }
    } else {
      targetOrigin = '*';
      throw new Error('Invalid event type');
    }

    iframe.contentWindow.postMessage(message, targetOrigin);
  };
}
