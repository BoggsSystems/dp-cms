import { AfterViewInit, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  public addressForm !: FormGroup;
  public cardDetailsForm !: FormGroup;
  public currentStep = 1;
  public plans: Plan[];
  public planName: string;
  public cycleId: number;
  public countries: { code: string; name: string; }[] = [];
  public isNextButtonDisabled: boolean;
  public nextStepTitle: string;
  public isSubmitting = false;
  public submissionMessage: string;
  public termsCheckboxChecked: boolean = false;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private businessUserService: BusinessUserService,
    private billsByService: BillsbyService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.planName = 'free';
    this.extractNavigationExtras();

    // Use FormBuilder to initialize the form
    this.signupForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(1)]],
      confirmPassword: ['', Validators.required],
      agreeToTerms: [false, Validators.requiredTrue]
    }, { validators: this.passwordMatchValidator });

    this.addressForm = this.formBuilder.group({
      addressLine1: ['', Validators.required],
      addressLine2: [''],
      city: ['', Validators.required],
      state: ['', Validators.required],
      postalCode: ['', Validators.required],
      country: ['', Validators.required],
    });

    this.cardDetailsForm = this.formBuilder.group({
      paymentCardToken: ['', Validators.required],
      expiryMonth: ['', Validators.required],
      expiryYear: ['', Validators.required],
      cardType: [''],
      last4Digits: ['']
    })

    this.setupFormChangeListeners();
    this.isNextButtonDisabled = true;
    this.nextStepTitle = "Security";
    this.submissionMessage = "we're creating your account";
  }

  ngOnInit(): void {
    of(this.cid)
      .pipe(
        filter((cid) => !!cid),
        tap((cid) => this.getUserDetails(cid))
      )
      .subscribe();

    this.countries = countriesData;

    this.signupForm.valueChanges.subscribe(() => {
      this.updateNextButtonState();
    });

    this.addressForm.valueChanges.subscribe(() => {
      this.updateNextButtonState();
    });

    this.cardDetailsForm.valueChanges.subscribe(() => {
      this.updateNextButtonState();
    });
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
    const { cid, sid, planName, cycleId } = nav?.extras?.state || {};

    if (planName) this.planName = planName;
    if (this.cycleId) this.cycleId = cycleId;

    const updateValues = (value: { cid: string; sid: string }): void => {
      this.cid = value.cid;
      this.sid = value.sid;
    };

    updateValues({ cid, sid });
  }

  private passwordMatchValidator = (control: AbstractControl) => {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
    } else {
      confirmPassword.setErrors(null);
    }
  }

  private setupFormChangeListeners = () => {
    const passwordControl = this.signupForm.get('password');
    const confirmPasswordControl = this.signupForm.get('confirmPassword');

    passwordControl.valueChanges.subscribe(() => {
      confirmPasswordControl.updateValueAndValidity();
    });

    confirmPasswordControl.valueChanges.subscribe(() => {
      confirmPasswordControl.updateValueAndValidity();
    });
  }

  toggleTermsCheckbox() {
    this.termsCheckboxChecked = !this.termsCheckboxChecked;
    this.signupForm.patchValue({
      agreeToTerms: this.termsCheckboxChecked,
    });

    this.updateNextButtonState();
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

  public removeCurrencyChar(formattedPrice: string): string {
    const newString = formattedPrice.substring(1);
    return newString;
  }

  public setPlanName(plan: string, cycleId: number) {
    this.planName = plan;
    this.cycleId = cycleId;
  }

  private subscribeToPlan = (token: string) => {
    this.submissionProgress(true, "We're subscribing you to the plan.");

    const { firstName, lastName, email } = this.signupForm.value;
    const { addressLine1, addressLine2, city, country, postalCode } = this.addressForm.value;
    const { expiryMonth, expiryYear, cardType, last4Digits } = this.cardDetailsForm.value;
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
        expiryMonth: +expiryMonth,
        expiryYear: +expiryYear,
        cardType: cardType,
        last4Digits: last4Digits
      }
    };

    this.billsByService.subscribeToPlan(subscriptionData).subscribe(res => {
      this.submissionProgress(true, "Successfuly subscribed to plan");
      this.cid = res.customerUniqueId;
      this.sid = res.subscriptionUniqueId;
      this.submitData();
    });
  }

  private updateNextButtonState() {
    switch (this.currentStep) {
      case 1:
        this.isNextButtonDisabled = !this.signupForm.get('firstName').valid ||
          !this.signupForm.get('lastName').valid ||
          !this.signupForm.get('email').valid;
        break;
      case 2:
        this.isNextButtonDisabled = !this.signupForm.get('password').valid || !this.signupForm.get('confirmPassword').valid || !this.signupForm.get('agreeToTerms').value;
        break;
      case 3:
        this.isNextButtonDisabled = false;
        break;
      case 4:
        this.isNextButtonDisabled = !this.addressForm.valid;
        break;
      case 5:
        this.isNextButtonDisabled = !this.cardDetailsForm.get('expiryMonth').valid || !this.cardDetailsForm.get('expiryYear').valid;
        break;
      default:
        this.isNextButtonDisabled = false; // Set a default value if needed
        break;
    }
    this.changeDetectorRef.detectChanges();
  }

  public handleButtonClick = (e: Event): void => {
    if (this.isNextButtonDisabled) { return };
    e.preventDefault();
    const action =
      this.currentStep < 3
        ? this.goToNextStep
        : this.currentStep === 3 && this.planName === 'free'
          ? this.submitData
          : this.currentStep === 5
            ? this.submitPaymentForm
            : this.goToNextStep;
    action.call(this);
  }

  private setNextStepTitle() {
    switch (this.currentStep) {
      case 1:
        this.nextStepTitle = 'Security';
        break;
      case 2:
        this.nextStepTitle = 'Choose Plan';
        break;
      case 3:
        if (this.planName === 'free') {
          this.nextStepTitle = 'Create Account';
        } else {
          this.nextStepTitle = 'Address';
        }
        break;
      case 4:
        this.nextStepTitle = 'Payment Details';
        break;
      default:
        this.nextStepTitle = ''; // Set a default value if needed
        break;
    }
  }

  private goToNextStep = (): void => {
    this.currentStep++;
    this.updateNextButtonState();

    if (this.currentStep === 5) {
      this.loadBillsbyTokenizerScript()
        .then(() => {
          this.initTokenizer();
        })
        .catch((error) => {
          console.error('Failed to load Billsby tokenizer script:', error);
        });
    }

    if (this.currentStep === 3) {
      if (!this.planName) {
        this.planName = 'free';
      }
    }
  }

  private goToPrevStep = (): void => {
    this.currentStep--;
  }

  public submitData = (): void => {
    this.submissionProgress(true, "We're creating your account");

    if (this.signupForm.valid) {
      const userData = {
        ...this.signupForm.value,
        ...(this.cid && { cid: this.cid }),
        ...(this.sid && { sid: this.sid }),
        address: {
          ...this.addressForm.value
        },
        cardDetails: {
          ...this.cardDetailsForm.value
        }
      };

      if (this.planName) {
        userData['planName'] = this.planName;
      }

      this.businessUserService
        .createUser(userData)
        .pipe(
          tap(async (response: any) => {
            if (response && response.success !== false) {
              this.submissionProgress(true, "You're account created, redirecting to dashboard!");

              const user = response.data.user;
              user.token = response.data.token;

              this.businessUserService.storeUser(user);
              this.router.navigate(['/cms/dashboard']);
            }
          }),
          catchError((error) => {
            this.submissionProgress(true, "There is an error creating your account.");
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
      this.submissionProgress(true, "Credit Card Verified!");
      this.cardDetailsForm.patchValue({
        ...this.cardDetailsForm.value,
        paymentCardToken: pmData.token,
        last4Digits: pmData.last_four_digits,
        cardType: pmData.card_type
      });
      this.subscribeToPlan(token);
    };

    const logErrors = (errors: any) => {
      errors.forEach((error: any) => {
        this.submissionProgress(false, "Error verifying the credit card.");
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
    this.submissionProgress(true, "We're verifying your credit card");

    const { firstName, lastName } = this.signupForm.value;
    const { expiryMonth, expiryYear } = this.cardDetailsForm.value;
    const fullName = firstName + ' ' + lastName;

    const requiredFields: any = {};

    requiredFields["full_name"] = fullName;
    requiredFields["month"] = +expiryMonth;
    requiredFields["year"] = +expiryYear;

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

  private submissionProgress = (submitting: boolean, message: string) => {
    this.isSubmitting = submitting;
    this.submissionMessage = message;
    this.changeDetectorRef.detectChanges();
  }

  redirectToTerms() {
    window.open('/terms', '_blank');
  }
}
