import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { createRedirectIfLoggedInGuard } from './guards/redirect-if-logged-in.guard';
import { Home } from './components/home/home';
import { createAuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: Login,
    canActivate: [createRedirectIfLoggedInGuard([''])],
  },
  {
    path: '',
    pathMatch: 'full',
    component: Home,
    canActivate: [createAuthGuard(['login'])],
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
