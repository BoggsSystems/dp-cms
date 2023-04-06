import {Component, OnInit} from '@angular/core';
import {DataService} from '../xchane/services/data.service';
import {
  XchaneAuthenticationService
} from '../shared/services/xchane-auth-service.service';
import {LoginComponent} from '../login/login.component';
import {MatDialog} from '@angular/material/dialog';
import {Router} from '@angular/router';

@Component({
  selector: 'digit-pop-email-verification',
  templateUrl: './email-verification.component.html',
  styleUrls: ['./email-verification.component.scss']
})
export class EmailVerificationComponent implements OnInit {
  isLoggedIn = true;

  constructor(private data: DataService, private auth: XchaneAuthenticationService, public dialog: MatDialog, private router: Router) {
    if (auth.currentUserValue._id) {
      this.isLoggedIn = true;
    }
  }

  ngOnInit(): void {
  }

  openLoginDialog(): void {
    const dialogRef = this.dialog.open(LoginComponent, {
      panelClass: 'dpop-modal'
    });

    dialogRef.afterClosed().subscribe(() => {
      if (this.auth.currentUserValue) {
        this.router.navigate(['/home']);
      }
    });
  }

}
