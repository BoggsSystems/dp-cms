'use strict';
import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {
  MatDialog,
  MatDialogConfig,
  MatDialogRef
} from '@angular/material/dialog';
import {Router} from '@angular/router';
import {VideosGridService} from '../shared/services/videos-grid.service';
import {EngagementService} from '../shared/services/engagement.service';
import {
  XchaneAuthenticationService
} from '../shared/services/xchane-auth-service.service';
import {PreviewComponent} from '../cms/preview/preview.component';
import {ProjectMedia} from '../shared/models/ProjectMedia';
import {Category} from '../shared/models/category';
import {
  AnswerDialogComponent
} from '../xchane/answer-dialog/answer-dialog.component';
import {PlayerComponent} from '../xchane/player/player.component';
import {timer} from 'rxjs';
import {VisitorPopupComponent} from '../visitor-popup/visitor-popup.component';
import {XchaneUser} from '../shared/models/xchane.user';
import {DataService} from '../xchane/services/data.service';

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
  projectId: string;
  campaignId: string;
  categoryId: string;
  popupDialogRef: MatDialogRef<PlayerComponent>;
  previewDialogRef: MatDialogRef<PreviewComponent>;
  monthNames: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  scoreBubbleIsOpen: boolean;
  canToggle: boolean;
  enabledShoppableTour = true;
  isUser: string | boolean;

  // tslint:disable-next-line:max-line-length
  constructor(private videosService: VideosGridService, private engagementService: EngagementService, private authService: XchaneAuthenticationService, private dialog: MatDialog, private router: Router, private data: DataService) {
    this.scoreBubbleIsOpen = false;
    this.canToggle = false;
    this.videosCount = Array(this.videosLimit).fill(0).map((x, i) => i);
    this.categoryVideosCount = 0;
    this.selectedCategories = ['Cosmetics']; // Set default category
    this.data.getShoppableTour().subscribe(enabledShoppableTour => {
      this.enabledShoppableTour = enabledShoppableTour.enabled;
    });
  }

  ngOnInit(): void {
    if (this.authService.currentUserValue) {
      this.enabledShoppableTour = this.authService.currentUserValue.toured ? this.authService.currentUserValue.toured : false;
      localStorage.setItem('enabledShoppableTour', String(this.enabledShoppableTour));
    }
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
        this.activeCategories = [{
          _id: '', name: 'All', description: ''
        }, ...this.sortCategories(response)];
        // this.categories = this.selectedCategories = this.activeCategories.map(category => category.name);
        this.categories = this.activeCategories.map(category => category.name);
        this.getVideos();
      });
  }

  sortCategories = (response: Category[]) => {
    const startingCategories = ['Clothing', 'Cosmetics'];
    const filteredResponse: Category[] = [];

    const preferredSort = response.filter(category => {
      if (startingCategories.includes(category.name)) {
        response.pop();
        return true;
      }

      filteredResponse.push(category);
      return false;
    });

    return [...preferredSort, ...filteredResponse];
  }

  setCategory: (category: string) => void = (category: string) => {
    this.selectedCategories = category === 'All' ? this.categories : [category];
    this.page = 0;
    this.getVideos();
  }

  getVideos: (isAppend?: boolean) => void = async (isAppend: boolean = false) => {
    const currentUserId = localStorage.getItem('XchaneCurrentUser') ? JSON.parse(localStorage.getItem('XchaneCurrentUser'))._id : false;

    return this.videosService
      .getVideos(this.selectedCategories, this.page, this.videosLimit, currentUserId)
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

  openPlayer = async (id: string, campaignId: string, categoryId: string, event: Event | null = null) => {
    if (event) {
      event.preventDefault();
    }

    this.projectId = id;
    this.campaignId = campaignId;
    this.categoryId = categoryId;

    const dialogConfig = new MatDialogConfig();
    const isUser = !!localStorage.getItem('XchaneCurrentUser');
    const userId = isUser ? JSON.parse(localStorage.getItem('XchaneCurrentUser'))._id : false;

    this.isUser = isUser;

    dialogConfig.data = {
      id,
      campaignId,
      userId,
      categoryId,
      enabledShoppableTour: this.enabledShoppableTour
    };
    this.previewDialogRef = this.dialog.open(PreviewComponent, dialogConfig);
    const sub = this.previewDialogRef.componentInstance.onAdd.subscribe(() => {
      this.previewDialogRef.close();
    });
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
      this.previewDialogRef.close();

      const isCorrect = event.data.isCorrect.correct;
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
            this.openPlayer(this.projectId, this.campaignId, this.categoryId);
          }
        });
      }

      this.videos = this.videos.map(video => {
        if (video._id !== this.projectId) {
          return video;
        }

        video.watched = true;
        return video;
      });
      console.log(this.videos);

      this.canToggle = true;
      this.scoreBubbleToggle(event.data.isUser);
      this.canToggle = false;
    }
  }

  scoreBubbleToggle = (isUser: boolean) => {
    if (this.canToggle) {
      this.scoreBubbleIsOpen = !this.scoreBubbleIsOpen;

      if (this.scoreBubbleIsOpen) {
        const scoreBubbleTimer = timer(2000);
        scoreBubbleTimer.subscribe((x: any) => {
          this.scoreBubbleIsOpen = !this.scoreBubbleIsOpen;
          if (!isUser) {
            return this.openVisitorPopup();
          }
          return this.refreshUser();
        });
      }
    }
  }

  openVisitorPopup = () => {
    const dialogRef = this.dialog.open(VisitorPopupComponent, {
      maxWidth: '90%',
      data: {
        campaignId: this.campaignId, projectId: this.projectId
      }, panelClass: 'dpop-modal'
    });

    dialogRef.afterClosed().subscribe(() => {
    });
  }

  toured = () => {
    if (!this.authService.currentUserValue.toured) {
      this.authService
        .tour()
        .subscribe((res: XchaneUser) => {
          if (res.toured) {
            this.authService.storeUser(res);
          }
        }, (error: any) => {
          console.error(error);
        });
    }
  }

  private refreshUser = () => {
    this.authService.getCurrentXchaneUser().subscribe((user) => {
      let use = new XchaneUser();
      use = user as XchaneUser;
      this.authService.storeUser(use);
    }, (error: any) => {
      console.error(error);
    });
  }
}
