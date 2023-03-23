import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Observer, Subject } from 'rxjs';
import { AnonymousSubject } from 'rxjs/internal/Subject';
import {map, share} from 'rxjs/operators';
import { XchaneAuthenticationService } from './xchane-auth-service.service';
import { environment } from '../../../environments/environment';

const WS = environment.websocketURL;

export interface Message {
  trigger: string;
  value: any;
}

@Injectable()
export class WebsocketService {
  public messages: Subject<Message>;
  private userId = '';
  private subject: AnonymousSubject<MessageEvent>;

  constructor(private auth: XchaneAuthenticationService) {
    if (this.auth.currentUserValue && this.auth.currentUserValue._id) {
      this.userId = this.auth.currentUserValue._id;
    }

    this.connect(WS + '/' + this.userId, 'parent-protocol').subscribe();
  }

  public connect(url: string, protocol: string): Observable<Message> {
    const ws = new WebSocket(url, protocol);

    const observable = new Observable<Message>((obs: Observer<Message>) => {
      ws.onmessage = (event) => obs.next(JSON.parse(event.data));
      ws.onerror = (event) => obs.error(event);
      ws.onclose = (event) => obs.complete();
      return () => {
        if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
          ws.close();
        }
      }
    });

    const observer: any = {
      error: null, complete: null, // tslint:disable-next-line:ban-types
      next: (data: Object) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(data));
        }
      }
    };

    return Subject.create(observer, observable).pipe(share());
  }
}
