import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { map } from 'rxjs/operators';
import { HttpEventType } from '@angular/common/http';

import { BillsbyService } from '../../shared/services/billsby.service';
import { ImageService } from '../../shared/services/image.service';
import { AccountHelpComponent } from '../help/account/account-help.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

import { BusinessUserService } from '../../shared/services/accounts/business-user.service';
import { BusinessUser } from '../../shared/interfaces/business-user.json';
import { SubscriptionService } from '../../shared/services/subscription.service';

@Component({
  selector: 'DigitPop-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
})
export class AccountComponent implements OnInit {
  cid: any;
  sid: any;
  subscription: any;
  usage: any;
  icon:any;
  uploadStatus: any;
  currentUser: BusinessUser;

  @ViewChild('fileInput')
  fileInput: { nativeElement: { click: () => void; files: { [key: string]: File; }; }; };

  file: File | null = null;

  constructor(
    private billsByService: BillsbyService,
    private imageService: ImageService,
    private dialog: MatDialog,
    private businessUser: BusinessUserService,
    private subscriptionService: SubscriptionService
  ) {
    this.businessUser.currentUser.subscribe(user => {
      this.currentUser = user;
    });
  }

  ngOnInit(): void {
    this.getSubscription();
  }

  onSubmitThumbnail() {
    this.imageService
      .upload(this.file)
      .pipe(
        map((event) => {
          switch (event.type) {
            case HttpEventType.UploadProgress:
              return (this.uploadStatus = Math.round(
                (100 * event.loaded) / event.total
              ));

            case HttpEventType.Response:
              console.log(event.body);
              this.currentUser.branding = event.body;
              this.updateUser();
              return true;
            default:
              return `Unhandled event: ${event.type}`;
          }
        })
      )
      .subscribe(
        (res) => {
          console.log('Response log : ' + res);
        },
        (err) => {
          console.log('Error : ' + err);
        }
      );
  }

  updateUser() {
    this.businessUser.updateUser().subscribe(
      (res) => {
        this.businessUser.storeUser(res.data.user);
      },
      (err) => {
        console.log('Update error : ' + err.toString());
      }
    );
  }

  onClickFileInputButton(): void {
    this.fileInput.nativeElement.click();
  }

  onChangeFileInput(): void {
    const files: { [key: string]: File } = this.fileInput.nativeElement.files;
    this.file = files[0];
    this.onSubmitThumbnail();
  }

  logout(): void {
    this.businessUser.logout();
  }

  getCid(): string {
    return this.businessUser.currentUserValue?.cid;
  }

  getSid(): string {
    return this.businessUser.currentUserValue?.subscription;
  }

  getSubscription() {
    /* this.subscriptionService
      .getSubscription(this.businessUser.currentUserValue?.subscription)
      .subscribe(
        (res) => {
          console.log(res);
        }
      ) */
    this.businessUser
      .getSubscription()
      .subscribe(
        (res) => {
          console.log(res);
          if (!res.cycleId) return;
          console.log(res);
        }
      );
  }

  accountHelp() {
    const dialogRef = this.dialog.open(AccountHelpComponent, {
      width: '100%',
      height: '90%',
    });

    dialogRef.afterClosed().subscribe(() => {
      console.log('The dialog was closed');
    });
  }

  getUsage(cycleId: string) {
    this.businessUser
      .getUsage(cycleId)
      .subscribe(
        (res) => {
          this.usage = this.formatBytes(res);
        },
        (err) => {
          console.error(err);
        }
      );
  }

  formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  cancelSubscription() {
    const confirmDialog = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Cancel Subscription',
        message: 'Are you sure you want to cancel your subscription?',
      },
    });
    confirmDialog.afterClosed().subscribe((result) => {
      if (result === true) {
        this.billsByService.cancelSubscription().subscribe(
          (res) => {
            this.logout();
          },
          (err) => {
            console.log('Update error : ' + err.toString());
          }
        );
      }
    });
  }

  pauseSubscription() {
    const confirmDialog = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Pause Subscription',
        message:
          'Are you sure you want to pause your subscription for one cycle?',
      },
    });
    confirmDialog.afterClosed().subscribe((result) => {
      if (result === true) {
        //this.billsByService.cancelSubscription();

        this.billsByService.pauseSubscription().subscribe(
          (res) => {
            console.log('Pause subscription response : ' + res.toString());
          },
          (err) => {
            console.log('Update error : ' + err.toString());
          }
        );
      }
    });
  }
}
