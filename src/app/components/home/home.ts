import { Component } from '@angular/core';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { ContentService } from '../../services/content.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [AsyncPipe],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  constructor(
    protected readonly contentService: ContentService,
    private readonly userService: UserService,
    private readonly router: Router
  ) {}

  protected logout() {
    this.userService.logout();
    this.router.navigate(['/login']);
  }
}
