import { Component } from '@angular/core';
import { UserService } from '../../services/user.service';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { MenuItem, PrimeIcons } from 'primeng/api';
import { AsyncPipe } from '@angular/common';
import { Router } from '@angular/router';
import { DrawerModule } from 'primeng/drawer';
import { Settings } from './components/settings/settings';
import { ConfigService } from '../../services/config.service';

@Component({
  selector: 'app-header',
  imports: [MenuModule, ButtonModule, AsyncPipe, DrawerModule, Settings],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  protected readonly items: MenuItem[] = [];

  protected settingsIsOpen = false;

  constructor(
    route: Router,
    configService: ConfigService,
    protected readonly userService: UserService,
  ) {
    this.items = [
      {
        label: configService.currentConfig.version,
        items: [
          {
            label: 'Settings',
            icon: PrimeIcons.COG,
            command: () => {
              this.settingsIsOpen = true;
            },
          },
          {
            label: 'Logout',
            icon: PrimeIcons.SIGN_OUT,
            command: () => {
              userService.logout();
              route.navigate(['/login']);
            },
          },
        ],
      },
    ];
  }

  protected readonly PrimeIcons = PrimeIcons;
}
