import { Component } from '@angular/core';
import { UserService } from '../../services/user.service';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { MenuItem } from 'primeng/api';
import { AsyncPipe } from '@angular/common';
import { Router } from '@angular/router';
import { DrawerModule } from 'primeng/drawer';
import { Settings } from './components/settings/settings';

@Component({
  selector: 'app-header',
  imports: [MenuModule, ButtonModule, AsyncPipe, DrawerModule, Settings],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  protected readonly items: MenuItem[] = [
    {
      label: 'Settings',
      icon: 'pi pi-cog',
      command: () => {
        this.settingsIsOpen = true;
      },
    },
    {
      label: 'Logout',
      icon: 'pi pi-sign-out',
      command: () => {
        this.userService.logout();
        this.route.navigate(['/login']);
      },
    },
  ];

  protected settingsIsOpen = false;

  constructor(
    protected readonly userService: UserService,
    private readonly route: Router,
  ) {}
}
