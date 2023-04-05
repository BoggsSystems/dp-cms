/**
 * Service to manage data related to user credit, video tour, notifications and login state.
 */
import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private creditsSubject = new Subject<any>(); // Subject for user credit updates.
  private tourSubject = new Subject<any>(); // Subject for video tour updates.
  private loginSubject = new Subject<any>(); // Subject for login state updates.
  private verifiedSubject = new Subject<any>(); // Subject for login state updates.
  private notificationSubject = new BehaviorSubject<any>({ // BehaviorSubject for notification updates.
    displayNotification: true,
    message: 'Please, check your email for verification.'
  });

  constructor() {
  }

  /**
   * Get the current notification value.
   */
  public get getNotification(): any {
    return this.notificationSubject.value;
  }

  /**
   * Update user credit points.
   * @param points - The updated credit points.
   */
  updateUserCredit(points: number): void {
    this.creditsSubject.next({points});
  }

  /**
   * Get an Observable for user credit updates.
   */
  getUserCredit(): Observable<any> {
    return this.creditsSubject.asObservable();
  }

  /**
   * Set video tour enabled status.
   * @param enabled - The updated video tour enabled status.
   */
  setVideoTour(enabled: boolean): void {
    this.tourSubject.next({enabled});
  }

  /**
   * Set notification display and message.
   * @param displayNotification - The updated display notification status.
   * @param notificationMessage - The updated notification message.
   */
  setNotification(displayNotification: boolean, notificationMessage: string): void {
    this.notificationSubject.next({displayNotification, notificationMessage});
  }

  /**
   * Set login state.
   * @param loggedIn - The updated login state.
   */
  setLogin(loggedIn: boolean = false): void {
    this.loginSubject.next({loggedIn});
  }

  /**
   * Get an Observable for login state updates.
   */
  getLogin(): Observable<any> {
    return this.loginSubject.asObservable();
  }

  /**
   * Set verified state.
   * @param verified - The updated verified state.
   */
  setVerified(verified: boolean = false): void {
    this.verifiedSubject.next(verified);
  }

  /**
   * Get an Observable for verified state updates.
   */
  getVerified(): Observable<any> {
    return this.verifiedSubject.asObservable();
  }
}
