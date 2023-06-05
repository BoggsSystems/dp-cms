import { AfterViewInit, Component, ElementRef, EventEmitter, OnInit, Renderer2, ViewChild, Inject } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Params, Router } from '@angular/router';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { environment } from '../../environments/environment';


import { AdService } from '../shared/services/player/ad.service';
import { BillsbyService } from '../shared/services/billsby.service';
import { EngagementService } from '../shared/services/engagement.service';
import { UserService } from '../shared/services/player/user.service';

import { ImageCarouselComponent } from './image-carousel/image-carousel.component';
import { MainHelpComponent } from './main-help/main-help.component';

import { Project } from '../shared/models/project';
import { Product } from '../shared/models/product';
import { ProductGroup } from '../shared/models/productGroup';
import { SubscriptionDetails, SubscriptionInfo } from '../shared/models/subscription'

enum VideoType {
  Regular = 1, Cpcc,
}

@Component({
  selector: 'digit-pop-video-player',
  templateUrl: './video-player.component.html',
  styleUrls: ['./video-player.component.scss']
})
export class VideoPlayerComponent implements OnInit {

  onPremise = false;
  isUser: boolean;
  userId: string;
  adId: any;
  adPrivate: boolean;
  engagementId: any;
  campaignId: any;
  categoryId: string;
  ad: Project;
  currentProductGroup: ProductGroup;
  currentProduct: Product;
  selectedImage: any;
  innerWidth: any;
  innerHeight: any;
  viewState: any;
  subscription: any;
  videoType: VideoType;
  showVideo = true;
  videoMuted = false;
  showSoundIcon = true;
  adReady = false;
  showThumbnail = true;
  showCanvas = false;
  showQuizButton = false;
  disablePrevious = true;
  disableNext = true;
  preview = false;
  params: Params;
  pgIndex: any;
  videoPlaying = false;
  enabledShoppableTour = true;
  creatingEngagment = false;
  isPreview = false;
  isIOS = false;
  isSafari = false;
  uuid: string;
  autoplay = true;
  errorMessage: string;
  onAdd = new EventEmitter();
  @ViewChild('videoPlayer', { static: false }) videoPlayer: ElementRef;
  @ViewChild('canvas') canvas: ElementRef;

  // tslint:disable-next-line:max-line-length
  constructor(
    private router: Router,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private adService: AdService,
    private userService: UserService,
    private engagementService: EngagementService,
    private billsByService: BillsbyService,
    private renderer: Renderer2,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.isUser = false;
  }

  ngOnInit(): void {
    this.adId = this.data.id;
    this.isUser = this.data.userId && this.data.userId.length !== 8;
    this.userId = this.isUser ? this.data.userId : '';
    this.uuid = !this.isUser ? this.data.userId : '';

    this.videoType = VideoType.Regular;
    this.innerWidth = window.innerWidth;
    this.innerHeight = window.innerHeight;

    this.getAd(this.adId);

    /* this.route.params.subscribe((params) => {
      this.params = params;
      this.isPreview = params.preview;
      this.adId = params.id;
      this.isUser = params.userId && params.userId.length !== 8;
      this.userId = this.isUser ? params.userId : '';
      this.uuid = !this.isUser ? params.userId : '';

      if (params.engagementId != null && params.campaignId) {
        this.campaignId = params.campaignId;
        this.videoType = VideoType.Cpcc;
      }
      if (params.preview != null) {
        this.preview = params.preview;
      }
    }); */
  }

  private getAd = (adId: string): void => {
    this.adService.getAd(adId, false).subscribe(
      (res: any) => {
        if ('success' in res && !res.success) {
          this.errorMessage = res.message ? res.message : 'Video does\'t exist or private';
          return;
        }

        this.showSoundIcon = true;
        this.createCampaign();

        this.ad = res as Project;

        if (this.ad.active || this.preview) {
          this.adReady = true;
          this.userService.setTitle(this.ad.name);
          this.getUserSubscription(this.ad.createdBy);
        }
      },
      (err) => {
        console.error(`Error retrieving ad: ${err.toString()}`);
      }
    );
  };

  private getUserSubscription = (createdBy: string): void => {
    this.userService.getUserSubscription(createdBy).subscribe(
      (userSubscription) => {
        const result = userSubscription as SubscriptionInfo;
        this.onStartVideo();
        this.getSubscriptionDetails(result.sid);
      },
      (err) => {
        console.error(`Error retrieving subscription info: ${err.toString()}`);
      }
    );
  };

