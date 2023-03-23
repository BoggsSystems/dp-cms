import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, Observer, Subject} from 'rxjs';
import {AnonymousSubject} from 'rxjs/internal/Subject';
import {map} from 'rxjs/operators';
import {XchaneAuthenticationService} from './xchane-auth-service.service';
import {environment} from '../../../environments/environment';

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

    this.messages = (this.connect(WS + '/' + this.userId).pipe(map((response: MessageEvent): Message => {
      console.log(JSON.parse(response.data));
      return JSON.parse(response.data);
    })) as BehaviorSubject<Message>);
  }

  public connect(url: string): AnonymousSubject<MessageEvent> {
    if (!this.subject) {
      this.subject = this.create(url);
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

    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ trigger: 'ping', value: Date.now() }));
      }
    }, 10000);

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.trigger === 'ping') {
        ws.send(JSON.stringify({ trigger: 'pong', value: message.value }));
      }
    };

    ws.onclose = () => {
      clearInterval(pingInterval);
    };

    return new AnonymousSubject<MessageEvent>(observer, observable);
  }
}
