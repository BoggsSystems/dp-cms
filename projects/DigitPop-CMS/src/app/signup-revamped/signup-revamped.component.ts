import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BusinessUserService } from '../shared/services/accounts/business-user.service';
import { BillsbyService } from '../shared/services/billsby.service';
import { tap, catchError, filter } from 'rxjs/operators';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { Plan } from '../shared/interfaces/plan.json';

@Component({
  selector: 'digit-pop-signup-revamped',
  templateUrl: './signup-revamped.component.html',
  styleUrls: ['./signup-revamped.component.scss'],
})
export class SignupRevampedComponent implements OnInit, AfterViewInit {
  @Input() fromQuiz = false;
  @Input() fromPlans = false;
  @Input() fromSubscribe = false;
  @Input() campaignId!: string;
  @Input() projectId!: string;
  @Input() cid!: string;
  @Input() sid!: string;

  public signupForm!: FormGroup;
  public currentStep = 1;
  public plans: Plan[];
  public planName: string;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private businessUserService: BusinessUserService,
    private billsByService: BillsbyService,
  ) {
    this.extractNavigationExtras();

    // Use FormBuilder to initialize the form
    this.signupForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
      // agreeToTerms: [false, Validators.requiredTrue],
    });
  }

  ngOnInit(): void {
    of(this.cid)
      .pipe(
        filter((cid) => !!cid),
        tap((cid) => this.getUserDetails(cid))
      )
      .subscribe();
  }

  ngAfterViewInit(): void {
    of(this.sid)
      .pipe(
        filter((sid) => !!sid),
        tap((sid) => this.getSubscriptionDetails(sid))
      )
      .subscribe();
    this.getPlans();
  }

  private extractNavigationExtras(): void {
    const nav = this.router.getCurrentNavigation();
    const { cid, sid } = nav?.extras?.state || {};

    const updateValues = (value: { cid: string; sid: string }): void => {
      this.cid = value.cid;
      this.sid = value.sid;
    };

    updateValues({ cid, sid });
  }

  private getUserDetails(cid: string) {
    this.billsByService
      .getCustomerDetails(cid)
      .pipe(
        filter((res) => res.firstName && res.lastName && res.email),
        tap((res) => {
          this.signupForm.patchValue({
            firstName: res.firstName,
            lastName: res.lastName,
            email: res.email
          });
        }),
        catchError((error) => {
          console.error('Error getting user details:', error);
          return of(error);
        })
      )
      .subscribe();
  }


  private getSubscriptionDetails(sid: string) {
    this.billsByService
      .getSubscriptionDetails(sid)
      .pipe(
        filter((res) => res.planName),
        tap((res) => {
          this.planName = res.planName;
        }),
        catchError((error) => {
          console.error('Error getting subscription details:', error);
          return of(error);
        })
      )
      .subscribe();
  }

  private getPlans() {
    this.billsByService.getProductPlans().subscribe((res: Plan[]) => {
      this.plans = res;
    });
  }

  public handleButtonClick(e: Event): void {
    e.preventDefault();
    const action = this.currentStep < 3 ? this.goToNextStep : this.submitData;
    action.call(this);
  }

  private goToNextStep(): void {
    this.currentStep++;
  }

  private goToPrevStep(): void {
    this.currentStep--;
  }

  public submitData(): void {
    if (this.signupForm.valid) {
      const userData = {
        ...this.signupForm.value,
        ...(this.cid && { cid: this.cid }),
        ...(this.sid && { sid: this.sid }),
      };
      this.businessUserService
        .createUser(userData)
        .pipe(
          tap((response: any) => {
            if (response && response.success !== false) {
              console.log('User created successfully:', response);
              this.router.navigate(['/home']);
            }
          }),
          catchError((error) => {
            console.error('Error creating user:', error);
            return of(error);
          })
        )
        .subscribe();
    }
  }

}