  private getSubscriptionDetails = (sid: string): void => {
    this.billsByService.getSubscriptionDetails(sid).subscribe(
      (res) => {
        this.subscription = res as SubscriptionDetails;
        this.getUserIcon(this.ad.createdBy);
      },
      (err) => {
        console.error(`Error retrieving subscription details: ${err.toString()}`);
      }
    );
  };

  private getUserIcon = (createdBy: string): void => {
    this.userService.getUserIcon(createdBy).subscribe(
      (res) => {
        this.userService.setUserIcon(res);
      },
      (err) => {
        console.error(`Error retrieving user icon: ${err.toString()}`);
      }
    );
  };

  createCampaign() {
    if (!this.creatingEngagment) {
      this.creatingEngagment = true;
      this.engagementService
        .createEngagementFromPlayer(this.userId, this.adId)
        .subscribe(res => {
          if (!this.isUser) {
            this.campaignId = res._id;
          } else {
            this.campaignId = res.campaign;
            this.engagementId = res._id;
          }
          this.creatingEngagment = false;
        });
    }
  }

  help() {
    const dialogRef = this.dialog.open(MainHelpComponent, {
      hasBackdrop: true, width: '100%', height: '90%',
    });

    dialogRef.afterClosed().subscribe(() => {
      console.log('The dialog was closed');
    });
  }

  ngAfterViewInit() {
    const playPromise = this.videoPlayer.nativeElement.play();
    if (playPromise !== undefined && playPromise.catch) {
      playPromise.catch((error: any) => {
        this.videoMuted = true;
        this.videoPlayer.nativeElement.play();
        console.log('Play promise error:', error);
      });
    }

    this.videoPlayer.nativeElement.height = this.innerHeight;
    this.videoPlayer.nativeElement.width = this.innerWidth;
  }

  onStartVideo() {
    this.autoplay = true;
    this.showThumbnail = false;
    const targetWindow = window.parent;
    if (!this.preview && this.subscription != null) {
      this.adService.createView(this.adId, this.subscription.cycleId).subscribe((res) => {
        console.log(res);
      }, (err) => {
        console.error(err);
      });
    }

    this.setSize();
    this.showVideo = true;

    if (!this.videoMuted && this.isIOS) { // Remove false to mute by default
      this.toggleVideoMute();
    }

    this.videoPlayer.nativeElement.play();
    this.videoPlaying = true;
  }

  toggleVideoMute() {
    this.videoPlayer.nativeElement.muted = !this.videoPlayer.nativeElement.muted;
    this.videoMuted = !this.videoMuted;
  }

  disableLogic() {
    this.disablePrevious = this.pgIndex === 0;
    this.disableNext = this.pgIndex + 2 > this.ad.productGroupTimeLine.length;
  }

  onPreviousProductGroup() {
    if (this.pgIndex - 1 < 0) {
      return;
    }

    this.pgIndex -= 1;
    this.disableLogic();
    this.currentProductGroup = this.ad.productGroupTimeLine[this.pgIndex];
  }

  onNextProductGroup() {
    if (this.disableNext) {
      return;
    }

    if (this.pgIndex + 1 > this.ad.productGroupTimeLine.length) {
      return;
    }

    this.pgIndex += 1;
    this.disableLogic();
    this.currentProductGroup = this.ad.productGroupTimeLine[this.pgIndex];
  }

  showBackToGroupButton() {
    if (this.ad.productGroupTimeLine.length > 1) {
      return true;
    } else {
      if (this.ad.productGroupTimeLine[0].products.length > 1) {
        return true;
      }
    }

    return false;
  }

  onExit() {
    const targetWindow = window.parent;
    this.showThumbnail = true;
    this.showCanvas = false;
  }

  onBackToGroup() {
    this.viewState = 'ProductGroup';
  }

  onBuyNow() {
    window.open(this.currentProduct.makeThisYourLookURL, '_blank');
    if (this.isPreview) { return; }
    this.adService
      .updateStats(this.adId, 'clickedBuy', this.currentProduct._id)
      .subscribe();
  }

  onClickThumbnail(thumbnail: any) {
    this.selectedImage = thumbnail;
  }

  onProductClick(product: Product) {
    this.currentProduct = product;
    this.selectedImage = product.images[0];
    this.viewState = 'Product';
    if (this.isPreview) { return; }
    this.adService
      .updateStats(this.adId, 'clickedProduct', this.currentProduct._id)
      .subscribe();
  }

