import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlCreationOptions } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { UserService } from '../services/user.service';

export const createAuthGuard = (
  commands: any[],
  navigationExtras?: UrlCreationOptions
): CanActivateFn => {
  return () => {
    const userService = inject(UserService);
    const router = inject(Router);

    return userService.isLoggedIn$.pipe(
      take(1),
      map((isLoggedIn) => {
        if (isLoggedIn) {
          return true;
        }

        return router.createUrlTree(commands, navigationExtras);
      })
    );
  };
};
