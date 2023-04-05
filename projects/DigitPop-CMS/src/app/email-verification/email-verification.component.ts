import {Component, OnInit} from '@angular/core';
import {DataService} from '../xchane/services/data.service';

@Component({
  selector: 'digit-pop-email-verification',
  templateUrl: './email-verification.component.html',
  styleUrls: ['./email-verification.component.scss']
})
export class EmailVerificationComponent implements OnInit {

  constructor(private data: DataService) {
  }

  ngOnInit(): void {
  }

}
