import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing-alumnos',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatMenuModule
  ],
  templateUrl: './landing-alumnos.component.html',
  styleUrls: ['./landing-alumnos.component.css']
})
export class LandingAlumnosComponent {
  notificationCount = 0; // Cambiará según notificaciones reales
  notifications: any[] = []; // Array de notificaciones
  studentPoints = 1250; // Puntos acumulados del alumno

  constructor(private router: Router) {
    // Simular carga de notificaciones (luego vendrá del backend)
    this.loadNotifications();
  }

  loadNotifications(): void {
    // Aquí se cargarán las notificaciones reales desde el backend
    // Por ahora está vacío para mostrar "No tienes notificaciones"
    this.notifications = [];
    this.notificationCount = this.notifications.length;
  }

  navigateToGames(): void {
    this.router.navigate(['/juegos']);
  }

  navigateToBenefits(): void {
    this.router.navigate(['/beneficios']);
  }

  navigateToChatbot(): void {
    this.router.navigate(['/chatbot']);
  }

  openNotifications(): void {
    console.log('Opening notifications');
  }

  openProfile(): void {
    this.router.navigate(['/perfil']);
  }

  logout(): void {
    // Limpiar sesión
    sessionStorage.clear();
    console.log('Logout');
    this.router.navigate(['/']);
  }
}
