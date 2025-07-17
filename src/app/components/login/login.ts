import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { BehaviorSubject, take } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { FloatLabelModule } from 'primeng/floatlabel';
import { FluidModule } from 'primeng/fluid';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-login',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    FloatLabelModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    CardModule,
    FluidModule,
    AsyncPipe,
    MessageModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  protected readonly loginForm = new FormGroup({
    email: new FormControl<string | null>(null, [Validators.required]),
    password: new FormControl<string | null>(null, [Validators.required]),
  });

  private readonly _loginError$ = new BehaviorSubject<string | null>(null);
  protected readonly loginError$ = this._loginError$.asObservable();

  private readonly _isLoading$ = new BehaviorSubject<boolean>(false);
  protected readonly isLoading$ = this._isLoading$.asObservable();

  constructor(
    private readonly userService: UserService,
    private readonly router: Router,
  ) {}

  protected login() {
    this._loginError$.next(null);

    if (!this.loginForm.valid) {
      return;
    }

    const data = this.loginForm.value;
    if (!data.email || !data.password) return;

    this._isLoading$.next(true);
    this.userService
      .login(data.email, data.password)
      .pipe(take(1))
      .subscribe((result) => {
        console.log(result);
        if (result.success) {
          this.router.navigate(['']);
        } else {
          this._loginError$.next(result.error);
        }
        this._isLoading$.next(false);
      });
  }
}
