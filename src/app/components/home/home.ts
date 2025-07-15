import { Component } from '@angular/core';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  constructor(
    private readonly userService: UserService,
    private readonly router: Router
  ) {}

  protected logout() {
    this.userService.logout();
    this.router.navigate(['/login']);
  }
}
