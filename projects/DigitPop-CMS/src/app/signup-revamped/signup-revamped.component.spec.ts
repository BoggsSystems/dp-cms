import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignupRevampedComponent } from './signup-revamped.component';

describe('SignupRevampedComponent', () => {
  let component: SignupRevampedComponent;
  let fixture: ComponentFixture<SignupRevampedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SignupRevampedComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SignupRevampedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
