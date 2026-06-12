import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import {
  MatDialogModule,
  MatDialog,
  MatDialogConfig,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AuthService } from '../../services/auth.service';
import { JuegosService, JuegoResponse } from '../../services/juego.service';
import { StudentService } from '../../services/student.service';
import { AmigoService, Companero } from '../../services/amigo.service';
import { GamePlayDialog } from '../game-play-dialog/game-play-dialog.component';
import { RankingInlineDialog } from '../ranking-dialog/ranking-dialog.component';
import { FloatingChatbotComponent } from '../floating-chatbot/floating-chatbot.component';

import { DashboardsComponent } from '../dashboards/dashboards.component';

// ─────────────────────────────────────────────────────────────────────────────
// Dialog de instrucciones (sin cambios)
// ─────────────────────────────────────────────────────────────────────────────
@Component({
  selector: 'instrucciones-juego-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatDialogModule],
  template: `
    <div class="inst-wrap">
      <div class="inst-header">
        <div class="inst-header-icon"><mat-icon>help_outline</mat-icon></div>
        <div class="inst-header-text">
          <h2>{{ data.titulo }}</h2>
          <p>{{ data.juegoNombre }}</p>
        </div>
        <button mat-icon-button class="inst-close" mat-dialog-close>
          <mat-icon>close</mat-icon>
        </button>
      </div>
      <mat-dialog-content>
        <ol class="inst-lista">
          <li *ngFor="let paso of data.pasos">{{ paso }}</li>
        </ol>
        <div class="inst-extra">
          <div class="inst-extra-item">
            <mat-icon>bar_chart</mat-icon>
            <span
              ><strong>Nivel actual:</strong> {{ data.nivelActual }} /
              {{ data.maxNiveles }}</span
            >
          </div>
          <div class="inst-extra-item">
            <mat-icon>stars</mat-icon>
            <span
              ><strong>Puntos acumulados:</strong>
              {{ data.puntosGanados }} pts</span
            >
          </div>
          <div class="inst-extra-item">
            <mat-icon>emoji_events</mat-icon>
            <span
              ><strong>Puntos por nivel:</strong>
              {{ data.puntosPorNivel }} pts</span
            >
          </div>
        </div>
      </mat-dialog-content>
      <mat-dialog-actions>
        <button mat-button mat-dialog-close>Cerrar</button>
        <button
          mat-raised-button
          color="primary"
          mat-dialog-close
          (click)="data.onJugar()"
        >
          <mat-icon>play_arrow</mat-icon> ¡Jugar ahora!
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [
    `
      .inst-wrap {
        font-family: 'Poppins', sans-serif;
        width: 480px;
        max-width: 100%;
      }
      .inst-header {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 35px 3.5rem;
        background: linear-gradient(135deg, #48a3f3 0%, #5bb3ff 100%);
        margin: -2px -24px 1.5rem -24px;
        border-radius: 4px 4px 0 0;
      }
      .inst-header-icon {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.25);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .inst-header-icon mat-icon {
        color: #fff;
        font-size: 24px;
        width: 24px;
        height: 24px;
      }
      .inst-header-text {
        flex: 1;
      }
      .inst-header-text h2 {
        margin: 0;
        color: #fff;
        font-size: 1.1rem;
        font-weight: 700;
      }
      .inst-header-text p {
        margin: 2px 0 0;
        color: rgba(255, 255, 255, 0.9);
        font-size: 0.85rem;
      }
      .inst-close {
        color: white !important;
      }
      mat-dialog-content {
        padding: 0 !important;
        margin: 0 !important;
        max-height: 60vh;
        overflow-y: auto;
      }
      .inst-lista {
        margin: 0 0 1.25rem;
        padding: 0 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 10px;
        list-style: none;
        counter-reset: inst-counter;
      }
      .inst-lista li {
        counter-increment: inst-counter;
        display: flex;
        align-items: flex-start;
        gap: 10px;
        font-size: 14px;
        color: #333;
        line-height: 1.55;
      }
      .inst-lista li::before {
        content: counter(inst-counter);
        min-width: 24px;
        height: 24px;
        background: #e3f2fd;
        color: #1565c0;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 700;
        flex-shrink: 0;
        margin-top: 1px;
      }
      .inst-extra {
        margin: 0 1.5rem 1rem;
        padding: 12px 14px;
        background: #f8f9fa;
        border-radius: 10px;
        border: 1px solid #eee;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .inst-extra-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        color: #555;
      }
      .inst-extra-item mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        color: #48a3f3;
      }
      mat-dialog-actions {
        padding: 0.875rem 1.5rem !important;
        margin: 0 !important;
        border-top: 1px solid #eee;
        display: flex;
        justify-content: flex-end;
        gap: 8px;
      }
      mat-dialog-actions button:last-child {
        min-width: 140px;
      }
    `,
  ],
})
export class InstruccionesJuegoDialog {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<InstruccionesJuegoDialog>,
  ) {}
}

// ─────────────────────────────────────────────────────────────────────────────
// Dialog de Amigos/Compañeros — NUEVO
// ─────────────────────────────────────────────────────────────────────────────
@Component({
  selector: 'amigos-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
  ],
  template: `
    <div class="amigos-wrap">
      <div class="amigos-header">
        <div class="amigos-header-icon"><mat-icon>group</mat-icon></div>
        <div class="amigos-header-text">
          <h2>Compañeros</h2>
          <p>{{ data.grado }} – Sección {{ data.seccion }}</p>
        </div>
        <button mat-icon-button class="close-btn" mat-dialog-close>
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content>
        <div
          *ngIf="solicitudesRecibidas.length > 0"
          class="solicitudes-section"
        >
          <div class="section-label">
            <mat-icon>person_add</mat-icon>
            Solicitudes recibidas ({{ solicitudesRecibidas.length }})
          </div>
          <div class="solicitud-row" *ngFor="let s of solicitudesRecibidas">
            <mat-icon class="sol-avatar">account_circle</mat-icon>
            <span class="sol-nombre">{{ s.nombre }}</span>
            <button
              mat-raised-button
              color="primary"
              class="sol-btn"
              (click)="aceptar(s.id, s.nombre)"
              [disabled]="loadingId === s.id"
            >
              <mat-icon>check</mat-icon> Aceptar
            </button>
            <button
              mat-stroked-button
              class="sol-btn rechazar"
              (click)="rechazar(s.id)"
              [disabled]="loadingId === s.id"
            >
              <mat-icon>close</mat-icon>
            </button>
          </div>
        </div>

        <div *ngIf="amigosConfirmados.length > 0" class="amigos-section">
          <div class="section-label">
            <mat-icon>favorite</mat-icon>
            Mis amigos ({{ amigosConfirmados.length }})
          </div>
          <div class="amigo-chip" *ngFor="let a of amigosConfirmados">
            <mat-icon class="chip-avatar-icon">account_circle</mat-icon>
            <div class="chip-info">
              <span class="chip-nombre">{{ a.nombres }} {{ a.apellidos }}</span>
              <span class="chip-pts"
                ><mat-icon>stars</mat-icon>{{ a.puntosAcumulados }} pts</span
              >
            </div>

            <button
              mat-flat-button
              class="btn-ver-perfil-chip"
              (click)="verPerfilAmigo(a)"
              matTooltip="Ver progreso y dashboard de salud"
            >
              <mat-icon>dashboard</mat-icon> Perfil
            </button>

            <button
              mat-icon-button
              class="eliminar-btn"
              matTooltip="Eliminar amigo"
              (click)="eliminar(a.id)"
            >
              <mat-icon>person_remove</mat-icon>
            </button>
          </div>
        </div>

        <div class="section-label" style="margin-top:1rem">
          <mat-icon>people</mat-icon>
          Todos mis compañeros
        </div>

        <div class="buscar-wrap">
          <mat-icon class="buscar-icon">search</mat-icon>
          <input
            class="buscar-input"
            [(ngModel)]="busqueda"
            placeholder="Buscar por nombre..."
          />
        </div>

        <div class="spinner-wrap" *ngIf="loading">
          <mat-spinner diameter="36"></mat-spinner>
        </div>

        <div
          class="empty-wrap"
          *ngIf="!loading && companerosFiltrados.length === 0"
        >
          <mat-icon>group_off</mat-icon>
          <p>
            {{
              busqueda ? 'Sin resultados' : 'No hay compañeros registrados aún'
            }}
          </p>
        </div>

        <div class="companero-row" *ngFor="let c of companerosFiltrados">
          <mat-icon class="comp-avatar-icon">account_circle</mat-icon>
          <div class="comp-info">
            <span class="comp-nombre">{{ c.nombres }} {{ c.apellidos }}</span>
            <span class="comp-sub">
              <mat-icon>stars</mat-icon>{{ c.puntosAcumulados }} ·
              <mat-icon>sports_esports</mat-icon>{{ c.juegosCompletados }}
            </span>
          </div>

          <button
            mat-raised-button
            color="primary"
            class="comp-btn"
            *ngIf="getEstado(c.id) === 'ninguno'"
            (click)="enviar(c)"
            [disabled]="loadingId === c.id"
          >
            <mat-icon>person_add</mat-icon> Agregar
          </button>

          <button
            mat-stroked-button
            class="comp-btn pendiente"
            *ngIf="getEstado(c.id) === 'pendiente_enviada'"
            disabled
          >
            <mat-icon>hourglass_empty</mat-icon> Pendiente
          </button>

          <div
            class="recibida-row"
            *ngIf="getEstado(c.id) === 'pendiente_recibida'"
          >
            <button
              mat-raised-button
              color="primary"
              class="comp-btn"
              (click)="aceptar(c.id, c.nombres + ' ' + c.apellidos)"
              [disabled]="loadingId === c.id"
            >
              <mat-icon>check</mat-icon>
            </button>
            <button
              mat-icon-button
              color="warn"
              (click)="rechazar(c.id)"
              [disabled]="loadingId === c.id"
            >
              <mat-icon>close</mat-icon>
            </button>
          </div>

          <div
            class="amigos-acciones-wrap"
            *ngIf="getEstado(c.id) === 'amigos'"
          >
            <button
              mat-stroked-button
              class="comp-btn btn-ver-perfil"
              (click)="verPerfilAmigo(c)"
            >
              <mat-icon>visibility</mat-icon> Perfil
            </button>
            <div class="amigo-tag"><mat-icon>favorite</mat-icon> Amigos</div>
          </div>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions>
        <button mat-button mat-dialog-close>Cerrar</button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [
    `
      /* SOLUCIÓN LÍNEA BLANCA: Ajuste del contenedor principal para asimilar el header */
      .amigos-wrap {
        font-family: 'Poppins', sans-serif;
        width: 520px;
        max-width: 100%;
        margin: -24px -24px -24px -24px; /* Neutraliza el padding global del MatDialog por completo */
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      .amigos-header {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 20px 24px;
        background: linear-gradient(135deg, #48a3f3, #5bb3ff);
        border-radius: 0; /* Ya no requiere simular bordes redondeados forzados */
      }

      .amigos-header-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.25);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .amigos-header-icon mat-icon {
        color: #fff;
        font-size: 22px;
        width: 22px;
        height: 22px;
      }
      .amigos-header-text {
        flex: 1;
      }
      .amigos-header-text h2 {
        margin: 0;
        color: #fff;
        font-size: 1.05rem;
        font-weight: 700;
      }
      .amigos-header-text p {
        margin: 2px 0 0;
        color: rgba(255, 255, 255, 0.85);
        font-size: 0.8rem;
      }
      .close-btn {
        color: white !important;
      }

      mat-dialog-content {
        padding: 1.25rem 24px !important;
        max-height: 55vh;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin: 0 !important; /* Limpia colisiones estructurales */
      }

      .section-label {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 0.85rem;
        font-weight: 600;
        color: #48a3f3;
        margin: 0.75rem 0 0.5rem;
        border-bottom: 1px solid #e0e0e0;
        padding-bottom: 0.4rem;
      }
      .section-label mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }

      /* Solicitudes */
      .solicitud-row {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        padding: 0.5rem 0;
        border-bottom: 1px solid #f5f5f5;
      }
      .sol-avatar {
        font-size: 32px;
        width: 32px;
        height: 32px;
        color: #ff9800;
      }
      .sol-nombre {
        flex: 1;
        font-size: 0.9rem;
        font-weight: 600;
        color: #333;
      }
      .sol-btn {
        font-size: 0.8rem !important;
        height: 32px !important;
        padding: 0 0.6rem !important;
      }
      .sol-btn.rechazar {
        border-color: #f44336 !important;
        color: #f44336 !important;
      }

      /* Amigos confirmados */
      .amigo-chip {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        padding: 0.5rem 0.75rem;
        background: #f1f8e9;
        border-radius: 8px;
        margin-bottom: 0.4rem;
      }
      .chip-avatar-icon {
        font-size: 36px;
        width: 36px;
        height: 36px;
        color: #4caf50;
      }
      .chip-info {
        flex: 1;
        display: flex;
        flex-direction: column;
      }
      .chip-nombre {
        font-size: 0.88rem;
        font-weight: 600;
        color: #333;
      }
      .chip-pts {
        display: flex;
        align-items: center;
        gap: 2px;
        font-size: 0.75rem;
        color: #888;
      }
      .chip-pts mat-icon {
        font-size: 13px;
        width: 13px;
        height: 13px;
        color: #ffd700;
      }

      /* Estilo del nuevo botón Ver Perfil dentro del Chip de amigos */
      .btn-ver-perfil-chip {
        background-color: #1976d2 !important;
        color: white !important;
        font-size: 0.78rem !important;
        height: 30px !important;
        padding: 0 10px !important;
        border-radius: 6px;
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .btn-ver-perfil-chip mat-icon {
        font-size: 14px;
        width: 14px;
        height: 14px;
      }

      .eliminar-btn mat-icon {
        color: #bdbdbd;
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
      .eliminar-btn:hover mat-icon {
        color: #f44336;
      }

      /* Buscador */
      .buscar-wrap {
        display: flex;
        align-items: center;
        gap: 8px;
        border: 1.5px solid #e0e0e0;
        border-radius: 8px;
        padding: 0.4rem 0.75rem;
        margin-bottom: 0.5rem;
      }
      .buscar-icon {
        color: #aaa;
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
      .buscar-input {
        border: none;
        outline: none;
        flex: 1;
        font-family: 'Poppins', sans-serif;
        font-size: 0.9rem;
        background: transparent;
      }

      .spinner-wrap {
        display: flex;
        justify-content: center;
        padding: 1.5rem;
      }
      .empty-wrap {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 1.5rem;
        gap: 0.5rem;
        color: #bbb;
      }
      .empty-wrap mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
      }
      .empty-wrap p {
        margin: 0;
        font-size: 0.9rem;
      }

      /* Compañeros */
      .companero-row {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.6rem 0;
        border-bottom: 1px solid #f5f5f5;
      }
      .comp-avatar-icon {
        font-size: 38px;
        width: 38px;
        height: 38px;
        color: #48a3f3;
        flex-shrink: 0;
      }
      .comp-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-width: 0;
      }
      .comp-nombre {
        font-size: 0.9rem;
        font-weight: 600;
        color: #222;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .comp-sub {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 0.75rem;
        color: #888;
      }
      .comp-sub mat-icon {
        font-size: 13px;
        width: 13px;
        height: 13px;
        color: #ffd700;
      }
      .comp-btn {
        font-size: 0.8rem !important;
        height: 34px !important;
        padding: 0 0.75rem !important;
        white-space: nowrap;
      }
      .comp-btn.pendiente {
        border-color: #bdbdbd !important;
        color: #9e9e9e !important;
      }
      .btn-ver-perfil {
        border-color: #1976d2 !important;
        color: #1976d2 !important;
      }
      .recibida-row {
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .amigos-acciones-wrap {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .amigo-tag {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 0.8rem;
        font-weight: 600;
        color: #4caf50;
        white-space: nowrap;
      }
      .amigo-tag mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
        color: #e53935;
      }

      mat-dialog-actions {
        padding: 0.75rem 24px !important;
        margin: 0 !important;
        border-top: 1px solid #eee;
        display: flex;
        justify-content: flex-end;
        background: #fafafa;
      }
    `,
  ],
})
export class AmigosDialog implements OnInit {
  busqueda = '';
  loading = true;
  loadingId: string | null = null;
  companeros: Companero[] = [];
  solicitudesRecibidas: { id: string; nombre: string }[] = [];

