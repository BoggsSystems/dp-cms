import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {NameGuard} from './shared/services/campaign.service';
import {RegisterComponent} from './register/register.component';
import {HomeComponent} from './home/home.component';
import {AuthGuard} from './shared/guards/auth-guard.service';
import {LoginComponent} from './login/login.component';
import {
  UserDashboardComponent
} from './user-dashboard/user-dashboard.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'dashboard',
    component: UserDashboardComponent
  },
  {
    path: 'verify',
    component: HomeComponent
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
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'home',
    component: HomeComponent,
  },
  {
    path: 'register',
    component: RegisterComponent,
  },
  {path: '**', redirectTo: ''},
];
export const appRoutingModule = RouterModule.forRoot(routes);

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: false})],
  exports: [RouterModule],
  providers: [NameGuard],
})
export class AppRoutingModule {
}
