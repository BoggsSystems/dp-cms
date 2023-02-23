import {Injectable} from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import {AuthenticationService} from '../services/auth-service.service';

@Injectable({providedIn: 'root'})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private authenticationService: AuthenticationService
  ) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

    return true;
    // const currentUser = this.authenticationService.currentUserValue;
    // if (currentUser) {
    //     // check if route is restricted by role
    //     if (route.data.roles && route.data.roles.indexOf(currentUser.role) === -1) {
    //         // role not authorised so redirect to home page
    //         this.router.navigate(['/']);
    //         return false;
    //     }

    //     // authorised so return true
    //     return true;
    // }

    // // not logged in so redirect to login page with the return url
    // //this.router.navigate(['/home'], { queryParams: { returnUrl: state.url } });
    // return false;
  }
}
