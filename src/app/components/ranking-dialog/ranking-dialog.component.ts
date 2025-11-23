import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';

@Component({
  selector: 'ranking-inline-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
  ],
  template: `
    <div class="ranking-dialog">
      <!-- Header -->
      <div class="dialog-header">
        <div class="header-icon">
          <mat-icon>emoji_events</mat-icon>
        </div>
        <div class="header-text">
          <h2>Ranking del Juego</h2>
          <p>{{ data.juegoNombre }}</p>
        </div>
        <button mat-icon-button class="close-btn" (click)="cerrar()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Stats Info (fuera de mat-dialog-content) -->
      <div class="stats-info" *ngIf="data.totalEstudiantes">
        <mat-icon>group</mat-icon>
        <span>{{ data.totalEstudiantes }} estudiante{{ data.totalEstudiantes !== 1 ? 's' : '' }} participando</span>
      </div>

      <!-- Content -->
      <mat-dialog-content>
        <!-- Ranking List -->
        <div class="ranking-container" *ngIf="data.ranking && data.ranking.length > 0; else sinDatos">
          <div class="ranking-item" 
               *ngFor="let item of data.ranking"
               [class.top-1]="item.posicion === 1"
               [class.top-2]="item.posicion === 2"
               [class.top-3]="item.posicion === 3"
               [class.mi-posicion]="item.esMiPosicion">
            
            <!-- Position Badge -->
            <div class="position-badge">
              <mat-icon *ngIf="item.posicion === 1" class="trophy-icon gold">emoji_events</mat-icon>
              <mat-icon *ngIf="item.posicion === 2" class="trophy-icon silver">emoji_events</mat-icon>
              <mat-icon *ngIf="item.posicion === 3" class="trophy-icon bronze">emoji_events</mat-icon>
              <span *ngIf="item.posicion > 3" class="position-number">#{{ item.posicion }}</span>
            </div>

            <!-- Student Info -->
            <div class="student-info">
              <div class="student-name">
                {{ item.nombre }}
                <mat-icon *ngIf="item.esMiPosicion" class="me-badge">person</mat-icon>
              </div>
              <div class="student-meta">
                {{ item.grado }}{{ item.seccion ? '-' + item.seccion : '' }}
                <span class="separator">•</span>
                <span class="games-completed">
                  <mat-icon>sports_esports</mat-icon>
                  {{ item.juegosCompletados || 0 }} juegos
                </span>
              </div>
            </div>

            <!-- Points -->
            <div class="points-display">
              <span class="points-value">{{ item.puntosAcumulados }}</span>
              <span class="points-label">pts</span>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <ng-template #sinDatos>
          <div class="empty-state">
            <mat-icon>leaderboard</mat-icon>
            <h3>No hay datos de ranking aún</h3>
            <p>Sé el primero en completar este juego</p>
          </div>
        </ng-template>

        <!-- Mi Posición (destacada) -->
        <div class="mi-posicion-card" *ngIf="data.miPosicion && !isInTopRanking(data.miPosicion.posicion)">
          <div class="card-header">
            <mat-icon>person_pin</mat-icon>
            <span>Tu Posición</span>
          </div>
          <div class="card-content">
            <div class="position-circle">
              <span class="big-number">#{{ data.miPosicion.posicion }}</span>
            </div>
            <div class="position-details">
              <h4>{{ data.miPosicion.nombre }}</h4>
              <div class="detail-row">
                <mat-icon>emoji_events</mat-icon>
                <span>{{ data.miPosicion.puntosAcumulados }} puntos</span>
              </div>
              <div class="detail-row">
                <mat-icon>sports_esports</mat-icon>
                <span>{{ data.miPosicion.juegosCompletados || 0 }} juegos completados</span>
              </div>
            </div>
          </div>
        </div>
      </mat-dialog-content>

      <!-- Actions -->
      <mat-dialog-actions>
        <button mat-raised-button color="primary" (click)="cerrar()">
          <mat-icon>check</mat-icon>
          Entendido
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .ranking-dialog {
      font-family: 'Poppins', sans-serif;
      width: 550px;
      max-width: 100%;
    }

    /* ========== HEADER ========== */
    .dialog-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem;
      background: linear-gradient(135deg, #FFB74D 0%, #FFA726 100%);
      margin: -24px -24px 1.5rem -24px;
      border-radius: 4px 4px 0 0;
    }

    .header-icon {
      width: 50px;
      height: 50px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .header-icon mat-icon {
      color: white;
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .header-text {
      flex: 1;
    }

    .header-text h2 {
      margin: 0;
      color: white;
      font-size: 1.3rem;
      font-weight: 700;
    }

    .header-text p {
      margin: 0.25rem 0 0;
      color: rgba(255, 255, 255, 0.95);
      font-size: 0.9rem;
      font-weight: 500;
    }

    .close-btn {
      color: white;
    }

    .close-btn:hover {
      background: rgba(255, 255, 255, 0.15);
    }

    /* ========== CONTENT ========== */
    .stats-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.25rem;
      background: #E3F2FD;
      border-radius: 0;
      margin: 0 -24px;
      font-size: 0.9rem;
      color: #1976D2;
      font-weight: 500;
      border-bottom: 1px solid #e0e0e0;
    }

    .stats-info mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: #48A3F3;
    }

    mat-dialog-content {
      padding: 0 !important;
      margin: 0 !important;
      max-height: 450px;
      overflow-y: auto;
    }

    /* ========== RANKING LIST ========== */
    .ranking-container {
      padding: 0.75rem 1.25rem;
    }

    .ranking-item {
      display: grid;
      grid-template-columns: 60px 1fr auto;
      align-items: center;
      gap: 1rem;
      padding: 0.875rem;
      margin-bottom: 0.625rem;
      background: #F8F9FA;
      border-radius: 10px;
      border: 2px solid transparent;
      transition: all 0.3s ease;
    }

    .ranking-item:hover {
      background: #F0F7FF;
      transform: translateX(4px);
    }

    .ranking-item.top-1 {
      background: linear-gradient(135deg, #FFF9E6 0%, #FFFAEF 100%);
      border-color: #FFD700;
      box-shadow: 0 4px 12px rgba(255, 215, 0, 0.2);
    }

    .ranking-item.top-2 {
      background: linear-gradient(135deg, #F5F5F5 0%, #FAFAFA 100%);
      border-color: #C0C0C0;
      box-shadow: 0 4px 12px rgba(192, 192, 192, 0.2);
    }

    .ranking-item.top-3 {
      background: linear-gradient(135deg, #FFF3E0 0%, #FFF8F0 100%);
      border-color: #CD7F32;
      box-shadow: 0 4px 12px rgba(205, 127, 50, 0.2);
    }

    .ranking-item.mi-posicion {
      background: #E3F2FD;
      border-color: #48A3F3;
      box-shadow: 0 4px 16px rgba(72, 163, 243, 0.3);
    }

    /* Position Badge */
    .position-badge {
      width: 50px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: white;
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    }

    .trophy-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .trophy-icon.gold {
      color: #FFD700;
    }

    .trophy-icon.silver {
      color: #C0C0C0;
    }

    .trophy-icon.bronze {
      color: #CD7F32;
    }

    .position-number {
      font-size: 1.2rem;
      font-weight: 700;
      color: #666;
    }

    /* Student Info */
    .student-info {
      min-width: 0;
    }

    .student-name {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.95rem;
      font-weight: 600;
      color: #333;
      margin-bottom: 0.25rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .me-badge {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #48A3F3;
    }

    .student-meta {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.8rem;
      color: #666;
    }

    .separator {
      color: #ccc;
    }

    .games-completed {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .games-completed mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    /* Points Display */
    .points-display {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }

    .points-value {
      font-size: 1.35rem;
      font-weight: 700;
      color: #FFB74D;
      line-height: 1;
    }

    .points-label {
      font-size: 0.7rem;
      color: #999;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 0.15rem;
    }

    /* ========== EMPTY STATE ========== */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 3rem 2rem;
      text-align: center;
    }

    .empty-state mat-icon {
      font-size: 80px;
      width: 80px;
      height: 80px;
      color: #ddd;
      margin-bottom: 1rem;
    }

    .empty-state h3 {
      margin: 0 0 0.5rem;
      font-size: 1.2rem;
      color: #666;
    }

    .empty-state p {
      margin: 0;
      font-size: 0.95rem;
      color: #999;
    }

    /* ========== MI POSICIÓN CARD ========== */
    .mi-posicion-card {
      margin: 0.75rem 1.25rem 0;
      padding: 1rem;
      background: linear-gradient(135deg, #E3F2FD 0%, #F0F7FF 100%);
      border: 2px solid #48A3F3;
      border-radius: 10px;
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
      font-weight: 600;
      color: #1976D2;
      font-size: 0.9rem;
    }

    .card-header mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .card-content {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .position-circle {
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #48A3F3 0%, #5bb3ff 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(72, 163, 243, 0.3);
      flex-shrink: 0;
    }

    .big-number {
      font-size: 1.4rem;
      font-weight: 700;
      color: white;
    }

    .position-details {
      flex: 1;
      min-width: 0;
    }

    .position-details h4 {
      margin: 0 0 0.4rem;
      font-size: 1rem;
      color: #333;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .detail-row {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      margin-bottom: 0.2rem;
      font-size: 0.85rem;
      color: #666;
    }

    .detail-row mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #48A3F3;
    }

    /* ========== ACTIONS ========== */
    mat-dialog-actions {
      padding: 0.875rem 0 0 !important;
      margin: 0.875rem 0 0 0 !important;
      border-top: 1px solid #eee;
      display: flex;
      justify-content: center;
    }

    mat-dialog-actions button {
      min-width: 160px;
      height: 40px;
      border-radius: 8px !important;
      font-weight: 600;
      background: linear-gradient(135deg, #48A3F3 0%, #5bb3ff 100%) !important;
      font-size: 0.9rem;
    }

    mat-dialog-actions button mat-icon {
      margin-right: 0.5rem;
    }

    /* ========== SCROLLBAR ========== */
    mat-dialog-content::-webkit-scrollbar {
      width: 8px;
    }

    mat-dialog-content::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 4px;
    }

    mat-dialog-content::-webkit-scrollbar-thumb {
      background: #48A3F3;
      border-radius: 4px;
    }

    mat-dialog-content::-webkit-scrollbar-thumb:hover {
      background: #3d8fd9;
    }

    /* ========== RESPONSIVE ========== */
    @media (max-width: 600px) {
      .ranking-dialog {
        width: 100%;
      }

      .dialog-header {
        padding: 1rem;
      }

      .header-icon {
        width: 40px;
        height: 40px;
      }

      .header-icon mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
      }

      .header-text h2 {
        font-size: 1.1rem;
      }

      .header-text p {
        font-size: 0.85rem;
      }

      .ranking-item {
        padding: 0.75rem;
        gap: 0.75rem;
      }

      .position-badge {
        width: 40px;
        height: 40px;
      }

      .trophy-icon {
        font-size: 26px;
        width: 26px;
        height: 26px;
      }

      .position-number {
        font-size: 1rem;
      }

      .student-name {
        font-size: 0.9rem;
      }

      .student-meta {
        font-size: 0.75rem;
        flex-wrap: wrap;
      }

      .points-value {
        font-size: 1.2rem;
      }

      .card-content {
        flex-direction: column;
        text-align: center;
      }

      .position-circle {
        width: 60px;
        height: 60px;
      }

      .big-number {
        font-size: 1.3rem;
      }

      mat-dialog-actions button {
        min-width: 100%;
      }
    }
  `]
})
export class RankingInlineDialog {
  constructor(
    public dialogRef: MatDialogRef<RankingInlineDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  isInTopRanking(position: number): boolean {
    const topCount = Math.min(10, this.data.ranking?.length || 0);
    return position <= topCount;
  }

  cerrar(): void {
    this.dialogRef.close();
  }
}