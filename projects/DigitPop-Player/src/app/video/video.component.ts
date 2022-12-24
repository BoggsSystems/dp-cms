import {
  AfterViewInit, Component, ElementRef, OnInit, ViewChild,
} from '@angular/core';
import {
  ActivatedRoute, NavigationExtras, Params, Router,
} from '@angular/router';
import {Project} from '../models/project';
import {MatDialog} from '@angular/material/dialog';
import {
  ImageCarouselComponent
} from '../image-carousel/image-carousel.component';
import {MainHelpComponent} from '../help/main-help/main-help.component';
import {environment} from '../../environments/environment';
import {SubscriptionDetails, SubscriptionInfo} from '../models/subscription';
import {AdService} from '../shared/services/ad.service';
import {UserService} from '../shared/services/user.service';
import {BillsbyService} from '../shared/services/billsby.service';
import {ProductGroup} from '../models/productGroup';
import {Product} from '../models/product';
import {add} from 'lodash';

enum VideoType {
  Regular = 1, Cpcc,
}

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss'],
})
export class VideoComponent implements OnInit, AfterViewInit {
  isUser: boolean;
  adId: any;
  engagementId: any;
  campaignId: any;
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
  showSoundIcon = false;
  adReady = false;
  showThumbnail = false;
  showCanvas = false;
  showQuizButton = false;
  disablePrevious = true;
  disableNext = true;
  preview = false;
  params: Params;
  pgIndex: any;
  @ViewChild('videoPlayer') videoPlayer: ElementRef;
  @ViewChild('canvas') canvas: ElementRef;

  constructor(private router: Router, public dialog: MatDialog, private route: ActivatedRoute, private adService: AdService, private userService: UserService, private billsByService: BillsbyService) {
    this.isUser = false;
  }

  ngOnInit(): void {
    this.videoType = VideoType.Regular;

    this.innerWidth = window.innerWidth;
    this.innerHeight = window.innerHeight;

    this.route.params.subscribe((params) => {
      this.params = params;
      this.adId = params.id;

      if (params.engagementId != null && params.campaignId) {
        this.engagementId = params.engagementId;
        this.campaignId = params.campaignId;
        this.videoType = VideoType.Cpcc;
        this.isUser = !!(this.campaignId && this.engagementId);
      }
      if (params.preview != null) {
        this.preview = params.preview;
      }
    });

    if (this.adId != null) {
      this.adService.getAd(this.adId).subscribe((adService) => {
        this.ad = adService as Project;

        if (this.ad.active || this.preview) {
          this.adReady = true;
          this.userService.setTitle(this.ad.name);

          this.userService.getUserSubscription(this.ad.createdBy).subscribe((userSubscription) => {
            const result = userSubscription as SubscriptionInfo;
            this.onStartVideo();

            this.billsByService
              .getSubscriptionDetails(result.sid)
              .subscribe((res) => {
                this.subscription = res as SubscriptionDetails;

                this.userService.getUserIcon(this.ad.createdBy).subscribe((res) => {
                  this.userService.setUserIcon(res);
                }, (err) => {
                  console.error(`Error retrieving user icon: ${err.toString()}`);
                });
              }, (err) => {
                console.error(`Error retrieving subscription details: ${err.toString()}`);
              });
          }, (err) => {
            console.error(`Error retrieving subscription info: ${err.toString()}`);
          });
        }
      }, (err) => {
        console.error(`Error retrieving ad: ${err.toString()}`);
      });
    }

    if (!this.isUser) {
      // TODO: change targetOrigin url for staging/live deployment
      window.parent.postMessage({
        init: true, action: 'getCampaignId'
      }, 'http://localhost:4200');

      addEventListener('message', (event) => {
        if (event.data.campaignId) {
          this.campaignId = event.data.campaignId;
        }
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
    this.videoPlayer.nativeElement.height = this.innerHeight;
    this.videoPlayer.nativeElement.width = this.innerWidth;
  }

  onStartVideo() {
    const targetWindow = window.parent;
    targetWindow.postMessage('start', `http://localhost:4200`);
    if (!this.preview && this.subscription != null) {
      this.adService.createView(this.adId, this.subscription.cycleId).subscribe((res) => {
        console.log(res);
      }, (err) => {
        console.error(err);
      });
    }

    this.showThumbnail = false;
    this.setSize();
    this.showVideo = true;

    if (!this.videoMuted && false) { // Remove false to mute by default
      this.toggleVideoMute();
    }
    this.videoPlayer.nativeElement.play();
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

    targetWindow.postMessage('exit', `${environment.homeUrl}`);
  }

  onBackToGroup() {
    this.viewState = 'ProductGroup';
  }

  onBuyNow() {
    window.open(this.currentProduct.makeThisYourLookURL, '_blank');
  }

  onClickThumbnail(thumbnail: any) {
    this.selectedImage = thumbnail;
  }

  onProductClick(product: Product) {
    this.currentProduct = product;
    this.selectedImage = product.images[0];
    this.viewState = 'Product';
  }

  onShowProduct() {
    this.showSoundIcon = false;
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
    this.startQuiz();
    if (this.params.engagementId != null && this.params.campaignId) {
      this.showQuizButton = true;
      this.onShowProduct();
    } else {
      this.onShowProduct();
    }
  }

  startQuiz() {
    this.showQuizButton = false;
    const navigationExtras: NavigationExtras = this.isUser ? {
      state: {
        isUser: true,
        campaignId: this.campaignId,
        engagementId: this.engagementId
      },
    } : {
      state: {isUser: false, campaignId: this.campaignId},
    };

    return this.router.navigate(['/quiz'], navigationExtras);

  }

  onResumeVideo() {
    this.showCanvas = false;
    this.showVideo = true;
    // this.showSoundIcon = true;
    this.videoPlayer.nativeElement.play();
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
    const isIOS = window.navigator.userAgent.match(/iPhone/i) || window.navigator.userAgent.match(/iPad/i) || window.navigator.userAgent.match(/Macintosh/i);

    if (isIOS != null) {
      ctx.globalAlpha = 0.2;
    } else {
      ctx.filter = 'blur(20px) brightness(50%)';
    }

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
