import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthenticationService } from '../services/auth-service.service';
import { MatDialog } from '@angular/material/dialog';
import { LoginComponent } from '../../login/login.component';
import {
  XchaneAuthenticationService
} from '../services/xchane-auth-service.service';

@Injectable({ providedIn: 'root' })
/**
 * The AuthGuard service checks if a user is authorized to access a route.
 */
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private xAuthenticationService: XchaneAuthenticationService,
    private authenticationService: AuthenticationService,
    private dialog: MatDialog
  ) {}

  /**
   * This method checks if the user is authorized to access a route.
   * If the user is not authorized, it opens a login modal and redirects the user to the home page.
   * @param route The route to be activated
   * @param state The router state snapshot
   * @returns A boolean value indicating whether the user is authorized
   */
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const currentUser = this.xAuthenticationService.currentUserValue || this.authenticationService.currentUserValue;
    if (currentUser) {
      if (route.data.roles && route.data.roles.indexOf(currentUser.role) === -1) {
        this.router.navigate(['/']);
        return false;
      }

      return true;
    }

    this.dialog.open(LoginComponent, {
      panelClass: 'dpop-modal'
    });

    this.router.navigate(['/home']);
    return false;
  }
}
