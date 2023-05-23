import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BusinessUserService } from '../shared/services/accounts/business-user.service';
import { BillsbyService } from '../shared/services/billsby.service';
import { tap, catchError, filter } from 'rxjs/operators';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { flowRight as compose } from 'lodash';
import { Plan } from '../shared/interfaces/plan.json';
import countriesData from './countries';

declare global {
  interface Window {
    scanDomBillsby: () => void;
    billsbyTokens: any;
  }
}

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
  public cycleId: number;
  public countries: { code: string; name: string; }[] = [];

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
      addressLine1: ['', Validators.required],
      addressLine2: [''],
      city: ['', Validators.required],
      state: ['', Validators.required],
      postalCode: ['', Validators.required],
      country: ['', Validators.required],
      expirationMonth: ['', Validators.required],
      expirationYear: ['', Validators.required],
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

    this.countries = countriesData;
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

  private extractNavigationExtras = (): void => {
    const nav = this.router.getCurrentNavigation();
    const { cid, sid } = nav?.extras?.state || {};

    const updateValues = (value: { cid: string; sid: string }): void => {
      this.cid = value.cid;
      this.sid = value.sid;
    };

    updateValues({ cid, sid });
  }

  private getUserDetails = (cid: string) => {
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


  private getSubscriptionDetails = (sid: string) => {
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

  private getPlans = () => {
    this.billsByService.getProductPlans().subscribe((res: Plan[]) => {
      this.plans = res;
    });
  }

  public setPlanName(plan: string, cycleId: number) {
    this.planName = plan;
    this.cycleId = cycleId;
  }

  private subscribeToPlan = (token: string) => {
    const { firstName, lastName, email, addressLine1, addressLine2, city, country, postalCode, expirationMonth, expirationYear } = this.signupForm.value;
    const fullName = `${firstName} ${lastName}`;

    const subscriptionData = {
      firstName: firstName,
      lastName: lastName,
      email: email,
      cycleId: this.cycleId,
      Units: 1,
      address: {
        addressLine1: addressLine1,
        addressLine2: addressLine2,
        state: 'CA',
        city: city,
        country: country,
        postCode: postalCode
      },
      cardDetails: {
        fullName: fullName,
        paymentCardToken: token,
        expiryMonth: +expirationMonth,
        expiryYear: +expirationYear,
        cardType: 'visa',
        last4Digits: '1111'
      }
    };

    this.billsByService.subscribeToPlan(subscriptionData).subscribe(res => {
      this.cid = res.customerUniqueId;
      this.sid = res.subscriptionUniqueId;
      this.submitData();
    });
  }

  public handleButtonClick = (e: Event): void => {
    e.preventDefault();
    const action = this.currentStep < 5 ? this.goToNextStep : this.submitPaymentForm;
    action.call(this);
  }

  private goToNextStep = (): void => {
    this.currentStep++;
    if (this.currentStep === 5) {
      this.loadBillsbyTokenizerScript()
        .then(() => {
          this.initTokenizer();
        })
        .catch((error) => {
          console.error('Failed to load Billsby tokenizer script:', error);
        });
    }
  }

  private goToPrevStep = (): void => {
    this.currentStep--;
  }

  public submitData = (): void => {
    if (this.signupForm.valid) {
      const userData = {
        ...this.signupForm.value,
        ...(this.cid && { cid: this.cid }),
        ...(this.sid && { sid: this.sid }),
      };

      if (this.planName) {
        userData['planName'] = this.planName;
      }

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

  private loadBillsbyTokenizerScript(): Promise<void> {
    const src = 'https://tokenlib.billsby.com/tokenizer.min.js';
    const attributes = {
      'data-billsby-company': 'stagingdigitpop'
    };

    return this.loadScript(src, attributes);
  }

  private initTokenizer = () => {
    const logToken = (token: string, pmData: any) => {
      this.subscribeToPlan(token);
    };

    const logErrors = (errors: any) => {
      errors.forEach((error: any) => {
        console.log(error);
      });
    };

    const watchForToken = () => {
      window.billsbyTokens.on("paymentMethod", logToken);
    };

    const listForTokenErrors = () => {
      window.billsbyTokens.on("errors", logErrors);
    };

    const listenBillsByTokenizer = compose(listForTokenErrors, watchForToken);

    window.billsbyTokens.init("billsby-number", "billsby-cvv");
    listenBillsByTokenizer();
  };

  private submitPaymentForm = () => {
    const { firstName, lastName, expirationMonth, expirationYear } = this.signupForm.value;
    const fullName = firstName + ' ' + lastName;

    const requiredFields: any = {};

    requiredFields["full_name"] = fullName;
    requiredFields["month"] = +expirationMonth;
    requiredFields["year"] = +expirationYear;

    window.billsbyTokens.tokenizeCreditCard(requiredFields);
  }

  private loadScript(src: string, attributes: { [key: string]: string }): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;

      // Set attributes
      for (const attr in attributes) {
        if (attributes.hasOwnProperty(attr)) {
          script.setAttribute(attr, attributes[attr]);
        }
      }

      script.onload = () => {
        resolve();
      };

      script.onerror = () => {
        reject(new Error(`Failed to load script: ${src}`));
      };

      document.head.appendChild(script);
    });
  }

}
