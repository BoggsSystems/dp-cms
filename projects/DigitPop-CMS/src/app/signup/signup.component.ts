import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MatDialogRef} from '@angular/material/dialog';
import {ActivatedRoute, NavigationExtras, Router} from '@angular/router';
import {
  XchaneAuthenticationService
} from '../shared/services/xchane-auth-service.service';
import {AuthenticationService} from '../shared/services/auth-service.service';
import {ConfirmedValidator} from '../shared/helpers/confirmed.validator';
import {User} from '../shared/models/user';
import {Role} from '../shared/models/role';
import {XchaneUser} from '../shared/models/xchane.user';
import {
  throwError as observableThrowError
} from 'rxjs/internal/observable/throwError';
import {DataService} from '../xchane/services/data.service';
import {WebsocketService} from '../shared/services/websocket.service';
import {environment} from '../../environments/environment';

interface customWindow extends Window {
  billsbyData: any;
}

declare const window: customWindow;


@Component({
  selector: 'digit-pop-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
  providers: [WebsocketService]
})

export class SignupComponent implements OnInit, OnDestroy {
  @Input() hideCloseButton = false;
  @Input() fromQuiz = false;
  @Input() campaignId: string;
  @Input() projectId: string;

  signUpForm: FormGroup;
  submitted = false;
  isCheckedConsumer: boolean;
  isCheckedBusiness: boolean;
  validRole: any;
  errorMessage: string;

  // tslint:disable-next-line:max-line-length
  constructor(public dialogRef: MatDialogRef<SignupComponent>, fb: FormBuilder, private route: ActivatedRoute, private router: Router, private authService: XchaneAuthenticationService, private bizAuthService: AuthenticationService, private data: DataService, private webSocket: WebsocketService) {
    this.validRole = Role.Consumer;
    //  window['billsbyData'] = {
    //   email: "fake@eamil.net",
    //   fname: "fake"
    // };
    this.signUpForm = fb.group({
      email: ['', Validators.required],
      password: ['', [Validators.required]],
      confirm_password: ['', [Validators.required]],
    }, {
      validator: ConfirmedValidator('password', 'confirm_password'),
    });

  }

  get f() {
    return this.signUpForm.controls;
  }

//   OnChangec($event: any){
//     this.isCheckedConsumer= false;
//     this.isCheckedBusiness =false;
//     this.isCheckedConsumer =$event.source.checked;
//      console.log(this.isCheckedConsumer,this.isCheckedBusiness);
//      if(this.isCheckedConsumer=true){
//        this.validRole=Role.Consumer;
//      }
//     // MatCheckboxChange {checked,MatCheckbox}
//   }
//   OnChangeb($eventa: any){
//     this.isCheckedConsumer= false;
//     this.isCheckedBusiness =false;
//     this.isCheckedBusiness =$eventa.source.checked;
//     if(this.isCheckedBusiness=true){
//       this.validRole=Role.Business;
//     }
//     console.log(this.isCheckedBusiness,this.isCheckedConsumer);
//    // MatCheckboxChange {checked,MatCheckbox}
//  }

  onChange($event: any) {
    if ($event.source.value === '1') {
      this.validRole = Role.Consumer;
    }
    if ($event.source.value === '2') {
      this.validRole = Role.Business;
    }
  }

  submit() {
    if (this.fromQuiz || this.validRole === Role.Consumer) {
      const xchaneUser = new XchaneUser();
      return this.handleXchaneSignUp(xchaneUser);
    }

    const user = new User();
    user.email = this.signUpForm.controls.email.value;
    user.password = this.signUpForm.controls.password.value;

    this.bizAuthService.createUser(user).subscribe((res) => {
      if (res.msg) {
        return this.errorMessage = res.msg;
      }

      if (res) {
        localStorage.setItem('currentRole', 'Business');
        this.dialogRef.close();
        this.router.navigate(['/cms/dashboard']);
      }
    }, (err) => {
      console.log(err);
    });
  }

  ngOnInit(): void {
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
        this.webSocket.disconnect();
        this.authService.storeUser(response.user);
        this.webSocket.connect(environment + '/' + this.authService.currentUserValue._id);
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
    return this.router.navigate(['/home']);
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
