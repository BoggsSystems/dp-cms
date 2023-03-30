import {Component, EventEmitter, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {environment} from 'projects/DigitPop-CMS/src/environments/environment';

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
    const uuid = sessionStorage.getItem('uuid');

    console.log(data);
    this.iFrameSrc = `${environment.playerUrl}/ad/${data.id}/preview/true/userId/${data.userId !== false ? data.userId : uuid}`;
    this.campaignId = data.campaignId ? data.campaignId : false;
    this.categoryId = data.categoryId ? data.categoryId : false;
    this.videoTour = 'tour' in data ?? data.tour;
    this.isPreview = data.isPreview ? data.isPreview : false;
    addEventListener('message', (event) => {
      this.sendMessage(event);
    });
  }

  ngOnInit(): void {
  }

  sendMessage = (event: MessageEvent, message: any = {
    onPremise: true,
    campaignId: this.campaignId,
    categoryId: this.categoryId,
    isPreview: this.isPreview,
    tour: this.videoTour
  }) => {
    const targetOrigin = event ? event.origin : '*';
    const iframe = document.querySelector('iframe.iframe') as HTMLIFrameElement;

    if (event.data === 'exit') {
      return this.onAdd.emit();
    }
    iframe.contentWindow.postMessage(message, targetOrigin);
  }
}
