import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from './material.module';
import { RouterLink, RouterModule, RouterOutlet } from '@angular/router';

@NgModule({
  imports: [
    RouterOutlet,
    RouterLink,
    RouterModule,
    ReactiveFormsModule,
    MaterialModule
  ],
  exports: [
    RouterOutlet,
    RouterLink,
    RouterModule,
    ReactiveFormsModule,
    MaterialModule
  ]
})
export class AppModule { }
