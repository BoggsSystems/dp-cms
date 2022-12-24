'use strict';
import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {
  MatDialog, MatDialogConfig, MatDialogRef
} from '@angular/material/dialog';
import {VideosGridService} from '../shared/services/videos-grid.service';
import {EngagementService} from '../shared/services/engagement.service';
import {PreviewComponent} from '../cms/preview/preview.component';
import {ProjectMedia} from '../shared/models/ProjectMedia';
import {Category} from '../shared/models/category';
import {
  AnswerDialogComponent
} from '../xchane/answer-dialog/answer-dialog.component';
import {PlayerComponent} from '../xchane/player/player.component';
import {timer} from 'rxjs';

@Component({
  selector: 'digit-pop-videos-grid',
  templateUrl: './videos-grid.component.html',
  styleUrls: ['./videos-grid.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class VideosGridComponent implements OnInit {
  selectedCategories: string[] = [];
  categories: string[] = [];
  activeCategories: Category[] = [];
  categoryVideosCount: number;
  videos: ProjectMedia[] = [];
  videosLoaded = false;
  MoreVideosLoaded = false;
  videosLimit = 10;
  videosCount: number[];
  page = 0;
  id: string;
  campaignId: string;
  popupDialogRef: MatDialogRef<PlayerComponent>;
  monthNames: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  scoreBubbleIsOpen: boolean;
  canToggle: boolean;

  constructor(private videosService: VideosGridService, private engagementService: EngagementService, private dialog: MatDialog) {
    this.scoreBubbleIsOpen = false;
    this.canToggle = false;
    this.videosCount = Array(this.videosLimit).fill(0).map((x, i) => i);
    this.categoryVideosCount = 0;
  }

  ngOnInit(): void {
    this.getCategories();
    window.addEventListener('message', this.handlePostQuizMessage.bind(this), false);
  }

  buildGrid: () => void = async () => {
    this.videosLoaded = true;
    this.MoreVideosLoaded = true;
  }

  getCategories: () => void = () => {
    return this.videosService
      .getActiveCategories()
      .subscribe((response: Category[]) => {
        this.activeCategories = response;
        this.categories = this.selectedCategories = this.activeCategories.map(category => category.name);
        this.getVideos();
      });
  }

  setCategory: (category: string) => void = (category: string) => {
    this.selectedCategories = category === 'All' ? this.categories : [category];
    this.page = 0;
    this.getVideos();
  }

  getVideos: (isAppend?: boolean) => void = async (isAppend: boolean = false) => {
    return this.videosService
      .getVideos(this.selectedCategories, this.page, this.videosLimit)
      .subscribe((response) => {
        this.categoryVideosCount = response[0].count;
        this.videos = isAppend ? [...this.videos, ...response] : response;
        this.buildGrid();
      }, (error: Error) => {
        console.error(error);
      });
  }

  previewVideo = (event: Event) => {
    const thumbnail = event.target as Element;
    const video = thumbnail.querySelector('video') as HTMLVideoElement;

    video.muted = true;
    video.loop = true;
    video.currentTime = 1;

    video.play().then(() => {
      thumbnail.addEventListener('mouseleave', () => this.stopPreview(thumbnail, video));
    });
  }

  stopPreview = (thumbnail: Element, video: HTMLVideoElement) => {
    thumbnail.removeEventListener('mouseleave', () => this);
    video.load();
  }

  openPlayer = (id: string, campaignId: string, event: Event | null = null) => {
    if (event) {
      event.preventDefault();
    }

    this.id = id;
    this.campaignId = campaignId;

    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {id, campaignId, isUser: false};

    this.popupDialogRef = this.dialog.open(PreviewComponent, dialogConfig);
  }

  loadMoreVideos = () => {
    this.videosCount = Array(this.categoryVideosCount - ((this.page + 1) * this.videosLimit)).fill(0).map((x, i) => i);
    this.MoreVideosLoaded = false;
    this.page++;
    this.getVideos(true);
  }

  prettyDate = (d: Date) => {
    const date = new Date(d);
    return `${this.monthNames[date.getMonth()]}, ${date.getDate()} - ${date.getFullYear()}`;
  }

  handlePostQuizMessage = (event: any) => {
    if (event.data.action === 'postQuiz') {
      this.popupDialogRef.close();

      const isCorrect = event.data.isCorrect;
      let confirmDialog: any;

      if (!isCorrect) {
        confirmDialog = this.dialog.open(AnswerDialogComponent, {
          data: {
            title: 'Incorrect Answer',
            message: 'Incorrect Answer, would you like to try again?',
          },
        });

        return confirmDialog.afterClosed().subscribe((result: boolean) => {
          confirmDialog.close();

          if (result === true) {
            this.openPlayer(this.id, this.campaignId);
          }
        });
      }

      this.canToggle = true;
      this.scoreBubbleToggle();
      this.canToggle = false;

      // if (event.data != null && event.data.received) {
      //   const iframeWindow = (document.querySelector('iframe.iframe') as HTMLIFrameElement).contentWindow;
      //   iframeWindow.postMessage({success: true, initCommunications: true}, environment.playerUrl);
      // }
      //
      // if (
      //   event.data != null &&
      //   event.data.complete != null &&
      //   event.data.correct != null
      // ) {
      //   this.popupDialogRef.close();
      //
      //   if (event.data.correct) {
      //
      //     this.refreshUser();
      //   } else {
      //
      //   }
      // }
    }
  }

  scoreBubbleToggle = () => {
    if (this.canToggle) {
      this.scoreBubbleIsOpen = !this.scoreBubbleIsOpen;

      if (this.scoreBubbleIsOpen) {
        const scoreBubbleTimer = timer(2000);
        scoreBubbleTimer.subscribe((x: any) => {
          this.scoreBubbleIsOpen = !this.scoreBubbleIsOpen;
        });
      }
    }
  }
}
