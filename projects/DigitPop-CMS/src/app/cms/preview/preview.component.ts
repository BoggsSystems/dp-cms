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
  enabledShoppableTour: boolean;
  isPreview: boolean;
  onAdd = new EventEmitter();

  constructor(public dialogRef: MatDialogRef<PreviewComponent>, @Inject(MAT_DIALOG_DATA) data: any) {
    this.iFrameSrc = `${environment.playerUrl}/ad/${data.id}/preview/true/userId/${data.userId !== false ? data.userId : 'false'}`;
    this.campaignId = data.campaignId ? data.campaignId : false;
    this.categoryId = data.categoryId ? data.categoryId : false;
    this.enabledShoppableTour = data.enabledShoppableTour ? data.enabledShoppableTour : false;
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
    toured: this.enabledShoppableTour
  }) => {
    const targetOrigin = event ? event.origin : '*';
    const iframe = document.querySelector('iframe.iframe') as HTMLIFrameElement;

    if (event.data === 'exit') {
      return this.onAdd.emit();
    }
    iframe.contentWindow.postMessage(message, targetOrigin);
  }
}
