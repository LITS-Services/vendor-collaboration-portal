import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';

export interface QuotationComment {
  quotationId: number;
  commentText: string;
  createdBy: string;
  createdByType: number;
  vendorCompanyId?: string;
  rfqNo: string;
}

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private hubConnection!: signalR.HubConnection;

  // Observable to push new comments to components
  public commentReceived = new BehaviorSubject<QuotationComment | null>(null);

  constructor() {}

  // Start the connection
  public startConnection(): void {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:7188//notification', { withCredentials: true }) // your API URL
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .then(() => console.log('SignalR connected'))
      .catch(err => console.error('SignalR connection error:', err));

    // Listen for server messages
    this.hubConnection.on('ReceiveComment', (data: QuotationComment) => {
      console.log('New comment received:', data);
      this.commentReceived.next(data);
    });
  }

  // Optional: Stop connection
  public stopConnection(): void {
    if (this.hubConnection) {
      this.hubConnection.stop().then(() => console.log('SignalR disconnected'));
    }
  }

  // Optional: Send message from frontend to server
  public sendMessage(receiverId: string, comment: QuotationComment) {
    this.hubConnection.invoke('SendMessage', receiverId, comment)
      .catch(err => console.error(err));
  }
}
