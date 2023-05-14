import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'digit-pop-signup-revamped',
  templateUrl: './signup-revamped.component.html',
  styleUrls: ['./signup-revamped.component.scss']
})
export class SignupRevampedComponent implements OnInit {

  public signupForm: FormGroup;
  public currentStep = 1;

  constructor(private formBuilder: FormBuilder) {
    // Use FormBuilder to initialize the form
    this.signupForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
      agreeToTerms: [false, Validators.requiredTrue]
    });
  }

  ngOnInit(): void {
  }

  public goToNextStep(e: Event) {
    e.preventDefault();
    this.currentStep++;
  }

  public goToPrevStep() {
    this.currentStep--;
  }

}
