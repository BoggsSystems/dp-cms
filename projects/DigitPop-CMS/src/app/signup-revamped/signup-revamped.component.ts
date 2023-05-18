import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BusinessUserService } from '../shared/services/accounts/business-user.service';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'digit-pop-signup-revamped',
  templateUrl: './signup-revamped.component.html',
  styleUrls: ['./signup-revamped.component.scss'],
})
export class SignupRevampedComponent implements OnInit {
  @Input() fromQuiz = false;
  @Input() fromPlans = false;
  @Input() fromSubscribe = false;
  @Input() campaignId!: string;
  @Input() projectId!: string;
  @Input() cid!: string;
  @Input() sid!: string;

  public signupForm!: FormGroup;
  public currentStep = 1;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private businessUserService: BusinessUserService
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

  ngOnInit(): void { }

  private extractNavigationExtras(): void {
    const nav = this.router.getCurrentNavigation();
    const { cid, sid } = nav?.extras?.state || {};

    const updateValues = (value: { cid: string; sid: string }): void => {
      this.cid = value.cid;
      this.sid = value.sid;
    };

    updateValues({ cid, sid });
  }

  public handleButtonClick(e: Event): void {
    e.preventDefault();
    const action = this.currentStep < 3 ? this.goToNextStep : this.submitData;
    action.call(this);
  }

  public goToNextStep(): void {
    this.currentStep++;
  }

  public goToPrevStep(): void {
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
              return this.router.navigate(['/home']);
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
