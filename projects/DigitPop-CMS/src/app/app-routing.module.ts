import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';
import { EmailVerificationComponent } from './email-verification/email-verification.component';

import { AuthGuard } from './shared/guards/auth-guard.service';
import { NameGuard } from './shared/services/campaign.service';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    component: HomeComponent,
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
    canActivate: [AuthGuard],
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [AuthGuard],
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
