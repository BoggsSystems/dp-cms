import {
  AfterViewChecked,
  Component,
  DoCheck,
  OnInit,
  ViewChild
} from '@angular/core';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {Observable} from 'rxjs';
import {map, shareReplay} from 'rxjs/operators';
import {MatDialog} from '@angular/material/dialog';
import {ActivatedRoute, Router} from '@angular/router';
import {SpinnerService} from './shared/services/spinner.service';
import {HomeComponent} from './home/home.component';
import {LoginComponent} from './login/login.component';
import {LogoutComponent} from './logout/logout.component';
import {SignupComponent} from './signup/signup.component';
import {
  ProjectWizardYoutubePopup
} from './cms/project-wizard/popup/youtube-popup.component';
import {XchaneUser} from './shared/models/xchane.user';
import {
  XchaneAuthenticationService
} from './shared/services/xchane-auth-service.service';
import {WebsocketService} from './shared/services/websocket.service';
import {DataService} from './xchane/services/data.service';


@Component({
  selector: 'digit-pop-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [WebsocketService]
})

export class AppComponent implements OnInit, DoCheck, AfterViewChecked {
  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(map((result) => result.matches), shareReplay());

  email: any;
  password: any;
  dialogRef: any;
  showSpinner: boolean;
  currentUser: any;
  currentRole: any;
  isLogin: any;
  isCMS: any;
  isTrial: any;
  isProjectWizard: any;
  isCampaignsWizard: any;
  isAccountPage: any;
  excludeCustomNav: any;
  navSections: Object;
  isEligible: boolean;
  sectionsKeys: any;
  videoTour = true;
  disableNotification: boolean;
  isVerified: boolean;
  notificationMessage: string;
  bc: BroadcastChannel;
  @ViewChild(HomeComponent) child: HomeComponent;

  // tslint:disable-next-line:max-line-length
  constructor(public spinnerService: SpinnerService, private breakpointObserver: BreakpointObserver, public dialog: MatDialog, private router: Router, private route: ActivatedRoute, private authService: XchaneAuthenticationService, private webSocket: WebsocketService, public data: DataService) {

    router.events.subscribe(() => {
      this.getSections();
    });

    this.bc = new BroadcastChannel('notifications');

    if (this.route != null && this.route.queryParams != null) {
      const x = this.route.queryParams;
      x.subscribe(params => {
        if (params.verified) {
          this.data
            .setNotification(true, params.verified);
          this.notificationMessage = params.verified;
          this.disableNotification = false;

          this.bc.postMessage({verified: true});
          this.router.navigate(['/home']);

          setTimeout(() => {
            this.disableNotification = true;
          }, 4000);
        }
      });
    }

    if (!this.isVerified) {
      this.bc.onmessage = (event) => {
        if (!event.data.verified) {
          return;
        }
        this.data.setNotification(false, 'Changed Notification Message');

        console.log(this.data.getNotification);
        this.bc.close();
      };
    }

  }

  ngOnInit() {
    this.isTrial = false;

    if (this.authService.currentUserValue) {
      this.videoTour = this.authService.currentUserValue.tour;
      this.isVerified = this.authService.currentUserValue.verified;
    }

    this.disableNotification = this.isVerified;

    if (localStorage.getItem('trial')) {
      localStorage.removeItem('trial');
    }
  }

  ngAfterViewChecked() {
    this.wsConnection();
  }

  wsConnection = () => {
    this.webSocket.messages.subscribe(message => {
      if (message.trigger === 'tour') {
        this.videoTour = message.value;
      } else if (message.trigger === 'verified' && message.value) {
        this.isVerified = true;
        this.notificationMessage = 'Email verified successfully.';

        setTimeout(() => {
          this.disableNotification = message.value;
        }, 4000);
      }
    });
  }

  sendWSMEssage = () => {
    this.webSocket.messages.next({ trigger: 'wor', value: 'hellow world!' });
  }

