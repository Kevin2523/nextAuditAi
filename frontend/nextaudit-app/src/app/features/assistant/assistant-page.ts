import { Component } from '@angular/core';
import { Assistant } from './assistant';

@Component({
  selector: 'app-assistant-page',
  standalone: true,
  imports: [Assistant],
  template: '<app-assistant class="block h-full"></app-assistant>',
  styles: [`
    :host {
      display: block;
      height: calc(100vh - 72px - 64px - 60px);
      min-height: 620px;
    }
  `]
})
export class AssistantPage {}
