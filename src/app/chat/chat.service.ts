import { Injectable } from '@angular/core';
import { Chat, UsersChat } from './chat.model';

@Injectable()
export class ChatService {

  constructor() { }

  public chat3: Chat[] = [
    new Chat(
      true,
      '',
      [
        'Hi, I’m interested in registering my company as a vendor with your organization.',
        'Could you please guide me through the process?'
      ],
      'text'
    ),
    new Chat(
      false,
      '',
      [
        'Hello! Thank you for reaching out to the Procurement Department.',
        'We’d be happy to assist you with the vendor enrollment process.'
      ],
      'text'
    ),
    new Chat(
      false,
      '30 minutes ago',
      [
        'To get started, please provide your company details and business category.',
        'We’ll then send you a registration link to our vendor portal.'
      ],
      'text'
    ),
    new Chat(
      true,
      '1 hour ago',
      [
        'Sure. We are “Global Supplies Pvt Ltd.” and we specialize in industrial equipment.',
        'Looking forward to receiving the registration link.'
      ],
      'text'
    ),
    new Chat(
      false,
      '',
      [
        'Great, thanks!',
        'We’ve just emailed you the vendor registration link.',
        'Please complete the form and upload your compliance documents.'
      ],
      'text'
    ),
    new Chat(
      true,
      '',
      [
        'Received the email.',
        'I’ll fill it out and submit the required documents shortly.',
        'Appreciate your support!'
      ],
      'text'
    ),
  ];
  


  public usersChat: UsersChat[] = [
   
    {
      userId: "3",
      name: "Sarah Woods",
      avatar: "assets/img/portrait/small/avatar-s-8.png",
      lastChatTime: "2:14 AM",
      status: "away",
      isPinnedUser: false,
      isMuted: true,
      unreadMessageCount: "12",
      isActiveChat: true,
      lastChatMessage: "Hello John!",
      chats: this.chat3
    },
    
  ]





}
