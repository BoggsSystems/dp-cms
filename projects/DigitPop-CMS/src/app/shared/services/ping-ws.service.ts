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
        const pingMessage = { trigger: 'ping', value: Date.now() };
        this.websocketService.send(pingMessage);
        console.log(`Sent ping message at ${new Date()}:`, pingMessage);
      }
    }, 10000);
  }

  stopPinging(): void {
    clearInterval(this.intervalId);
  }
}
