import {Injectable} from '@angular/core';
import {Observable, Observer, Subject} from 'rxjs';
import {AnonymousSubject} from 'rxjs/internal/Subject';
import {map} from 'rxjs/operators';
import {XchaneAuthenticationService} from './xchane-auth-service.service';

const WS = 'ws://localhost:8081';

export interface Message {
  trigger: string,
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
    this.messages = (this.connect(WS + '/' + this.userId).pipe(map((response: MessageEvent): Message => {
      return JSON.parse(response.data);
    })) as Subject<Message>);
  }

  public connect(url: string): AnonymousSubject<MessageEvent> {
    if (!this.subject) {
      this.subject = this.create(url);
      console.log('Successfully connected: ' + url);
    }
    return this.subject;
  }

  private create(url: string): AnonymousSubject<MessageEvent> {
    const ws = new WebSocket(url);

    const observable = new Observable((obs: Observer<MessageEvent>) => {
      ws.onmessage = obs.next.bind(obs);
      ws.onerror = obs.error.bind(obs);
      ws.onclose = obs.complete.bind(obs);
      return ws.close.bind(ws);
    });

    const observer: any = {
      error: null, complete: null, // tslint:disable-next-line:ban-types
      next: (data: Object) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(data));
        }
      }
    };

    return new AnonymousSubject<MessageEvent>(observer, observable);
  }
}
