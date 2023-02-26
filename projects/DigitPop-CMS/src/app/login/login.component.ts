import {Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute, NavigationExtras, Router} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {first} from 'rxjs/operators';
import {MatDialogRef} from '@angular/material/dialog';
import {AuthenticationService} from '../shared/services/auth-service.service';
import {
  XchaneAuthenticationService
} from '../shared/services/xchane-auth-service.service';
import {BillsbyService} from '../shared/services/billsby.service';
import {Role} from '../shared/models/role';
import {
  throwError as observableThrowError
} from 'rxjs/internal/observable/throwError';
import {XchaneUser} from '../shared/models/xchane.user';

@Component({
  selector: 'digit-pop-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})

export class LoginComponent implements OnInit {
  @Input() hideCloseButton = false;
  @Input() fromQuiz = false;
  @Input() campaignId: string;
  @Input() projectId: string;
  @Input() toured = false;
  loginForm: FormGroup;
  loading = false;
  submitted = false;
  returnUrl: string;
  error = '';
  isCheckedConsumer: boolean;
  isCheckedBusiness: boolean;
  validRole: any;
  keepMeSignedIn = false;

  // tslint:disable-next-line:max-line-length
  constructor(public dialogRef: MatDialogRef<LoginComponent>, private formBuilder: FormBuilder, private route: ActivatedRoute, private router: Router, private authenticationService: AuthenticationService, private xchaneAuthenticationService: XchaneAuthenticationService, private billsbyService: BillsbyService) {
    if (this.authenticationService.currentUserValue) {
      this.router.navigate(['/']);
    }
    this.validRole = Role.Consumer;

    if (localStorage.getItem('enabledShoppableTour')) {
      this.toured = localStorage.getItem('enabledShoppableTour') === 'true';
    }
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
    // console.log("user:",this.f.email.value, this.f.password.value);
    this.loading = true;
    if (this.validRole === 'consumer') {
      this.xchaneAuthenticationService
        .loginXchaneUser(this.f.email.value, this.f.password.value)
        .pipe(first())
        .subscribe((res) => {
          if (res) {
            if (this.keepMeSignedIn) {
              this.storeUser(res);
              localStorage.setItem('currentRole', 'customer');
            } else {
              sessionStorage.setItem('currentRole', 'customer');
            }

            this.dialogRef.close();

            if (!res.toured && this.toured) {
              this.xchaneAuthenticationService
                .tour()
                .subscribe(user => {
                  if (this.keepMeSignedIn) {
                    localStorage.setItem('enabledShoppableTour', 'true');
                    localStorage.setItem('XchaneCurrentUser', JSON.stringify(user));
                  } else {
                    sessionStorage.setItem('enabledShoppableTour', 'true');
                    sessionStorage.setItem('XchaneCurrentUser', JSON.stringify(user));
                  }
                });
            }

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
    } else if (this.validRole === 'Business') {
      this.authenticationService
        .login(this.f.email.value, this.f.password.value)
        .pipe(first())
        .subscribe((res: any) => {
          console.log('LOGIN RESULT : ', this.authenticationService.currentUserValue);
          // this.billsbyService.getSubscriptionDetails().subscribe(
          //   (res: any) => {
          //     if (res.status != 'Cancelled') {
          //       this.router.navigate(['/cms/dashboard']);
          //     } else {
          //       this.authenticationService.logout();
          //     }
          //     console.log('Update response : ', res.toString());
          //   },
          //   (err: any) => {
          //     console.log('Update error : ', err.toString());
          //   }
          // );

          localStorage.setItem('currentRole', 'Business');
          this.dialogRef.close();
          this.router.navigate(['/cms/dashboard']);

          // if(res.role == "Business"){
          //   console.log(res.role);
          //   this.dialogRef.close();
          //   this.router.navigate(['/cms/dashboard']);
          // } else if (res.role == "consumer") {
          //   alert("This email is not registered as Business.")
          //   this.dialogRef.close();
          // }

        }, (error: any) => {
          this.error = error;
          this.loading = false;
        });

    } else {
      alert('Please select login user type');
    }
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
