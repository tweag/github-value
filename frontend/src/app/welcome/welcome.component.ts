import { Component, ElementRef, ViewChild } from '@angular/core';
import { MaterialModule } from '../material.module';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { SetupService } from '../services/setup.service';
``
@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [
    MaterialModule,
    ReactiveFormsModule
  ],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.scss'
})
export class WelcomeComponent {
  // Manifest Parameters: https://docs.github.com/en/apps/sharing-github-apps/registering-a-github-app-from-a-manifest#github-app-manifest-parameters
  @ViewChild('form') form!: ElementRef<HTMLFormElement>;
  formAction: string = 'https://github.com/organizations/ORGANIZATION/settings/apps/new?state=abc123';
  manifest = {};
  manifestString: string;
  organizationFormControl = new FormControl('', []);

  constructor(
    private setupService: SetupService
  ) {
    this.manifestString = JSON.stringify(this.manifest);
    this.setupService.getManifest().subscribe((manifest: any) => {
      this.manifestString = JSON.stringify(manifest);
      console.log('manifest', manifest);
    });
  }

  onSubmit() {
    this.form.nativeElement.action = `https://github.com/organizations/${this.organizationFormControl.value}/settings/apps/new?state=abc123`
    this.form.nativeElement.submit();
  }
}
