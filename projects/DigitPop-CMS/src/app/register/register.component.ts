import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { User } from '../shared/models/user';
import { BillsbyService } from '../shared/services/billsby.service';

@Component({
  selector: 'app-root',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  form: FormGroup = new FormGroup({});
  cid: any;
  sid: any;
  billsbyUserInfo: any;

  constructor(
    fb: FormBuilder,
    private route: ActivatedRoute,
    private billsbyService: BillsbyService
  ) {
    console.log("REGISTER COMPONENT");
  }

  get f() {
    return this.form.controls;
  }

  submit() {
    var user = new User();
    user.name = this.billsbyUserInfo.email;
    user.email = this.billsbyUserInfo.email
    user.cid = this.cid;
    user.sid = this.sid;
    user.password = localStorage.getItem('toSignUpBusinessUserPassword');
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.cid = params['cid'];
      this.sid = params['sid'];
      this.getBillsbyCustomer(this.cid);
    });
  }

  getBillsbyCustomer(id: any) {
    this.billsbyService.getCustomerDetails(id).subscribe(
      (res) => {
        this.billsbyUserInfo = res;
        console.log('Update response : ' + res.toString());
        this.submit();
      },
      (err) => {
        console.log('Update error : ' + err.toString());
      }
    );
  }
}
