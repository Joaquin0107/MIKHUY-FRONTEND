import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';

import { AuthService } from '../../services/auth.service';
import { JuegosService, JuegoResponse } from '../../services/juego.service';
import { StudentService } from '../../services/student.service';
import { GamePlayDialog } from '../game-play-dialog/game-play-dialog.component';
import { RankingInlineDialog } from '../ranking-dialog/ranking-dialog.component';
@Component({
  selector: 'app-juegos',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDialogModule,
    MatProgressBarModule,
    MatBadgeModule,
    MatMenuModule,
  ],
  templateUrl: './juegos.component.html',
  styleUrls: ['./juegos.component.css'],
})
export class JuegosComponent implements OnInit, OnDestroy {
  juegos: JuegoResponse[] = [];
  studentPoints: number = 0;
  notificationCount: number = 0;
  loading: boolean = false;

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private authService: AuthService,
    private juegosService: JuegosService,
    private studentService: StudentService
  ) {}

  ngOnInit(): void {
    if (!this.authService.getToken()) {
      console.warn('No hay token, redirigiendo a login');
      this.router.navigate(['/login']);
      return;
    }

    // Suscribirse a los puntos en tiempo real
    this.studentService.puntos$
      .pipe(takeUntil(this.destroy$))
      .subscribe(puntos => {
        this.studentPoints = puntos;
      });

    this.loadJuegos();
    this.loadStudentInfo();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadJuegos(): void {
    this.loading = true;

    this.juegosService.getMisJuegos().subscribe({
      next: (response) => {
        if (response.success) {
          this.juegos = response.data.map((juego) => ({
            ...juego,
            title: juego.nombre,
            subtitle: juego.categoria,
            description: juego.descripcion,
            image: juego.image || this.getDefaultImage(juego.categoria),
          }));

          this.notificationCount = this.calcularNotificaciones(this.juegos);
        } else {
          console.error('Error en respuesta:', response.message);
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando juegos:', err);
        this.loading = false;
        if (err.status === 401) {
          alert('Sesión expirada. Por favor inicia sesión nuevamente.');
          this.logout();
        }
      },
    });
  }

  calcularNotificaciones(juegos: JuegoResponse[]): number {
    return juegos.filter(
      (j) =>
        !j.vecesJugado ||
        j.vecesJugado === 0 ||
        (j.nivelActual && j.nivelActual < j.maxNiveles)
    ).length;
  }

  loadStudentInfo(): void {
    this.studentService.getMisPuntos().subscribe({
      error: (err) => {
        console.error('Error cargando puntos:', err);
      }
    });
  }

  getDefaultImage(categoria: string): string {
    const imageMap: { [key: string]: string } = {
      Nutrición: 'assets/images/desafio.png',
      Ejercicio: 'assets/images/reto7.png',
      Bienestar: 'assets/images/coach.png',
    };
    return imageMap[categoria] || 'assets/images/reto7.png';
  }

  getProgressPercent(juego: JuegoResponse): number {
    if (!juego.maxNiveles) return 0;
    const nivel = juego.nivelActual || 0;
    return (nivel / juego.maxNiveles) * 100;
  }

  jugar(juego: JuegoResponse): void {
    const nivelAJugar = juego.nivelActual || 1;

    const dialogRef = this.dialog.open(GamePlayDialog, {
      width: '90vw',
      maxWidth: '1200px',
      height: '85vh',
      data: {
        juego: juego,
        nivelAJugar: nivelAJugar,
      },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.completed) {
        this.loadJuegos();
        this.studentService.refrescarPuntos();
      }
    });
  }

  verPosiciones(juego: JuegoResponse): void {
    this.juegosService.getRankingPorJuego(juego.id).subscribe({
      next: (res) => {
        const data = res.data;
        const dialogConfig = new MatDialogConfig();
        dialogConfig.width = '500px';
        dialogConfig.disableClose = false;
        dialogConfig.data = {
          juegoNombre: juego.nombre,
          ranking: data.ranking,
          totalEstudiantes: data.totalEstudiantes,
          miPosicion: data.miPosicion,
        };

        this.dialog.open(RankingInlineDialog, dialogConfig);
      },
      error: (err) => {
        console.error('Error cargando ranking:', err);
        alert('No se pudo cargar el ranking.');
      },
    });
  }

  navigateToBenefits(): void {
    this.router.navigate(['/beneficios']);
  }

  navigateToChatbot(): void {
    this.router.navigate(['/chatbot']);
  }

  openProfile(): void {
    this.router.navigate(['/perfil']);
  }

  goBack(): void {
    this.router.navigate(['/landing-alumnos']);
  }

  onImageError(event: any): void {
    event.target.src = 'assets/images/placeholder-game.jpg';
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/']);
  }
}