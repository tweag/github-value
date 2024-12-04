import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThousandSeparatorPipe } from './thousand-separator.pipe'; // Adjust the path as necessary

@NgModule({
  declarations: [ThousandSeparatorPipe],
  imports: [CommonModule],
  exports: [ThousandSeparatorPipe]
})
export class SharedModule { }