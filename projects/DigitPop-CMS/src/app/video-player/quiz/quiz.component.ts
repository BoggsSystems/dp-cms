import {
  Component,
  Input,
  OnInit
} from '@angular/core';
import { Campaign } from '../../shared/models/campaign';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { EngagementService } from '../../shared/services/engagement.service';
import { CampaignService } from '../../shared/services/campaign.service';

@Component({
  selector: 'digit-pop-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.scss'],
})

export class QuizComponent implements OnInit {
  @Input() dialog: MatDialogRef<any>;
  @Input() campaignId: any;
  @Input() engagementId: any;
  @Input() isUser: any;
  @Input() uuid: any;
  campaign: Campaign;
  answers: any[];

  constructor(
    private campaignService: CampaignService,
    private engagementService: EngagementService,
  ) {
  }

  ngOnInit(): void {
    if (!this.isUser && this.campaignId) {
      this.getCampaign(this.campaignId);
    }

    if (this.isUser && this.campaignId != null) {
      this.getCampaign(this.campaignId);
    }
  }

  getCampaign(campaignId: string) {
    if (campaignId != null) {
      this.campaignService.getCampaign(campaignId).subscribe((res) => {
        this.campaign = res as Campaign;
        this.buildAnswerArray();
      }, (err) => {
        console.error('Error retrieving ad');
      });
    }
  }

  buildAnswerArray() {
    const answerBuffer = [];
    answerBuffer.push(this.campaign.verificationWrongAnswer1);
    answerBuffer.push(this.campaign.verificationWrongAnswer2);
    answerBuffer.push(this.campaign.verificationWrongAnswer3);
    answerBuffer.push(this.campaign.verificationWrongAnswer4);
    answerBuffer.push(this.campaign.verificationAnswer);
    this.answers = this.shuffle(answerBuffer);
  }

  shuffle(array: any) {
    let currentIndex = array.length;
    let temporaryValue;
    let randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  }

  onAnswer(answer: any) {
    return this.engagementService
      .verificationAnswer(answer, this.engagementId, this.campaignId, this.isUser, this.uuid)
      .subscribe((res: any) => {
        this.dialog.close(res);
      }, (err: any) => {
        console.error(err);
      });
  }

}
