import { Component, DestroyRef, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { SettingsService } from '../../../../services/settings.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { DESCRIPTION_SELECTOR_TOKENS } from '../../../../constants/description-selector.constant';
import { BehaviorSubject } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-settings',
  imports: [
    InputTextModule,
    ReactiveFormsModule,
    DividerModule,
    ButtonModule,
    TooltipModule,
    AsyncPipe,
  ],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class Settings implements OnInit {
  protected readonly settingsForm = new FormGroup({
    descriptionSelector: new FormControl<string | null>(null, [
      Validators.pattern(
        `^.*${DESCRIPTION_SELECTOR_TOKENS.PBI}.+${DESCRIPTION_SELECTOR_TOKENS.DESCRIPTION}.*$|^.*${DESCRIPTION_SELECTOR_TOKENS.DESCRIPTION}.+${DESCRIPTION_SELECTOR_TOKENS.PBI}.*$`,
      ),
    ]),
  });

  private readonly _isUnsaved$ = new BehaviorSubject<boolean>(false);
  protected readonly isUnsaved$ = this._isUnsaved$.asObservable();

  constructor(
    private readonly settingsService: SettingsService,
    private readonly destroyRef: DestroyRef,
  ) {}

  public ngOnInit() {
    this.settingsService.settings$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((settings) => {
        if (settings) {
          this.settingsForm.setValue({ ...settings }, { emitEvent: false });
        }
      });

    this.settingsForm.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this._isUnsaved$.next(true);
      });
  }

  public saveSettings(): void {
    if (!this.settingsForm.valid) {
      return;
    }

    this.settingsService.updateSettings({
      descriptionSelector: this.settingsForm.value.descriptionSelector!,
    });
    this._isUnsaved$.next(false);
  }
}
