import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { Router } from '@angular/router';

interface StudentProgress {
  studentName: string;
  action: string;
  time: string;
  icon: string;
  type: 'game' | 'test' | 'achievement';
}

@Component({
  selector: 'app-landing-profesores',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatMenuModule
  ],
  templateUrl: './landing-profesores.component.html',
  styleUrl: './landing-profesores.component.css'
})
export class LandingProfesoresComponent {
  notificationCount = 5; // Notificaciones de progreso de estudiantes
  studentProgressNotifications: StudentProgress[] = [];

  constructor(private router: Router) {
    this.loadStudentProgress();
  }
  loadStudentProgress(): void {
    // Simular notificaciones de progreso (luego vendrá del backend)
    this.studentProgressNotifications = [
      {
        studentName: 'María García',
        action: 'Completó el juego "Nutrición Balanceada"',
        time: 'Hace 5 min',
        icon: 'sports_esports',
        type: 'game'
      },
      {
        studentName: 'Carlos Mendoza',
        action: 'Obtuvo 95 puntos en test psicológico',
        time: 'Hace 15 min',
        icon: 'psychology',
        type: 'test'
      },
      {
        studentName: 'Ana Rodríguez',
        action: 'Desbloqueó logro "Alimentación Saludable"',
        time: 'Hace 30 min',
        icon: 'emoji_events',
        type: 'achievement'
      },
      {
        studentName: 'Luis Torres',
        action: 'Completó evaluación nutricional',
        time: 'Hace 1 hora',
        icon: 'assignment_turned_in',
        type: 'test'
      },
      {
        studentName: 'Sofia Vargas',
        action: 'Alcanzó 1000 puntos acumulados',
        time: 'Hace 2 horas',
        icon: 'stars',
        type: 'achievement'
      }
    ];
    this.notificationCount = this.studentProgressNotifications.length;
  }

  navigateToDashboards(): void {
    this.router.navigate(['/dashboards']);
  }

  navigateToMonitoring(): void {
    this.router.navigate(['/monitoreo']);
  }

  navigateToReports(): void {
    this.router.navigate(['/reportes']);
  }

  openProfile(): void {
    this.router.navigate(['/perfil']);
  }

  logout(): void {
    console.log('Logout');
    this.router.navigate(['/']);
  }
}