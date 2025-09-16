import { Component, DestroyRef, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { BehaviorSubject, filter, map, switchMap, take, tap } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { FloatLabelModule } from 'primeng/floatlabel';
import { FluidModule } from 'primeng/fluid';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
export class Login implements OnInit {
  protected readonly loginForm = new FormGroup({
    email: new FormControl<string | null>(null),
    password: new FormControl<string | null>(null),
    token: new FormControl<string | null>(null),
  });

  private readonly _loginError$ = new BehaviorSubject<string | null>(null);
  protected readonly loginError$ = this._loginError$.asObservable();

  private readonly _isLoading$ = new BehaviorSubject<boolean>(false);
  protected readonly isLoading$ = this._isLoading$.asObservable();

  private readonly _useToken$ = new BehaviorSubject<boolean>(false);
  protected readonly useToken$ = this._useToken$.asObservable();

  constructor(
    private readonly userService: UserService,
    private readonly router: Router,
    private readonly destroyRef: DestroyRef,
  ) {}

  public ngOnInit() {
    this.useToken$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((useToken) => {
        if (useToken) {
          this.loginForm.controls.token.setValidators([Validators.required]);
          this.loginForm.controls.email.clearValidators();
          this.loginForm.controls.password.clearValidators();
        } else {
          this.loginForm.controls.token.clearValidators();
          this.loginForm.controls.email.setValidators([Validators.required]);
          this.loginForm.controls.password.setValidators([Validators.required]);
        }

        this.loginForm.controls.token.updateValueAndValidity();
        this.loginForm.controls.email.updateValueAndValidity();
        this.loginForm.controls.password.updateValueAndValidity();
      });
  }

  protected setUseToken(useToken: boolean) {
    this._useToken$.next(useToken);
  }

  protected login() {
    this._loginError$.next(null);

    if (!this.loginForm.valid) {
      return;
    }

    this.useToken$
      .pipe(
        take(1),
        map((useToken) => {
          const data = this.loginForm.value;

          return useToken
            ? {
                email: data.token ?? null,
                password: 'api_token',
              }
            : {
                email: data.email ?? null,
                password: data.password ?? null,
              };
        }),
        filter((data) => data.email !== null && data.password !== null),
        tap(() => {
          this._isLoading$.next(true);
        }),
        switchMap((data) => {
          return this.userService.login(data.email!, data.password!);
        }),
      )
      .subscribe((result) => {
        if (result.success) {
          this.router.navigate(['']);
        } else {
          this._loginError$.next(result.error);
        }
        this._isLoading$.next(false);
      });
  }
}
