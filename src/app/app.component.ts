import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  template: `
    <router-outlet></router-outlet>

    <!-- Overlay sin conexión -->
    <div class="offline-overlay" *ngIf="!isOnline">
      <div class="offline-card">
        <div class="offline-icon">📡</div>
        <h2>Sin conexión a internet</h2>
        <p>Verifica tu conexión Wi-Fi o datos móviles. Algunas funciones de MIKHUY no estarán disponibles hasta que se restablezca la conexión.</p>
      </div>
    </div>
  `,
  styles: [`
    .offline-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 99999;
      backdrop-filter: blur(3px);
      font-family: 'Poppins', sans-serif;
    }
    .offline-card {
      background: white;
      border-radius: 20px;
      padding: 2.5rem 2rem;
      max-width: 380px;
      width: 90%;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }
    .offline-icon {
      font-size: 3.5rem;
      margin-bottom: 1rem;
    }
    .offline-card h2 {
      margin: 0 0 0.75rem;
      font-size: 1.3rem;
      color: #d32f2f;
      font-weight: 700;
    }
    .offline-card p {
      margin: 0;
      font-size: 0.9rem;
      color: #555;
      line-height: 1.5;
    }
  `]
})
export class AppComponent {
  title = 'mikhuy';
  isOnline = navigator.onLine;

  constructor(private authService: AuthService) {}

  @HostListener('window:online')
  onOnline(): void {
    this.isOnline = true;
  }

  @HostListener('window:offline')
  onOffline(): void {
    this.isOnline = false;
  }

  @HostListener('document:click')
  @HostListener('document:keypress')
  onUserActivity(): void {
    if (this.authService.isLoggedIn() && !this.authService.isSessionExpired()) {
      this.authService.refreshSessionExpiry();
    }
  }
}