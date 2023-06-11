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

  constructor(public dialogRef: MatDialogRef<PreviewComponent>, @Inject(MAT_DIALOG_DATA) data: any) {
    this.iFrameSrc = `${environment.playerUrl}/ad/${data.id}`;
  }

  ngOnInit(): void {
  }
}
