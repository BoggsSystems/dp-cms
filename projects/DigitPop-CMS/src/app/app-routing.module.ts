import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { EmailVerificationComponent } from './email-verification/email-verification.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { SignupRevampedComponent } from './signup-revamped/signup-revamped.component';
import { SubscribeComponent } from './subscribe/subscribe.component';
import { TermsOfServiceComponent } from './terms-of-service/terms-of-service.component';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';

import { AuthGuard } from './shared/guards/auth-guard.service';
import { NameGuard } from './shared/services/campaign.service';
import { UserRoleCheckResolver } from './shared/resolvers/user-role-check.resolver';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    component: HomeComponent,
    resolve: {
      userRoleCheck: UserRoleCheckResolver
    }
  },
  {
    path: 'dashboard',
    component: UserDashboardComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'verify',
    component: EmailVerificationComponent,
  },
  {
    path: 'subscribe',
    component: SubscribeComponent,
  },
  {
    path: 'cms',
    loadChildren: () => import('./cms/cms.module').then((m) => m.CMSModule)
  },
  {
    path: 'xchane',
    loadChildren: () => import('./xchane/xchane.module').then((m) => m.XchaneModule)
  },
  {
    path: 'register',
    component: RegisterComponent,
  },
  {
    path: 'signup',
    component: SignupRevampedComponent,
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'terms',
    component: TermsOfServiceComponent,
  },
  {
    path: '**',
    redirectTo: '/home',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard, NameGuard],
})
export class AppRoutingModule {}
