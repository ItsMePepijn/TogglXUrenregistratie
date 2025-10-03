import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-message',
  imports: [],
  templateUrl: './message.html',
  styleUrl: './message.scss',
})
export class Message {
  @Input() message: string | null = null;
  @Input({ required: true }) icon!: string;
}
