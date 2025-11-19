// src/app/components/landing-alumnos/landing-alumnos.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { StudentService, Notificacion } from '../../services/student.service';
import { AuthService } from '../../services/auth.service';
import { FloatingChatbotComponent } from '../floating-chatbot/floating-chatbot.component';

@Component({
  selector: 'app-landing-alumnos',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatMenuModule,
    MatTooltipModule,
    FloatingChatbotComponent
  ],
  templateUrl: './landing-alumnos.component.html',
  styleUrls: ['./landing-alumnos.component.css'],
})
export class LandingAlumnosComponent implements OnInit, OnDestroy {
  notificationCount = 0;
  notifications: Notificacion[] = [];
  studentPoints = 0;

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private studentService: StudentService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Verificar autenticación
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    // Suscribirse a los puntos en tiempo real
    this.studentService.puntos$
      .pipe(takeUntil(this.destroy$))
      .subscribe((puntos) => {
        this.studentPoints = puntos;
      });

    // Suscribirse a las notificaciones
    this.studentService.notificaciones$
      .pipe(takeUntil(this.destroy$))
      .subscribe((notificaciones) => {
        this.notifications = notificaciones;
        this.notificationCount = notificaciones.filter((n) => !n.leida).length;
      });

    // Cargar datos iniciales
    this.loadNotifications();
    this.loadPuntos();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadNotifications(): void {
    this.studentService.getMisNotificaciones().subscribe({
      error: (err) => {
        console.error('Error cargando notificaciones:', err);
      },
    });
  }

  loadPuntos(): void {
    this.studentService.getMisPuntos().subscribe({
      error: (err) => {
        console.error('Error cargando puntos:', err);
      },
    });
  }

  navigateToGames(): void {
    this.router.navigate(['/juegos']);
  }

  navigateToBenefits(): void {
    this.router.navigate(['/beneficios']);
  }

  openNotifications(): void {
    console.log('Opening notifications', this.notifications);
  }

  openProfile(): void {
    this.router.navigate(['/perfil']);
  }

  logout(): void {
    console.log('Logout');
    this.router.navigate(['/']);
  }

  /**
   * Obtener icono según el tipo de notificación
   */
  getNotificationIcon(tipo?: string): string {
    const iconMap: { [key: string]: string } = {
      juego: 'sports_esports',
      beneficio: 'card_giftcard',
      logro: 'emoji_events',
      recordatorio: 'alarm',
      mensaje: 'message',
      sistema: 'info',
    };
    return iconMap[tipo || 'mensaje'] || 'notifications';
  }

  /**
   * Formatear fecha a formato legible
   */
  formatearFecha(fecha: string): string {
    const ahora = new Date();
    const fechaNotif = new Date(fecha);
    const diffMs = ahora.getTime() - fechaNotif.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHoras = Math.floor(diffMins / 60);
    const diffDias = Math.floor(diffHoras / 24);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHoras < 24) return `Hace ${diffHoras} h`;
    if (diffDias === 1) return 'Ayer';
    if (diffDias < 7) return `Hace ${diffDias} días`;

    return fechaNotif.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
    });
  }
}
