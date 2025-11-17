import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { Router } from '@angular/router';
import { StudentService } from '../../services/student.service';

@Component({
  selector: 'app-landing-alumnos',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatMenuModule,
  ],
  templateUrl: './landing-alumnos.component.html',
  styleUrls: ['./landing-alumnos.component.css'],
})
export class LandingAlumnosComponent {
  notificationCount = 0; // Cambiará según notificaciones reales
  notifications: any[] = []; // Array de notificaciones
  studentPoints = 0; // Puntos acumulados del alumno

  constructor(private router: Router, private studentService: StudentService) {
    this.loadNotifications();
    this.loadPuntos();
  }

  loadNotifications(): void {
    this.studentService.getMisNotificaciones().subscribe({
      next: (res) => {
        this.notifications = res?.data || [];
        this.notificationCount = this.notifications.length;
      },
      error: () => {
        this.notifications = [];
        this.notificationCount = 0;
      },
    });
  }

  loadPuntos(): void {
    this.studentService.getMisPuntos().subscribe({
      next: (res) => {
        this.studentPoints = res?.data ?? 0;
      },
      error: () => {
        this.studentPoints = 0;
      },
    });
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
