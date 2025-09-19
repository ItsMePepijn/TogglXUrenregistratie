import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-message',
  imports: [],
  templateUrl: './message.html',
  styleUrl: './message.scss',
})
export class Message {
  @Input({ required: true }) message: string = '';
  @Input({ required: true }) icon: string = '';
}
