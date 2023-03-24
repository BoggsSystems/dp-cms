import { Injectable } from '@angular/core';
import { WebsocketService } from './websocket.service';

@Injectable({
  providedIn: 'root'
})
export class PingWsService {
  private intervalId: number;

  constructor(private websocketService: WebsocketService) {}

  startPinging(): void {
    this.intervalId = setInterval(() => {
      if (this.websocketService.isConnected()) {
        this.websocketService.send({ trigger: 'ping', value: Date.now() });
      }
    }, 10000);
  }

  stopPinging(): void {
    clearInterval(this.intervalId);
  }
}