  onShowProduct() {
    if (this.userId !== 'undefined' && !this.isPreview) {
      this.adService
        .updateStats(this.adId, 'paused')
        .subscribe();
    }
    this.videoPlaying = false;
    this.showSoundIcon = true;
    this.videoPlayer.nativeElement.pause();
    this.pgIndex = this.getProductGroupFromTime(this.videoPlayer.nativeElement.currentTime);

    this.disableLogic();

    if (this.ad.productGroupTimeLine.length === 1 && this.ad.productGroupTimeLine[0].products.length === 1) {
      this.viewState = 'Product';
    } else {
      this.viewState = 'ProductGroup';
    }

    this.currentProductGroup = this.ad.productGroupTimeLine[this.pgIndex];
    this.currentProduct = this.ad.productGroupTimeLine[0].products[0];

    if (this.currentProduct != null && this.currentProduct.images != null && this.currentProduct.images.length > 0) {
      this.selectedImage = this.currentProduct.images[0];
    }

    this.videoPlayer.nativeElement.pause();

    this.drawCanvas();
    this.showVideo = false;
    this.showCanvas = true;
  }

  onEnded() {
    if (this.uuid || this.userId) {
      this.showQuizButton = true;
    } else {
      this.showQuizButton = false;
    }
    this.onShowProduct();
    // if (this.params.engagementId != null && this.params.campaignId) {
    //   this.showQuizButton = true;
    //   this.onShowProduct();
    // } else {
    //   this.onShowProduct();
    // }
  }

  startQuiz() {
    this.showQuizButton = false;
    const navigationExtras: NavigationExtras = this.isUser ? {
      state: {
        userId: this.userId,
        isUser: true,
        campaignId: this.campaignId,
        engagementId: this.engagementId,
        uuid: this.uuid
      },
    } : {
      state: { isUser: false, campaignId: this.campaignId, uuid: this.uuid },
    };

    console.log(navigationExtras);
    return this.router.navigate(['/quiz'], navigationExtras);

  }

  onResumeVideo() {
    this.showThumbnail = false;
    this.showCanvas = false;
    this.showVideo = true;
    this.showSoundIcon = true;
    this.videoPlayer.nativeElement.play();
    this.videoPlaying = true;
  }

  setSize() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    const isW = w >= h * 1.7778;

    const vw = isW ? w : Math.round(h * 1.7778);
    const vh = isW ? Math.round(w * 0.5625) : h;
    const vol = Math.round((w - vw) / 2);
    const vot = Math.round((h - vh) / 2);

    this.videoPlayer.nativeElement.width = vw;
    this.videoPlayer.nativeElement.height = vh;
    this.videoPlayer.nativeElement.style.setProperty('left', vol + 'px');
    this.videoPlayer.nativeElement.style.setProperty('top', vot + 'px');
  }

  drawCanvas() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    const isW = w >= h * 1.7778;

    const vw = isW ? w : Math.round(h * 1.7778);
    const vh = isW ? Math.round(w * 0.5625) : h;
    const vol = Math.round((w - vw) / 2);
    const vot = Math.round((h - vh) / 2);

    this.canvas.nativeElement.width = vw;
    this.canvas.nativeElement.height = vh;

    const ratio = this.videoPlayer.nativeElement.videoWidth / this.videoPlayer.nativeElement.videoHeight;
    this.canvas.nativeElement.style.setProperty('left', vol + 'px');
    this.canvas.nativeElement.style.setProperty('top', vot + 'px');

    const ctx = this.canvas.nativeElement.getContext('2d');

    // tslint:disable-next-line:max-line-length
    ctx.drawImage(this.videoPlayer.nativeElement, vot, (vw - this.canvas.nativeElement.height * ratio) / 2, this.canvas.nativeElement.height * ratio, this.canvas.nativeElement.height);
  }


  getProductGroupFromTime(time: any) {
    if (this.ad.productGroupTimeLine.length === 1) {
      return 0;
    }

    for (let i = 0; i < this.ad.productGroupTimeLine.length; i++) {
      if (this.ad.productGroupTimeLine[i + 1] == null) {
        return i;
      } else {
        if (this.ad.productGroupTimeLine[i].time < time && time < this.ad.productGroupTimeLine[i + 1].time) {
          return i;
        }
      }
    }

    return -1;
  }

  onProductGroupClick(pg: any) {
    this.pgIndex = this.ad.productGroupTimeLine.indexOf(pg);
    this.disableLogic();
    this.currentProductGroup = pg;
    this.viewState = 'ProductGroup';
  }

  onAllProductGroupsClick() {
    this.viewState = 'AllProductGroups';
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(ImageCarouselComponent, {
      hasBackdrop: true, width: '100%', height: 'auto',
    });

    dialogRef.componentInstance.url = this.selectedImage.url;

    dialogRef.afterClosed().subscribe(() => {
      console.log('The dialog was closed');
    });
  }

  onSeekAndPlay() {
    this.videoPlayer.nativeElement.currentTime = this.currentProductGroup.time;
    this.onResumeVideo();
  }

}
