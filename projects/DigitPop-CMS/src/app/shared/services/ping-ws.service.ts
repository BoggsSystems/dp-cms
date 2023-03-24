import { Injectable } from '@angular/core';
import { WebsocketService, Message } from './websocket.service';

@Injectable({
  providedIn: 'root'
})
export class PingWsService {
  private intervalId: number;

  constructor(private websocketService: WebsocketService) {}

  startPinging(): void {
    this.intervalId = setInterval(() => {
      if (this.websocketService.isConnected()) {
        const message: Message = { trigger: 'ping', value: Date.now() };
        this.websocketService.send(message);
      }
    }, 10000);
  }

  stopPinging(): void {
    clearInterval(this.intervalId);
  }
}
