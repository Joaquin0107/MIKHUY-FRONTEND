import { Component, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
  styles: []
})
export class AppComponent {
  title = 'mikhuy';

  constructor(private authService: AuthService) {}

  @HostListener('document:click')
  @HostListener('document:keypress')
  onUserActivity(): void {
    if (this.authService.isLoggedIn() && !this.authService.isSessionExpired()) {
      this.authService.refreshSessionExpiry();
    }
  }
}