import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {
  HashLocationStrategy, Location, LocationStrategy,
} from '@angular/common';
import {environment} from '../../environments/environment';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {PreviewComponent} from '../cms/preview/preview.component';
import {WelcomeComponent} from '../xchane/help/welcome/welcome.component';
import {
  animate,
  animation,
  AnimationBuilder,
  sequence,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import {Platform} from '@angular/cdk/platform';
import {User} from '../shared/models/user';
import {
  UserService
} from '../../../../DigitPop-Player/src/app/shared/services/user.service';
import {AuthenticationService} from '../shared/services/auth-service.service';
import {
  XchaneAuthenticationService
} from '../shared/services/xchane-auth-service.service';
import {SignupComponent} from '../signup/signup.component';
import {
  MetricsService
} from 'projects/DigitPop-CMS/src/app/shared/services/metrics.service';
import {Metric} from '../shared/models/metric';

interface CustomWindow extends Window {
  billsbyData: any;
}

declare const window: CustomWindow;
declare let Calendly: any;

@Component({
  selector: 'digit-pop-home',
  templateUrl: './home.component.html',
  providers: [Location, {
    provide: LocationStrategy, useClass: HashLocationStrategy
  },],
  animations: [trigger('openClose', [state('open', style({
    top: '0px',
    left: '0px',
    position: 'fixed',
    width: '{{startWidth}}px',
    height: '{{startHeight}}px',
    opacity: 1,
  }), {
    params: {
      startHeight: window.innerHeight, startWidth: window.innerWidth,
    },
  }), state('closed', style({
    height: '100%', width: '100%',
  })), transition('open => closed', [animate('1s')]), transition('closed => open', [animate('0.5s')]),]),],
  styleUrls: ['./home.component.scss'],
})

export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  location: Location;
  iFrameSrc: any;
  fadeAnimation: any;
  loading = false;
  users: User[];
  loggedIn = false;
  welcomed = false;
  @ViewChild('embeddedFrame') embeddedFrame: ElementRef;
  @ViewChild('embeddedIFrame') embeddedIFrame: ElementRef;

  // tslint:disable-next-line:max-line-length
  constructor(private router: Router, private route: ActivatedRoute, private dialog: MatDialog, location: Location, private _builder: AnimationBuilder, public platform: Platform, private userService: UserService, private metricsService: MetricsService, private authService: AuthenticationService, private xchaneAuthService: XchaneAuthenticationService) {
    const nav = this.router.getCurrentNavigation();
    const checkNav = nav != null && nav.extras != null && nav.extras.state != null;

    if (checkNav) {
      const navState = nav.extras.state;
      if (navState.loggedIn) {
        this.loggedIn = true;
      }
    }

    this.location = location;
    this.iFrameSrc = `${environment.playerUrl}/ad/60518dfbe73b860004205e72`;
    this.fadeAnimation = animation([style({opacity: '{{ start }}'}), animate('{{ time }}', style({opacity: '{{ end }}'})),], {
      params: {
        time: '1000ms', start: 0, end: 1
      }
    });
  }

  @HostListener('window:orientationchange', ['$event']) onOrientationChange(event: any) {
    const url = environment.playerUrl;

    console.log('Passing embedded player message');
    this.embeddedIFrame.nativeElement.contentWindow.postMessage('embeddedPlayer', url);

    if (window.innerHeight > window.innerWidth) {
      console.log('Height greater than width - show message');
      this.embeddedIFrame.nativeElement.contentWindow.postMessage('orientationPortrait', url);
    } else {
      console.log('Width greater than height - do not show message');
      this.embeddedIFrame.nativeElement.contentWindow.postMessage('orientationLandscape', url);
    }

    console.log('orientationChanged');
  }

  ngAfterViewInit() {
    if (this.loggedIn) {
      this.welcomed = this.xchaneAuthService.currentUserValue.welcomed;
    }
  }

  preview() {
    const metric = new Metric();
    metric.description = 'Preview Shoppable Video Button Press';

    this.metricsService.createMetric(metric).subscribe((res) => {
      console.log('Metric Created');
    }, (err) => {
      console.log('Error : ' + err);
    });

    const dialogConfig = new MatDialogConfig();

    dialogConfig.data = {
      id: '63047b558d2a7b000416050d',
    };
    const dialogRef = this.dialog.open(PreviewComponent, dialogConfig);
  }

  preview_fenty_icon() {
    const metric = new Metric();
    metric.description = 'Preview Shoppable Video Button Press';
    console.log('Calling metrics service');

    this.metricsService.createMetric(metric).subscribe((res) => {
      console.log('Metric Created');
    }, (err) => {
      console.log('Error : ' + err);
    });

    const dialogConfig = new MatDialogConfig();

    dialogConfig.data = {
      id: '62295ae4eac043000487fa6f',
    };

    const dialogRef = this.dialog.open(PreviewComponent, dialogConfig);
  }

  preview_cardi_reebok() {
    const metric = new Metric();
    metric.description = 'Preview Shoppable Video Button Press';
    console.log('Calling metrics service');

    this.metricsService.createMetric(metric).subscribe((res) => {
      console.log('Metric Created');
    }, (err) => {
      console.log('Error : ' + err);
    });

    const dialogConfig = new MatDialogConfig();

    dialogConfig.data = {
      id: '6310850fa0640500046e961a',
    };

    const dialogRef = this.dialog.open(PreviewComponent, dialogConfig);
  }

  ngOnInit(): void {
    Calendly.initBadgeWidget({
      url: 'https://calendly.com/digitpop/15min',
      text: 'Schedule a Demo',
      color: '#ff216a',
      textColor: '#ffffff',
      branding: true
    });
    window.addEventListener('message', this.receiveMessage.bind(this), false);
  }

  iOSVersion() {
    if (false) {
      // There is some iOS in Windows Phone...
      // https://msdn.microsoft.com/en-us/library/hh869301(v=vs.85).aspx
      return false;
    }
    const match = navigator.appVersion.match(/OS (\d+)_(\d+)_?(\d+)?/);
    let version;

    if (match !== undefined && match !== null) {
      version = [parseInt(match[1], 10), parseInt(match[2], 10)];
      return parseFloat(version.join('.'));
    }

    return false;
  }

  receiveMessage(event: any) {
    let isIOS;
    if (event.data === 'exit') {
      isIOS = window.navigator.userAgent.match(/iPhone/i) || window.navigator.userAgent.match(/iPad/i);

      if (isIOS != null) {
        this.embeddedFrame.nativeElement.style.setProperty('position', 'static');
        this.embeddedFrame.nativeElement.style.setProperty('left', 0 + 'px');
        this.embeddedFrame.nativeElement.style.setProperty('top', 0 + 'px');

        this.embeddedFrame.nativeElement.style.setProperty('width', '100%');
        this.embeddedFrame.nativeElement.style.setProperty('height', '100%');

        this.embeddedIFrame.nativeElement.style.setProperty('width', '100%');
        this.embeddedIFrame.nativeElement.style.setProperty('height', '100%');
      } else if (window.navigator.userAgent.match(/Macintosh/i)) {
        console.log('Close action in Macintosh SMOSH');
        this.embeddedFrame.nativeElement.style.setProperty('position', 'static');
        this.embeddedFrame.nativeElement.style.setProperty('left', 0 + 'px');
        this.embeddedFrame.nativeElement.style.setProperty('top', 0 + 'px');
        this.embeddedFrame.nativeElement.style.setProperty('width', '100%');
        this.embeddedFrame.nativeElement.style.setProperty('height', '100%');
        this.embeddedIFrame.nativeElement.style.setProperty('width', '100%');
        this.embeddedIFrame.nativeElement.style.setProperty('height', '100%');
      } else {
        const closeAnimation = this._builder.build([animate(500, style({
          top: '0px',
          left: '0px',
          position: 'static',
          width: '100%',
          height: '100%',
          opacity: 1,
        })),]);

        // use the returned factory object to create a player
        const player = closeAnimation.create(this.embeddedFrame.nativeElement);

        player.play();
      }
    }

    if (event.data === 'start') {
      isIOS = window.navigator.userAgent.match(/iPhone/i) || window.navigator.userAgent.match(/iPad/i);

      if (isIOS != null) {
        this.embeddedFrame.nativeElement.style.setProperty('position', 'fixed');
        this.embeddedFrame.nativeElement.style.setProperty('left', 0 + 'px');
        this.embeddedFrame.nativeElement.style.setProperty('top', 0 + 'px');

        const version = this.iOSVersion();
        if (version >= 13 && version < 14) {
          this.embeddedIFrame.nativeElement.style.setProperty('width', window.innerWidth + 'px');

          this.embeddedIFrame.nativeElement.style.setProperty('height', window.innerHeight + 'px');

          this.embeddedFrame.nativeElement.style.setProperty('width', window.innerWidth + 'px');

          this.embeddedFrame.nativeElement.style.setProperty('height', window.innerHeight + 'px');
        } else if (version === 14) {
          this.embeddedFrame.nativeElement.style.setProperty('width', '100%');
          this.embeddedFrame.nativeElement.style.setProperty('height', '100%');
        } else if (version < 13) {
          window.open(this.iFrameSrc);
        }
      } else if (window.navigator.userAgent.match(/Macintosh/i)) {
        if (window.navigator.userAgent.match(/Safari/i)) {
          // window.open(this.iFrameSrc);
        } else {
          this.embeddedFrame.nativeElement.style.setProperty('position', 'fixed');
          this.embeddedFrame.nativeElement.style.setProperty('left', 0 + 'px');
          this.embeddedFrame.nativeElement.style.setProperty('top', 0 + 'px');
          this.embeddedFrame.nativeElement.style.setProperty('width', window.innerWidth + 'px');

          this.embeddedFrame.nativeElement.style.setProperty('height', window.innerHeight + 'px');
        }
      } else {
        const startAnimation = this._builder.build([sequence([animate(100, style({
          top: '0px',
          left: '0px',
          position: 'fixed',
          width: window.innerWidth,
          height: window.innerHeight,
        })), animate(400, style({
          width: window.innerWidth, height: window.innerHeight,
        })),]),]);

        const player = startAnimation.create(this.embeddedFrame.nativeElement);
        player.play();
      }
    }
  }

  clicktrial() {
    const element: HTMLElement = document.getElementById('checkout') as HTMLElement;
    element.click();
    return {message: 'trial mode'};
  }

  openSignup() {

    const metric = new Metric();
    metric.description = 'Signup Button Press';
    console.log('Calling metrics service');

    this.metricsService.createMetric(metric).subscribe((res) => {
      console.log('Metric Created');
    }, (err) => {
      console.log('Error : ' + err);
    });

    const dialogRef = this.dialog.open(SignupComponent, {
      width: '40%', height: '70%',
    });

    dialogRef.afterClosed().subscribe(() => {
      console.log('The dialog was closed');
    });
  }


  createFreeTrialAccount() {

    console.log('In  createFreeTrialAccount');
    const user = new User();

    const r = (Math.random() + 1).toString(36).substring(7);
    console.log('random', r);

    user.email = 'testfreetrial@gmail.com';
    user.password = 'testfreetrial';

    this.authService.createUser(user).subscribe((res) => {
      if (res) {

        console.log('USER CREATED ' + res);
        localStorage.setItem('currentRole', 'Business');
        // localStorage.setItem("trial",'true');

        // const navigationExtras: NavigationExtras = {
        //   state: { trial: true },
        // };

        this.router.navigate(['/cms/dashboard']);
      }
    }, (err) => {
      console.log('Update error : ' + err.toString());
    });
  }

  ngOnDestroy(): void {
    Calendly.destroyBadgeWidget();

    const frame = document.getElementById('checkout-billsby-iframe');

    if (frame != null) {
      frame.parentNode.removeChild(frame);
    }

    const bg = document.getElementById('checkout-billsby-outer-background');

    if (bg != null) {
      bg.parentNode.removeChild(bg);
    }
  }

  onRegister() {
    this.router.navigate(['/register']);
  }

}
