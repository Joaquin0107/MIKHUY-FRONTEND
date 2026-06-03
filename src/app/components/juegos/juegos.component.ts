import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import {
  MatDialogModule, MatDialog, MatDialogConfig,
  MatDialogRef, MAT_DIALOG_DATA
} from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';

import { AuthService } from '../../services/auth.service';
import { JuegosService, JuegoResponse } from '../../services/juego.service';
import { StudentService } from '../../services/student.service';
import { GamePlayDialog } from '../game-play-dialog/game-play-dialog.component';
import { RankingInlineDialog } from '../ranking-dialog/ranking-dialog.component';
import { FloatingChatbotComponent } from '../floating-chatbot/floating-chatbot.component';

// ─────────────────────────────────────────────────────────────────────────────
// Dialog de instrucciones de la tarjeta (standalone, inline)
// ─────────────────────────────────────────────────────────────────────────────
@Component({
  selector: 'instrucciones-juego-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatDialogModule],
  template: `
    <div class="inst-wrap">
      <!-- Header -->
      <div class="inst-header">
        <div class="inst-header-icon">
          <mat-icon>help_outline</mat-icon>
        </div>
        <div class="inst-header-text">
          <h2>{{ data.titulo }}</h2>
          <p>{{ data.juegoNombre }}</p>
        </div>
        <button mat-icon-button class="inst-close" mat-dialog-close>
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Contenido -->
      <mat-dialog-content>
        <ol class="inst-lista">
          <li *ngFor="let paso of data.pasos">{{ paso }}</li>
        </ol>

        <!-- Info extra -->
        <div class="inst-extra">
          <div class="inst-extra-item">
            <mat-icon>bar_chart</mat-icon>
            <span><strong>Nivel actual:</strong> {{ data.nivelActual }} / {{ data.maxNiveles }}</span>
          </div>
          <div class="inst-extra-item">
            <mat-icon>stars</mat-icon>
            <span><strong>Puntos acumulados:</strong> {{ data.puntosGanados }} pts</span>
          </div>
          <div class="inst-extra-item">
            <mat-icon>emoji_events</mat-icon>
            <span><strong>Puntos por nivel:</strong> {{ data.puntosPorNivel }} pts</span>
          </div>
        </div>
      </mat-dialog-content>

      <!-- Acciones -->
      <mat-dialog-actions>
        <button mat-button mat-dialog-close>Cerrar</button>
        <button mat-raised-button color="primary" mat-dialog-close
          (click)="data.onJugar()">
          <mat-icon>play_arrow</mat-icon>
          ¡Jugar ahora!
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .inst-wrap { font-family: 'Poppins', sans-serif; width: 480px; max-width: 100%; }

    .inst-header {
      display: flex; align-items: center; gap: 12px;
      padding: 35px 3.5rem;
      background: linear-gradient(135deg, #48a3f3 0%, #5bb3ff 100%);
      margin: -24px -24px 1.5rem -24px;
      border-radius: 4px 4px 0 0;
    }
    .inst-header-icon {
      width: 44px; height: 44px; border-radius: 50%;
      background: rgba(255,255,255,0.25);
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .inst-header-icon mat-icon { color: #fff; font-size: 24px; width: 24px; height: 24px; }
    .inst-header-text { flex: 1; }
    .inst-header-text h2 { margin: 0; color: #fff; font-size: 1.1rem; font-weight: 700; }
    .inst-header-text p  { margin: 2px 0 0; color: rgba(255,255,255,0.9); font-size: 0.85rem; }
    .inst-close { color: white !important; }

    mat-dialog-content {
      padding: 0 !important;
      margin: 0 !important;
      max-height: 60vh;
      overflow-y: auto;
    }

    .inst-lista {
      margin: 0 0 1.25rem;
      padding: 0 1.5rem;
      display: flex; flex-direction: column; gap: 10px;
      list-style: none; counter-reset: inst-counter;
    }
    .inst-lista li {
      counter-increment: inst-counter;
      display: flex; align-items: flex-start; gap: 10px;
      font-size: 14px; color: #333; line-height: 1.55;
    }
    .inst-lista li::before {
      content: counter(inst-counter);
      min-width: 24px; height: 24px;
      background: #e3f2fd; color: #1565c0;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 12px; font-weight: 700; flex-shrink: 0; margin-top: 1px;
    }

    .inst-extra {
      margin: 0 1.5rem 1rem;
      padding: 12px 14px;
      background: #f8f9fa;
      border-radius: 10px;
      border: 1px solid #eee;
      display: flex; flex-direction: column; gap: 8px;
    }
    .inst-extra-item {
      display: flex; align-items: center; gap: 8px;
      font-size: 13px; color: #555;
    }
    .inst-extra-item mat-icon { font-size: 18px; width: 18px; height: 18px; color: #48a3f3; }

    mat-dialog-actions {
      padding: 0.875rem 1.5rem !important;
      margin: 0 !important;
      border-top: 1px solid #eee;
      display: flex; justify-content: flex-end; gap: 8px;
    }
    mat-dialog-actions button:last-child { min-width: 140px; }
  `],
})
export class InstruccionesJuegoDialog {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<InstruccionesJuegoDialog>
  ) {}
}

