import { Component, OnInit } from '@angular/core';
import { MaterialModule } from '../material.module';
import { AppModule } from '../app.module';
import { FormControl, FormGroup, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { SettingsHttpService } from '../services/settings.service';
import { CommonModule } from '@angular/common';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    MaterialModule,
    AppModule,
    CommonModule
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {
  form = new FormGroup({
    webhookProxyUrl: new FormControl('', [
      Validators.required,
      // any https or http url
      Validators.pattern(/^(https?:\/\/)[^\s/$.?#].[^\s]*$/) // Matches HTTP and HTTPS URLs, but not FTP
    ]),
    webhookSecret: new FormControl('', []),
    appId: new FormControl('', [
      Validators.required,
      Validators.pattern(/^\d+$/),
      Validators.minLength(7),
      Validators.maxLength(7)
    ]),
    privateKey: new FormControl('', [
      Validators.required,
      Validators.pattern(/-----BEGIN RSA PRIVATE KEY-----\n(?:.|\n)+\n-----END RSA PRIVATE KEY-----\n?/), // Matches only valid private keys
    ]),
  });

  matcher = new MyErrorStateMatcher();

  constructor(
    private settingsService: SettingsHttpService
  ) { }

  ngOnInit() {
    this.settingsService.getAllSettings().subscribe((settings) => {
      console.log(settings);
      this.form.setValue({
        webhookProxyUrl: settings.webhookProxyUrl || '',
        webhookSecret: settings.webhookSecret || '',
        appId: settings.appId || '',
        privateKey: settings.privateKey || ''
      });
    });
  }

  onSubmit() {
    this.settingsService.createSettings(this.form.value).subscribe((response) => {
      console.log(response);
    });
  }
}
