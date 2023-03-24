import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {FormGroup} from '@angular/forms';
import {MatDialogRef} from '@angular/material/dialog';
import {Cache} from '../shared/helpers/cache';
import {DataService} from '../xchane/services/data.service';

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

  constructor(public dialogRef: MatDialogRef<LogoutComponent>, public router: Router, private data: DataService) {
  }

  ngOnInit() {
  }

  logout() {
    Cache.invokeCache();
    this.data.setLogin(false);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentuser');
    localStorage.removeItem('XchaneCurrentUser');
    localStorage.removeItem('currentRole');
    localStorage.removeItem('expires_at');
    localStorage.removeItem('token');
    sessionStorage.removeItem('currentRole');

    this.router.navigate(['/']);
    this.dialogRef.close(true);
  }

  close() {
    this.dialogRef.close();
  }
}
