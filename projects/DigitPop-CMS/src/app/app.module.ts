import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler, InjectionToken } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LayoutModule } from '@angular/cdk/layout';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { ErrorInterceptor } from './shared/interceptors/error.interceptor';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { GlobalErrorHandlerService } from './globalErrorHandlerService';
import { MatStepperModule } from '@angular/material/stepper';
import { MaterialFileInputModule } from 'ngx-material-file-input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { TableVirtualScrollModule } from 'ng-table-virtual-scroll';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CustomHttpInterceptor } from './shared/interceptors/http.interceptor';
import { provideTokenizedHttpClient } from './shared/helpers/provider.config';
import { LoginComponent } from './login/login.component';
import { LogoutComponent } from './logout/logout.component';
import { HomeComponent } from './home/home.component';
import { RegisterComponent } from './register/register.component';
import { SafePipe } from './shared/pipes/SafePipe';
import { SharedModule } from './shared/shared.module';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { JwtInterceptor } from './cms/services/jwt.interceptor';
import { BillsbyInterceptor } from './cms/services/billsby.interceptor';
import {MatRadioModule} from '@angular/material/radio';
import { XchaneJwtInterceptor } from './xchane/services/xchane.jwt.interceptor';
import { AuthInterceptor } from './shared/interceptors/auth.interceptor';
import { ImagesLazyloadModule } from './shared/lazyload-imgs/lazyload.module';
import { SignupComponent } from './signup/signup.component';
import { VideosGridComponent } from './videos-grid/videos-grid.component';
import { QuizAnimationComponent } from './quiz-animation/quiz-animation.component';
import {MatTabsModule} from '@angular/material/tabs';
import { VisitorPopupComponent } from './visitor-popup/visitor-popup.component';
import { UserRewardsComponent } from './user-rewards/user-rewards.component';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';
import {XchaneModule} from './xchane/xchane.module';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { EmailVerificationComponent } from './email-verification/email-verification.component';
import { SubscriptionPlansComponent } from './subscription-plans/subscription-plans.component';
import { SubscribeComponent } from './subscribe/subscribe.component';
import { TermsOfServiceComponent } from './terms-of-service/terms-of-service.component';

export const HTTP_CMS_AUTH = new InjectionToken('http_cms_auth');
export const HTTP_XCHANE_AUTH = new InjectionToken('http_xchane_auth');
export const HTTP_BILLS = new InjectionToken('http_bills');
export const HTTP_NO_INTERCEPTORS = new InjectionToken('http_no_interceptors');

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    HomeComponent,
    LogoutComponent,
    SignupComponent,
    VideosGridComponent,
    QuizAnimationComponent,
    VisitorPopupComponent,
    UserRewardsComponent,
    UserDashboardComponent,
    EmailVerificationComponent,
    SubscriptionPlansComponent,
    SubscribeComponent,
    TermsOfServiceComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    LayoutModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatInputModule,
    MatTableModule,
    FlexLayoutModule,
    FormsModule,
    MatDialogModule,
    FormsModule,
    ReactiveFormsModule,
    MatGridListModule,
    MatCardModule,
    MatMenuModule,
    MatPaginatorModule,
    MatSortModule,
    MatTooltipModule,
    MatStepperModule,
    MaterialFileInputModule,
    MatProgressBarModule,
    MatSelectModule,
    TableVirtualScrollModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    SharedModule,
    HttpClientModule,
    MatRadioModule,
    ImagesLazyloadModule,
    MatTabsModule,
    SharedModule,
    XchaneModule,
    MatCheckboxModule,
  ],
  providers: [
    provideTokenizedHttpClient(HTTP_BILLS, { excludes: [JwtInterceptor, XchaneJwtInterceptor] }),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: BillsbyInterceptor,
      multi: true,
    },
    provideTokenizedHttpClient(HTTP_BILLS, { excludes: [JwtInterceptor, XchaneJwtInterceptor] }),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    provideTokenizedHttpClient(HTTP_XCHANE_AUTH, { excludes: [JwtInterceptor, BillsbyInterceptor] }),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: XchaneJwtInterceptor,
      multi: true,
    },
    provideTokenizedHttpClient(HTTP_CMS_AUTH, { excludes: [XchaneJwtInterceptor, BillsbyInterceptor] }),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true,
    },
    provideTokenizedHttpClient(HTTP_NO_INTERCEPTORS, { excludes: [XchaneJwtInterceptor, JwtInterceptor, BillsbyInterceptor] }),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CustomHttpInterceptor,
      multi: true,
    },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CustomHttpInterceptor,
      multi: true,
    },
    { provide: ErrorHandler, useClass: GlobalErrorHandlerService }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
