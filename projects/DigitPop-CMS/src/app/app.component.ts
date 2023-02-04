import {Component, OnInit, ViewChild} from '@angular/core';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {Observable} from 'rxjs';
import {map, shareReplay} from 'rxjs/operators';
import {MatDialog} from '@angular/material/dialog';
import {NavigationExtras, Router} from '@angular/router';
import {SpinnerService} from './shared/services/spinner.service';
import {HomeComponent} from './home/home.component';
import {LoginComponent} from './login/login.component';
import {LogoutComponent} from './logout/logout.component';
import {SignupComponent} from './signup/signup.component';
import {
  ProjectWizardYoutubePopup
} from './cms/project-wizard/popup/youtube-popup.component';
import {XchaneUser} from './shared/models/xchane.user';
import {XchaneAuthenticationService} from './shared/services/xchane-auth-service.service';
import {DataService} from './xchane/services/data.service';


@Component({
  selector: 'digit-pop-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(map((result) => result.matches), shareReplay());

  email: any;
  password: any;
  dialogRef: any;
  // currentUser: User;
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
  enableShoppableTour = true;
  @ViewChild(HomeComponent) child: HomeComponent;

  // tslint:disable-next-line:max-line-length
  constructor(public spinnerService: SpinnerService, private breakpointObserver: BreakpointObserver, public dialog: MatDialog, private router: Router, private authService: XchaneAuthenticationService, private data: DataService) {
    router.events.subscribe(() => {
      this.getSections();
    });
    if (this.authService.currentUserValue) {
      this.enableShoppableTour = this.authService.currentUserValue.toured;
    }
  }

  ngOnInit() {
    // this.currentRole= localStorage.getItem("currentRole");
    // if(this.currentRole=="admin"||this.currentRole=="Business"){
    //   this.router.navigate(['/cms/dashboard']);
    // };
    // if(this.currentRole=="consumer"){
    //   this.router.navigate(['/xchane/dashboard']);
    // };

    this.isTrial = false;

    if (localStorage.getItem('currentRole')) {
      localStorage.removeItem('currentRole');
    }

    if (localStorage.getItem('trial')) {
      localStorage.removeItem('trial');
    }

  }

  ngDoCheck() {
    this.isLogin = false;
    this.isCMS = false;
    this.isProjectWizard = false;
    this.isCampaignsWizard = false;
    this.isAccountPage = false;
    this.excludeCustomNav = false;
    this.currentRole = localStorage.getItem('currentRole');
    this.isTrial = localStorage.getItem('trial');

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

    // if(this.currentRole=="admin"||this.currentRole=="Business"){
    //   this.router.navigate(['/cms/dashboard']);
    // };
    // if(this.currentRole=="consumer"){
    //   this.router.navigate(['/xchane/dashboard']);
    // };
    // console.log(this.currentUser);
  }

  toured = () => {
    this.authService
      .tour()
      .subscribe((res: XchaneUser) => {
        this.authService.storeUser(res);
        this.data.setShoppableTour(res.toured);
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
      console.log('The dialog was closed');
    });
  }

  openLogout() {
    const dialogRef = this.dialog.open(LogoutComponent, {
      panelClass: 'dpop-modal'
    });

    dialogRef.afterClosed().subscribe(() => {
    });
  }

  openDialog(): void {
    console.log('WZZZAAA');
    this.router.navigate(['/xchane/landing']);

    // const dialogRef = this.dialog.open(LoginComponent, {
    //   width: '250px',
    // });

    // dialogRef.afterClosed().subscribe(() => {
    //   console.log('The dialog was closed');
    // });
  }

  ngAfterContentInit(): void {
    // if (this.authenticationService.currentUserValue) {
    //   this.router.navigate(['/dashboard']);
    // } else {
    //   this.router.navigate(['/home']);
    // }
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
