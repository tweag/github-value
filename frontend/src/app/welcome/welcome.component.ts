import { Component } from '@angular/core';
import { MaterialModule } from '../material.module';
``
@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [
    MaterialModule
  ],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.scss'
})
export class WelcomeComponent {
  // Manifest Parameters: https://docs.github.com/en/apps/sharing-github-apps/registering-a-github-app-from-a-manifest#github-app-manifest-parameters
  manifest = {
    "name": "GitHub Value",
    "url": "https://www.example.com",
    "hook_attributes": {
      "url": "https://example.com/github/events",
    },
    "redirect_url": `${window.location.origin}/settings`,
    // "callback_urls": [
    //   "https://example.com/callback"
    // ],
    "public": false,
    "default_permissions": {
      "pull_requests": "write"
    },
    "default_events": [
      "pull_request"
    ]
  };
  manifestString: string;

  constructor() {
    this.manifestString = JSON.stringify(this.manifest);
  }
}