  get companerosFiltrados(): Companero[] {
    if (!this.busqueda.trim()) return this.companeros;
    const q = this.busqueda.toLowerCase();
    return this.companeros.filter(
      (c) =>
        c.nombres.toLowerCase().includes(q) ||
        c.apellidos.toLowerCase().includes(q),
    );
  }

  get amigosConfirmados(): Companero[] {
    return this.companeros.filter(
      (c) =>
        this.amigoService.getEstado(this.data.miEstudianteId, c.id) ===
        'amigos',
    );
  }

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      miEstudianteId: string;
      miNombre: string;
      grado: string;
      seccion: string;
    },
    public dialogRef: MatDialogRef<AmigosDialog>,
    private amigoService: AmigoService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog, // Inyectamos el servicio MatDialog para abrir submodales
  ) {}

  ngOnInit(): void {
    this.cargarDatosIniciales();
  }

  cargarDatosIniciales(): void {
    this.solicitudesRecibidas = this.amigoService.getSolicitudesRecibidas(
      this.data.miEstudianteId,
    );
    this.amigoService.getCompaneros().subscribe({
      next: (lista) => {
        this.companeros = lista;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  getEstado(otroId: string): string {
    return this.amigoService.getEstado(this.data.miEstudianteId, otroId);
  }

  enviar(c: Companero): void {
    this.loadingId = c.id;
    this.amigoService
      .enviarSolicitud(this.data.miEstudianteId, this.data.miNombre, c)
      .subscribe({
        next: () => {
          this.snackBar.open(`Solicitud enviada a ${c.nombres}`, '', {
            duration: 2500,
            panelClass: 'snackbar-success',
          });
          this.loadingId = null;
        },
        error: (err) => {
          this.snackBar.open(
            err.error?.message || 'Error al enviar solicitud',
            '',
            { duration: 2500, panelClass: 'snackbar-error' },
          );
          const store = this.amigoService.getStore(this.data.miEstudianteId);
          store.enviadas = store.enviadas.filter((e: string) => e !== c.id);
          this.amigoService.saveStore(this.data.miEstudianteId, store);
          this.loadingId = null;
        },
      });
  }

  aceptar(remitenteId: string, remitenteNombre: string): void {
    this.loadingId = remitenteId;
    this.amigoService
      .aceptarSolicitud(
        this.data.miEstudianteId,
        this.data.miNombre,
        remitenteId,
        remitenteNombre,
      )
      .subscribe({
        next: () => {
          this.solicitudesRecibidas = this.amigoService.getSolicitudesRecibidas(
            this.data.miEstudianteId,
          );
          this.snackBar.open(`¡Ahora eres amigo de ${remitenteNombre}!`, '', {
            duration: 2500,
            panelClass: 'snackbar-success',
          });
          this.loadingId = null;
        },
        error: () => {
          this.loadingId = null;
        },
      });
  }

  rechazar(remitenteId: string): void {
    this.loadingId = remitenteId;
    this.amigoService
      .rechazarSolicitud(
        this.data.miEstudianteId,
        this.data.miNombre,
        remitenteId,
      )
      .subscribe({
        next: () => {
          this.solicitudesRecibidas = this.amigoService.getSolicitudesRecibidas(
            this.data.miEstudianteId,
          );
          this.loadingId = null;
        },
        error: () => {
          this.loadingId = null;
        },
      });
  }

  eliminar(amigoId: string): void {
    this.amigoService.eliminarAmigo(this.data.miEstudianteId, amigoId);
    this.snackBar.open('Amigo eliminado', '', { duration: 2000 });
  }

  /**
   * NUEVO MÉTODO: Abre el dashboard de MIKHUY filtrando por el ID de tu compañero.
   * Dependiendo de cómo reciba los datos tu `DashboardsComponent`, se los inyectamos en el DATA.
   */
  verPerfilAmigo(amigo: Companero): void {
    const config = new MatDialogConfig();
    config.width = '95vw';
    config.maxWidth = '1200px';
    config.height = '90vh';
    config.maxHeight = '90vh';

    config.data = {
      estudianteId: amigo.id,
      nombreCompleto: `${amigo.nombres} ${amigo.apellidos}`,
      isViewOnly: true, 
    };

    this.dialog.open(DashboardsComponent, config);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Instrucciones por tipo de juego (sin cambios)
// ─────────────────────────────────────────────────────────────────────────────
function getInstruccionesPorJuego(nombre: string): {
  titulo: string;
  pasos: string[];
} {
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
        '📊 Cada pregunta tiene escala del 1 al 5.',
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
// Componente principal JuegosComponent
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
    MatSnackBarModule,
    FloatingChatbotComponent,
  ],
  templateUrl: './juegos.component.html',
  styleUrls: ['./juegos.component.css'],
})
export class JuegosComponent implements OnInit, OnDestroy {
  juegos: JuegoResponse[] = [];
  studentPoints = 0;
  notificationCount = 0;
  loading = false;

  // Pop-up "juegos nuevos"
  mostrarPopupJuevosNuevos = false;
  private readonly POPUP_KEY = 'mikhuy_popup_juegos_v2'; // cambiar key al agregar más juegos

  // Datos del estudiante autenticado (para el dialog de amigos)
  miEstudianteId = '';
  miNombre = '';
  miGrado = '';
  miSeccion = '';
  solicitudesCount = 0;

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private authService: AuthService,
    private juegosService: JuegosService,
    private studentService: StudentService,
    private amigoService: AmigoService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    if (!this.authService.getToken()) {
      this.router.navigate(['/login']);
      return;
    }

    this.studentService.puntos$
      .pipe(takeUntil(this.destroy$))
      .subscribe((puntos) => {
        this.studentPoints = puntos;
      });

    this.loadJuegos();
    this.loadStudentInfo();

    // Mostrar popup de juegos nuevos solo si no se ha visto antes
    if (!localStorage.getItem(this.POPUP_KEY)) {
      setTimeout(() => {
        this.mostrarPopupJuevosNuevos = true;
      }, 800);
    }
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

  loadStudentInfo(): void {
    this.studentService.getMisPuntos().subscribe({
      error: (err) => console.error('Error cargando puntos:', err),
    });

    // Cargar perfil para obtener id, nombre, grado y sección
    this.studentService.getMiPerfil().subscribe({
      next: (response: any) => {
        const data = response?.data ?? response;
        if (data?.id) {
          this.miEstudianteId = data.id.toString();
          this.miNombre = `${data.nombres} ${data.apellidos}`;
          this.miGrado = data.grado ?? '';
          this.miSeccion = data.seccion ?? '';
          // Actualizar badge de solicitudes pendientes
          this.solicitudesCount = this.amigoService.getSolicitudesRecibidas(
            this.miEstudianteId,
          ).length;
          // Procesar notificaciones de amistad
          this.procesarNotificacionesAmistad();
        }
      },
      error: (err) => console.error('Error cargando perfil:', err),
    });
  }

  procesarNotificacionesAmistad(): void {
    this.studentService.getMisNotificaciones().subscribe({
      next: (response: any) => {
        const notifs = Array.isArray(response)
          ? response
          : (response?.data ?? []);
        this.amigoService.procesarNotificacionesAmistad(
          this.miEstudianteId,
          notifs,
        );
        this.solicitudesCount = this.amigoService.getSolicitudesRecibidas(
          this.miEstudianteId,
        ).length;
      },
      error: () => {},
    });
  }

  // ── Dialog de Amigos ─────────────────────────────────────────────────────
  abrirAmigos(): void {
    const dialogRef = this.dialog.open(AmigosDialog, {
      width: '560px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: {
        miEstudianteId: this.miEstudianteId,
        miNombre: this.miNombre,
        grado: this.miGrado,
        seccion: this.miSeccion,
      },
    });

    // Al cerrar refrescar badge
    dialogRef.afterClosed().subscribe(() => {
      this.solicitudesCount = this.amigoService.getSolicitudesRecibidas(
        this.miEstudianteId,
      ).length;
    });
  }

  calcularNotificaciones(juegos: JuegoResponse[]): number {
    return juegos.filter(
      (j) =>
        !j.vecesJugado ||
        j.vecesJugado === 0 ||
        (j.nivelActual && j.nivelActual < j.maxNiveles),
    ).length;
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
        onJugar: () => this.jugar(juego),
      },
    });
  }

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

  navigateToBenefits(): void {
    this.router.navigate(['/beneficios']);
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

  cerrarPopupJuegosNuevos(): void {
    this.mostrarPopupJuevosNuevos = false;
    localStorage.setItem(this.POPUP_KEY, '1');
  }
}
