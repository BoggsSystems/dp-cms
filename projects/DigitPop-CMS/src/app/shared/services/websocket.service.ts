import {Injectable} from '@angular/core';
import {Observable, Observer, Subject} from 'rxjs';
import {AnonymousSubject} from 'rxjs/internal/Subject';
import {map} from 'rxjs/operators';
import {XchaneAuthenticationService} from './xchane-auth-service.service';
import {environment} from '../../../environments/environment';

export interface Message {
  trigger: string;
  value: any;
}

const WS = environment.websocketURL;

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  public messages: Subject<Message> = new Subject<Message>();
  private userId = '';
  private subject: AnonymousSubject<MessageEvent>;
  private intervalId: number;

  constructor(
    private auth: XchaneAuthenticationService,
  ) {
    if (this.auth.currentUserValue && this.auth.currentUserValue._id) {
      this.userId = this.auth.currentUserValue._id;
    }

    this.connect(WS + '/' + this.userId).pipe(
      map((response: MessageEvent): Message => {
        return JSON.parse(response.data);
      })
    ).subscribe((message: Message) => {
      this.messages.next(message);
    });

    this.startPinging();
  }

  public connect(url: string): AnonymousSubject<MessageEvent> {
    if (this.isConnected()) {
      this.subject.complete();
    }

    if (!this.subject) {
      this.subject = this.create(url);
    }

    return this.subject;
  }

  public disconnect(): void {
    if (this.subject) {
      this.subject.complete();
      this.subject = null;
    }
  }

  public isConnected(): boolean {
    return this.subject && !this.subject.closed;
  }

  public send(message: Message): void {
    if (this.isConnected()) {
      this.subject.next({data: JSON.stringify(message)} as MessageEvent);
    }
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
      error: null,
      complete: null,
      next: (data: Object) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(data));
        }
      }
    };

    ws.onclose = () => {
      this.stopPinging();
    };

    return new AnonymousSubject<MessageEvent>(observer, observable);
  }

  private startPinging(): void {
    this.intervalId = setInterval(() => {
      if (this.isConnected()) {
        this.send({trigger: 'ping', value: Date.now()});
      }
    }, 10000);
  }

  private stopPinging(): void {
    clearInterval(this.intervalId);
  }
}