// ─────────────────────────────────────────────────────────────────────────────
// Instrucciones por tipo de juego
// ─────────────────────────────────────────────────────────────────────────────
function getInstruccionesPorJuego(nombre: string): { titulo: string; pasos: string[] } {
  const n = nombre.toLowerCase();

  if (n.includes('nutrimental') || n.includes('desafío')) {
    return {
      titulo: '¿Cómo jugar Desafío Nutrimental?',
      pasos: [
        '📋 Se te presentarán 5 preguntas de opción múltiple sobre nutrición.',
        '🎯 Selecciona la respuesta correcta y presiona "Responder".',
        '✅ Recibirás retroalimentación inmediata con explicación.',
        '⭐ Ganas 10 puntos por cada respuesta correcta.',
        '⏱️ El tiempo cuenta — ¡responde con precisión y rapidez!',
        '🔀 Las preguntas son aleatorias cada vez que juegas el mismo nivel.',
      ],
    };
  }

  if (n.includes('coach')) {
    return {
      titulo: '¿Cómo funciona Coach Exprés?',
      pasos: [
        '🧠 Responderás 8 preguntas del modelo transteórico del cambio.',
        '📊 Cada pregunta tiene escala del 1 al 5 (Totalmente en desacuerdo → Totalmente de acuerdo).',
        '🎯 Responde con honestidad — no hay respuestas incorrectas.',
        '⭐ Ganas 5 puntos por cada pregunta completada.',
        '💡 Tus respuestas identifican tu etapa de cambio en hábitos saludables.',
        '🔀 Las preguntas son aleatorias dentro de la etapa de cada nivel.',
      ],
    };
  }

  if (n.includes('reto') || n.includes('7 días') || n.includes('7dias')) {
    return {
      titulo: '¿Cómo funciona el Reto 7 Días?',
      pasos: [
        '📅 Cada nivel representa un día del reto (día 1 al día 7).',
        '🍽️ Registra porciones de cada grupo alimenticio consumido hoy.',
        '😊 Indica cómo te sentiste durante el día.',
        '📝 Añade notas personales sobre tu experiencia.',
        '⭐ Ganas 15 puntos al completar el registro de cada día.',
        '📈 Al terminar los 7 días habrás completado el reto completo.',
      ],
    };
  }

  return {
    titulo: 'Instrucciones del juego',
    pasos: ['Sigue las indicaciones en pantalla para completar cada nivel.'],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────────────────────────────────────
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
    FloatingChatbotComponent,
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
      this.router.navigate(['/login']);
      return;
    }

    this.studentService.puntos$
      .pipe(takeUntil(this.destroy$))
      .subscribe(puntos => { this.studentPoints = puntos; });

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
            image: juego.imagen || this.getDefaultImage(juego.categoria),
          }));
          this.notificationCount = this.calcularNotificaciones(this.juegos);
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
      (j) => !j.vecesJugado || j.vecesJugado === 0 ||
        (j.nivelActual && j.nivelActual < j.maxNiveles)
    ).length;
  }

  loadStudentInfo(): void {
    this.studentService.getMisPuntos().subscribe({
      error: (err) => console.error('Error cargando puntos:', err),
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
    return ((juego.nivelActual || 0) / juego.maxNiveles) * 100;
  }

  // ── Instrucciones de la tarjeta ──────────────────────────────────────────
  verInstrucciones(juego: JuegoResponse): void {
    const inst = getInstruccionesPorJuego(juego.nombre);

    this.dialog.open(InstruccionesJuegoDialog, {
      width: '500px',
      maxWidth: '95vw',
      data: {
        titulo: inst.titulo,
        pasos: inst.pasos,
        juegoNombre: juego.nombre,
        nivelActual: juego.nivelActual || 1,
        maxNiveles: juego.maxNiveles,
        puntosGanados: juego.puntosGanados,
        puntosPorNivel: juego.puntosPorNivel,
        // Callback para jugar directo desde el dialog de instrucciones
        onJugar: () => this.jugar(juego),
      },
    });
  }

  // ── Jugar ────────────────────────────────────────────────────────────────
  jugar(juego: JuegoResponse): void {
    const nivelAJugar = juego.nivelActual || 1;

    const dialogRef = this.dialog.open(GamePlayDialog, {
      width: '90vw',
      maxWidth: '1200px',
      height: '85vh',
      data: { juego, nivelAJugar },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.completed) {
        this.loadJuegos();
        this.studentService.refrescarPuntos();
      }
    });
  }

  // ── Ranking ──────────────────────────────────────────────────────────────
  verPosiciones(juego: JuegoResponse): void {
    this.juegosService.getRankingPorJuego(juego.id).subscribe({
      next: (res) => {
        const data = res.data;
        const config = new MatDialogConfig();
        config.width = '580px';
        config.maxWidth = '95vw';
        config.maxHeight = '90vh';
        config.data = {
          juegoNombre: juego.nombre,
          ranking: data.ranking,
          totalEstudiantes: data.totalEstudiantes,
          miPosicion: data.miPosicion,
        };
        this.dialog.open(RankingInlineDialog, config);
      },
      error: (err) => {
        console.error('Error cargando ranking:', err);
        alert('No se pudo cargar el ranking.');
      },
    });
  }

  navigateToBenefits(): void { this.router.navigate(['/beneficios']); }
  openProfile(): void { this.router.navigate(['/perfil']); }
  goBack(): void { this.router.navigate(['/landing-alumnos']); }
  onImageError(event: any): void { event.target.src = 'assets/images/placeholder-game.jpg'; }
  logout(): void { localStorage.clear(); this.router.navigate(['/']); }
}