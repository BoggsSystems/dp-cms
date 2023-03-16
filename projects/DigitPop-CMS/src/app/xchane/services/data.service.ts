import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class DataService {
  private subjectName = new Subject<any>();
  private tourSubject = new Subject<any>();
  private notificationSubject = new BehaviorSubject<any>({displayNotification: true, message: 'Please, check your email for verification.'});

  constructor() {
  }

  updateUserCredit(points: number) {
    this.subjectName.next({points});
  }

  getUserCredit(): Observable<any> {
    return this.subjectName.asObservable();
  }

  setVideoTour(enabled: boolean) {
    this.tourSubject.next({enabled});
  }

  getVideoTour(): Observable<any> {
    return this.tourSubject.asObservable();
  }

  setNotification(displayNotification: boolean, notificationMessage: string) {
    this.notificationSubject.next({displayNotification, notificationMessage});
  }

  public get getNotification(): any {
    return this.notificationSubject.value;
  }
}
