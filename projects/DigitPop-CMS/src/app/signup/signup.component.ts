import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MatDialogRef} from '@angular/material/dialog';
import {Router} from '@angular/router';
import {
  XchaneAuthenticationService
} from '../shared/services/xchane-auth-service.service';
import {ConfirmedValidator} from '../shared/helpers/confirmed.validator';
import {Role} from '../shared/models/role';
import {XchaneUser} from '../shared/models/xchane.user';
import {
  throwError as observableThrowError
} from 'rxjs/internal/observable/throwError';
import {DataService} from '../xchane/services/data.service';

interface customWindow extends Window {
  billsbyData: any;
}

declare const window: customWindow;


@Component({
  selector: 'digit-pop-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})

export class SignupComponent implements OnInit, OnDestroy {
  @Input() hideCloseButton = false;
  @Input() fromQuiz = false;
  @Input() fromPlans = false;
  @Input() fromSubscribe = false;
  @Input() campaignId: string;
  @Input() projectId: string;
  @Input() cid: string;
  @Input() sid: string;

  signUpForm: FormGroup;
  submitted = false;
  isCheckedConsumer: boolean;
  isCheckedBusiness: boolean;
  validRole: any;
  errorMessage: string;

  constructor(
    public dialogRef: MatDialogRef<SignupComponent>,
    fb: FormBuilder,
    private router: Router,
    private authService: XchaneAuthenticationService,
    private data: DataService,
  ) {
    this.validRole = Role.Consumer;
    this.signUpForm = fb.group({
      email: ['', Validators.required],
      password: ['', [Validators.required]],
      confirm_password: ['', [Validators.required]],
    }, {
      validator: ConfirmedValidator('password', 'confirm_password'),
    });

  }

  ngOnInit(): void {
  }

  get f() {
    return this.signUpForm.controls;
  }

  submit() {
    if (this.fromQuiz || this.validRole === Role.Consumer) {
      const xchaneUser = new XchaneUser();
      return this.handleXchaneSignUp(xchaneUser);
    }
  }

  handleXchaneSignUp = (user: XchaneUser) => {
    this.errorMessage = undefined;
    user.email = this.signUpForm.controls.email.value;
    user.password = this.signUpForm.controls.password.value;
    user.role = Role.Consumer;

    this.authService
      .createXchaneUser(user)
      .subscribe(response => {
        if (response.msg) {
          return this.errorMessage = response.msg;
        }

        this.dialogRef.close();
        this.authService.storeUser(response.user);
        localStorage.setItem('currentRole', 'customer');

        if (this.fromQuiz) {
          return this.addPointsToUser(response.user._id);
        }
        return this.refreshHomepage();
      }, error => {
        return observableThrowError(error);
      });
  }

  addPointsToUser = (xchaneUserId: string) => {
    this.authService
      .addPointsAfterSignUp(this.campaignId, xchaneUserId, this.projectId)
      .subscribe(response => {
        this.authService.storeUser(response);
        return this.refreshHomepage();
      }, error => {
        return observableThrowError(error);
      });
  }

  refreshHomepage = () => {
    this.data.setLogin(true);
    return this.router.navigate(['/']);
  }

  ngOnDestroy(): void {
    const frame = document.getElementById('checkout-billsby-iframe');
    if (frame != null) {
      frame.parentNode.removeChild(frame);
    }

    const bg = document.getElementById('checkout-billsby-outer-background');
    if (bg != null) {
      bg.parentNode.removeChild(bg);
    }
  }
}