  ngDoCheck() {
    this.isLogin = false;
    this.isCMS = false;
    this.isProjectWizard = false;
    this.isCampaignsWizard = false;
    this.isAccountPage = false;
    this.excludeCustomNav = false;
    this.isTrial = localStorage.getItem('trial');
    this.currentRole = localStorage.getItem('currentRole') || sessionStorage.getItem('currentRole');

    if (localStorage.getItem('token')) {
      this.isLogin = true;
    }

    if (localStorage.getItem('currentuser')) {
      this.currentUser = JSON.parse(localStorage.getItem('currentuser'));
    }

    if (localStorage.getItem('XchaneCurrentUser')) {
      this.currentUser = JSON.parse(localStorage.getItem('XchaneCurrentUser'));
    }

    if (this.currentRole) {
      this.isLogin = true;
    }
    if (this.currentRole === 'Business') {
      this.isCMS = true;
      this.disableNotification = true;
    }
    if (this.router.url.indexOf('project-wizard') > -1) {
      this.isProjectWizard = true;
    }
    if (this.router.url.indexOf('campaign-wizard') > -1) {
      this.isCampaignsWizard = true;
    }
    if (this.router.url.indexOf('account') > -1) {
      this.isAccountPage = true;
    }

    if (this.isProjectWizard || this.isCampaignsWizard || this.isAccountPage) {
      this.excludeCustomNav = true;
    }
  }

  onTour = () => {
    this.authService
      .tour() /* Update user object property */
      .subscribe((res: XchaneUser) => {
        this.authService.storeUser(res);
        this.data.setVideoTour(res.tour); /* Set app subject with new value */
      }, (error: any) => {
        console.error(error);
      });
  }

  openLoginDialog(): void {
    const dialogRef = this.dialog.open(LoginComponent, {
      panelClass: 'dpop-modal'
    });

    dialogRef.afterClosed().subscribe(() => {
      console.log('The dialog was closed');
    });
  }

  openSignup(): void {
    const dialogRef = this.dialog.open(SignupComponent, {
      panelClass: 'dpop-modal'
    });

    dialogRef.afterClosed().subscribe(() => {

    });
  }

  openLogout() {
    const dialogRef = this.dialog.open(LogoutComponent, {
      panelClass: 'dpop-modal'
    });

    dialogRef.afterClosed().subscribe((loggedOut: boolean) => {
      if (loggedOut) {
        this.disableNotification = true;
      }
    });
  }

  openYoutubeDialog(): void {
    const dialogRef = this.dialog.open(ProjectWizardYoutubePopup, {
      width: '100%', height: '90%',
    });
  }

  wizardPopup() {
    this.openYoutubeDialog();
  }

  projects() {
    this.router.navigate(['/cms/project-wizard']);
  }

  compaigns() {
    this.router.navigate(['/cms/campaign-wizard']);
  }

  getSections() {
    if (!this.checkEligibility()) {
      return null;
    }
    let sectionsObject = {};
    const pageSections = document.querySelectorAll('[data-nav]');

    pageSections.forEach((section: Element) => {
      let id = this.getSectionId(section),
        title = this.getSectionTitle(section);
      if (!(id in pageSections)) {
        Object.assign(sectionsObject, {[id]: title});
      }
    });
    this.navSections = sectionsObject;
    this.sectionsKeys(sectionsObject);
    return sectionsObject;
  }

  checkEligibility() {
    const attributeExist = document.querySelector('[data-nav]') ?? false;
    this.isEligible = attributeExist ? true : false;
    return attributeExist;
  }

  getSectionTitle(section: Element) {
    const title = section.getAttribute('data-nav');
    return title;
  }

  getSectionId(section: Element) {
    const id = section.getAttribute('id') ?? '';
    return id;
  }

  setSectionsKeys(sectionsObject: Object) {
    this.sectionsKeys = Object.keys(sectionsObject);
  }

  scrollToSection(sectionId: string): void {
    const targetSection = document.querySelector('#' + sectionId);
    targetSection.scrollIntoView({
      behavior: 'smooth', block: 'start', inline: 'nearest',
    });
  }

  account() {
    this.router.navigate(['/cms/account']);
  }
}
