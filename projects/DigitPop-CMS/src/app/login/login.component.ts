import {Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute, NavigationExtras, Router} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {first} from 'rxjs/operators';
import {MatDialogRef} from '@angular/material/dialog';
import {
  XchaneAuthenticationService
} from '../shared/services/xchane-auth-service.service';
import {BillsbyService} from '../shared/services/billsby.service';
import {Role} from '../shared/models/role';
import {
  throwError as observableThrowError
} from 'rxjs/internal/observable/throwError';
import {XchaneUser} from '../shared/models/xchane.user';
import {environment} from '../../environments/environment';
import {WebsocketService} from '../shared/services/websocket.service';
import { SubscriptionService } from '../shared/services/subscription.service';
import { BusinessUserService } from '../shared/services/accounts/business-user.service';

@Component({
  selector: 'digit-pop-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})

export class LoginComponent implements OnInit {
  @Input() hideCloseButton = false;
  @Input() fromQuiz = false;
  @Input() fromPlans = false;
  @Input() fromSubscribe = false;
  @Input() campaignId: string;
  @Input() projectId: string;
  @Input() cid: string;
  @Input() sid: string;

  loginForm: FormGroup;
  loading = false;
  submitted = false;
  returnUrl: string;
  error = '';
  isCheckedConsumer: boolean;
  isCheckedBusiness: boolean;
  validRole: any;
  keepMeSignedIn = false;

  constructor(
    public dialogRef: MatDialogRef<LoginComponent>,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private businessUser: BusinessUserService,
    private xchaneAuthenticationService: XchaneAuthenticationService,
    private billsbyService: BillsbyService,
    private webSocket: WebsocketService,
    private subscriptionService: SubscriptionService,
  ) {
    if (this.businessUser.currentUserValue) {
      this.router.navigate(['/']);
    }
    this.validRole = Role.Consumer;

    // redirect to home if already logged in
    // if (this.authenticationService.currentUserValue) {
    //   this.dialogRef.close();
    //   this.router.navigate(['/cms/dashboard']);
    // } else {
    //   this.router.navigate(['/']);
    // }
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.loginForm.controls;
  }

  onChange($event: any) {
    if ($event.source.value === '1') {
      this.validRole = Role.Consumer;
    }
    if ($event.source.value === '2') {
      this.validRole = Role.Business;
    }
  }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      email: ['', Validators.required], password: ['', Validators.required],
    });
    this.returnUrl = this.route.snapshot.queryParams.returnUrl || '/';

    // get return url from route parameters or default to '/'
    // if (this.authenticationService.currentUserValue) {
    //   this.returnUrl =
    //     this.route.snapshot.queryParams['returnUrl'] || '/dashboard';

    //   this.dialogRef.afterClosed().subscribe(
    //     data => this.router.navigate(['/cms/dashboard'])
    //   );
    // }
  }

  onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    if (this.validRole === 'consumer' && !this.fromPlans && !this.fromSubscribe) {
      this.xchaneAuthenticationService
        .loginXchaneUser(this.f.email.value, this.f.password.value)
        .pipe(first())
        .subscribe((res) => {
          if (res) {
            this.webSocket.send({trigger: 'login', value: this.xchaneAuthenticationService.currentUserValue._id});
            this.webSocket.connect(environment.websocketURL + '/' + this.xchaneAuthenticationService.currentUserValue._id);

            if (this.keepMeSignedIn) {
              this.storeUser(res);
              localStorage.setItem('currentRole', 'customer');
              localStorage.setItem('XchaneCurrentUser', JSON.stringify(res));
            } else {
              sessionStorage.setItem('currentRole', 'customer');
              sessionStorage.setItem('XchaneCurrentUser', JSON.stringify(res));
            }

            this.dialogRef.close();

            if (this.fromQuiz) {
              return this.addPointsToUser(res._id);
            }

            const navigationExtras: NavigationExtras = {
              state: {
                loggedIn: true
              },
            };
            return this.router.navigate(['/home'], navigationExtras);
          } else {
            this.dialogRef.close();
          }

        }, (err) => {
          console.log('Update error : ' + err.toString());
        });
    } else if (this.validRole === 'Business' || this.fromPlans || this.fromSubscribe) {
      this.businessUser
        .login(this.f.email.value, this.f.password.value)
        .pipe(first())
        .subscribe((res: any) => {
          localStorage.setItem('currentRole', 'Business');

          if (this.fromPlans) {
            return this.createSubscription(
              this.businessUser.currentUserValue._id.toString()
            );
          } else if (this.fromSubscribe && this.cid && this.sid) {
            return this.createSubscription(
              this.businessUser.currentUserValue._id.toString(),
              this.cid,
              this.sid
            );
          }

          this.dialogRef.close();
          this.router.navigate(['/cms/dashboard']);
        }, (error: any) => {
          this.error = error;
          this.loading = false;
        });

    } else {
      alert('Please select login user type');
    }
  }

  createSubscription = (userId: string, cid?: string, sid?: string) => {
    const data: any = {};
    data.user = userId;
    data.subscriptionDate = new Date();
    data.renewalDate = new Date(new Date().getTime() + (30 * 24 * 60 * 60 * 1000)) // 30 days from now

    if (cid && sid) {
      data.billsByCid = cid;
      data.billsBySid = sid;
    } else {
      data.plan = 'free';
    }

    this.subscriptionService.createSubscription(data).subscribe(response => {
      console.log(response);
      this.dialogRef.close();
      this.router.navigate(['/cms/dashboard']);
    });
  }

  storeUser = (response: XchaneUser) => {
    const token = response.token ? response.token : null;
  }

  addPointsToUser = (xchaneUserId: string) => {
    this.xchaneAuthenticationService
      .addPointsAfterSignUp(this.campaignId, xchaneUserId, this.projectId)
      .subscribe(response => {
        this.xchaneAuthenticationService.storeUser(response);
        const navigationExtras: NavigationExtras = {
          state: {
            loggedIn: true
          },
        };
        return this.router.navigate(['/home'], navigationExtras);
      }, error => {
        return observableThrowError(error);
      });
  }
}
