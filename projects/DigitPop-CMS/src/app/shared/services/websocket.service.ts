import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Observer, Subject } from 'rxjs';
import { AnonymousSubject } from 'rxjs/internal/Subject';
import { map } from 'rxjs/operators';
import { XchaneAuthenticationService } from './xchane-auth-service.service';
import { environment } from '../../../environments/environment';
import { PingWsService } from './ping-ws.service';

export interface Message {
  trigger: string;
  value: any;
}

const WS = environment.websocketURL;

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private userId = '';
  private subject: AnonymousSubject<MessageEvent>;
  public messages: Subject<Message> = new Subject<Message>();

  constructor(
    private auth: XchaneAuthenticationService,
    private pingService: PingWsService
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

    this.pingService.startPinging();
  }

  public connect(url: string): AnonymousSubject<MessageEvent> {
    if (!this.subject) {
      this.subject = this.create(url);
    }
    return this.subject;
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
      this.pingService.stopPinging();
    };

    return new AnonymousSubject<MessageEvent>(observer, observable);
  }
}
