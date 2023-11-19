'use strict';
import {
  AfterViewInit,
  Component,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
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
import {ProjectMedia} from '../shared/models/ProjectMedia';
import {Category} from '../shared/models/category';
import {
  AnswerDialogComponent
} from '../xchane/answer-dialog/answer-dialog.component';
import {PlayerComponent} from '../xchane/player/player.component';
import {timer} from 'rxjs';
import {VisitorPopupComponent} from '../visitor-popup/visitor-popup.component';
import {XchaneUser} from '../shared/models/xchane.user';
import { DataService } from '../xchane/services/data.service';
import { VideoPlayerComponent } from '../video-player/video-player.component';

@Component({
  selector: 'digit-pop-videos-grid',
  templateUrl: './videos-grid.component.html',
  styleUrls: ['./videos-grid.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class VideosGridComponent implements OnInit, AfterViewInit {
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
  previewDialogRef: MatDialogRef<VideoPlayerComponent>;
  monthNames: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  scoreBubbleIsOpen: boolean;
  canToggle: boolean;
  videoTour = true;
  isUser: string | boolean;
  popupOpened = false;
  dialogOpen = false;
  loggedIn = false;
  lastCampaignId: string | null;

  // tslint:disable-next-line:max-line-length
  constructor(private videosService: VideosGridService, private engagementService: EngagementService, private authService: XchaneAuthenticationService, private dialog: MatDialog, private router: Router, private data: DataService) {
    this.lastCampaignId = null;
    this.scoreBubbleIsOpen = false;
    this.canToggle = false;
    this.videosCount = Array(this.videosLimit).fill(0).map((x, i) => i);
    this.categoryVideosCount = 0;
    this.selectedCategories = ['Clothing']; // Set default category Cosmetics

    if (sessionStorage.getItem('XchaneCurrentUser') || localStorage.getItem('XchaneCurrentUser')) {
      this.loggedIn = true;
    }

    this.data.getLogin().subscribe(state => {
      this.loggedIn = state.loggedIn;
    });

    this.data.getVideTour().subscribe(state => {
      this.videoTour = state.enabled;
    });
  }

  ngOnInit(): void {
    if (this.authService.currentUserValue) {
      this.videoTour = 'tour' in this.authService.currentUserValue ? this.authService.currentUserValue.tour : true;
    }

    this.getCategories();
  }

  ngAfterViewInit() {
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
    this.lastCampaignId = null;
    this.selectedCategories = category === 'All' ? this.categories : [category];
    this.page = 0;
    this.getVideos();
  }

  getVideos: (isAppend?: boolean, isAll?: boolean) => void = async (isAppend: boolean = false, isAll: boolean = false) => {
    let currentUserId = localStorage.getItem('XchaneCurrentUser') ? JSON.parse(localStorage.getItem('XchaneCurrentUser'))._id : false;

    if (!currentUserId) {
      currentUserId = sessionStorage.getItem('XchaneCurrentUser') ? JSON.parse(sessionStorage.getItem('XchaneCurrentUser'))._id : false;
    }

    return this.videosService
      .getVideos(this.selectedCategories, this.page, this.videosLimit, currentUserId, this.lastCampaignId)
      .subscribe((response) => {
        this.categoryVideosCount = response[0].count;

        const uniqueIds = new Set();
        const uniqueResponse: ProjectMedia[] = [];

        response.forEach(video => {
          if (!uniqueIds.has(video._id)) {
            uniqueIds.add(video._id);
            uniqueResponse.push(video);
          }
        });

        const updatedVideos = isAppend ? [...this.videos, ...uniqueResponse] : uniqueResponse;
        this.videos = updatedVideos;

        this.lastCampaignId = isAll ? null : response[response.length - 1].campaignId;
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

    console.log("Project Id:  " + this.projectId);
    console.log("Campaign Id:  " + this.campaignId);
    console.log("Category Id:  " + this.categoryId);

    const dialogConfig = new MatDialogConfig();

    const getUserId = (): string | boolean => {
      let userId: string | boolean = false;

      const sessionUser = sessionStorage.getItem('XchaneCurrentUser');
      if (sessionUser) {
        userId = JSON.parse(sessionUser)._id;
      }

      if (!userId) {
        const localUser = localStorage.getItem('XchaneCurrentUser');
        if (localUser) {
          userId = JSON.parse(localUser)._id;
        }
      }

      return userId;
    };

    const isUser = !!getUserId();
    const userId = isUser ? getUserId() : false;

    this.isUser = isUser;

    dialogConfig.data = {
      id,
      campaignId,
      userId,
      categoryId,
      videoTour: this.videoTour
    };

    dialogConfig.panelClass = 'video-player-dialog';
    this.previewDialogRef = this.dialog.open(VideoPlayerComponent, dialogConfig);
    this.previewDialogRef.afterClosed().subscribe((data) => {
      if (data !== undefined) {
        this.handlePostQuiz(data);
      }
    });

    // const sub = this.previewDialogRef.componentInstance.onAdd.subscribe(() => {
    //   this.previewDialogRef.close();
    // });
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

  handlePostQuiz = (isCorrect: any) => {

    let confirmDialog: any;

    if (this.isUser) {
      isCorrect = isCorrect.correct;
    }

    if (!isCorrect && !this.dialogOpen) {
      confirmDialog = this.dialog.open(AnswerDialogComponent, {
        data: {
          title: 'Incorrect Answer',
          message: 'Incorrect Answer, would you like to try again?',
        },
      });

      this.dialogOpen = true;

      return confirmDialog.afterClosed().subscribe((result: boolean) => {
        this.dialogOpen = false;
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

    this.canToggle = true;
    this.scoreBubbleToggle(this.isUser);
    this.canToggle = false;
  }

  scoreBubbleToggle = (isUser: boolean | string) => {
    if (this.canToggle) {
      this.scoreBubbleIsOpen = true;

      if (this.scoreBubbleIsOpen) {
        const scoreBubbleTimer = timer(2000);
        scoreBubbleTimer.subscribe((x: any) => {
          this.scoreBubbleIsOpen = false;
          if (!isUser) {
            return this.openVisitorPopup();
          }
          this.refreshUser();
        });
      }
    }
  }

  openVisitorPopup = () => {
    if (this.popupOpened) { return; }
    this.popupOpened = true;
    const dialogRef = this.dialog.open(VisitorPopupComponent, {
      maxWidth: '90%',
      data: {
        source: 'quiz',
        campaignId: this.campaignId,
        projectId: this.projectId
      }, panelClass: 'dpop-modal'
    });

    dialogRef.afterClosed().subscribe(() => {
    });
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
