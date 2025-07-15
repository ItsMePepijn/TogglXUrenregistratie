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

@Component({
  selector: 'app-login',
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  protected readonly form = new FormGroup({
    email: new FormControl<string | null>(null, [Validators.required]),
    password: new FormControl<string | null>(null, [Validators.required]),
  });

  constructor(
    private readonly userService: UserService,
    private readonly router: Router
  ) {}

  protected login() {
    if (!this.form.valid) {
      return;
    }
    this.userService
      .login(this.form.value.email!, this.form.value.password!)
      .subscribe((success) => {
        if (success) {
          this.router.navigate(['']);
        }
      });
  }
}
