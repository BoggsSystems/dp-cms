import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {FormGroup} from '@angular/forms';
import {MatDialogRef} from '@angular/material/dialog';
import {Cache} from '../shared/helpers/cache';
import { DataService } from '../xchane/services/data.service';
import { BusinessUserService } from '../shared/services/accounts/business-user.service';

@Component({
  selector: 'digit-pop-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.scss'],
})
export class LogoutComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  submitted = false;
  returnUrl: string;
  error = '';

  constructor(public dialogRef: MatDialogRef<LogoutComponent>, public router: Router, private data: DataService,
    private businessUser: BusinessUserService,
  ) {
  }

  ngOnInit() {
  }

  logout() {
    this.data.setLogin(false);

    localStorage.clear();
    sessionStorage.clear();

    if (this.businessUser.currentUser) {
      this.dialogRef.close(true);
      return this.businessUser.logout();
    }

    this.dialogRef.close(true);
    this.router.navigate(['/']);
  }

  close() {
    this.dialogRef.close();
  }
}
