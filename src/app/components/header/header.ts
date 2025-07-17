import { Component } from '@angular/core';
import { UserService } from '../../services/user.service';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { MenuItem } from 'primeng/api';
import { AsyncPipe } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [MenuModule, ButtonModule, AsyncPipe],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  protected readonly items: MenuItem[] = [
    {
      label: 'Logout',
      icon: 'pi pi-sign-out',
      command: () => {
        this.userService.logout();
        this.route.navigate(['/login']);
      },
    },
  ];

  constructor(
    protected readonly userService: UserService,
    private readonly route: Router,
  ) {}
}
