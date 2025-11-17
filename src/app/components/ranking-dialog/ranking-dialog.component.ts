import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
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
    <h2 mat-dialog-title>Ranking - {{ data.juegoNombre }}</h2>
    <mat-dialog-content>
      <p *ngIf="data.totalEstudiantes">
        Total de estudiantes: {{ data.totalEstudiantes }}
      </p>

      <mat-list *ngIf="data.ranking && data.ranking.length > 0; else sinDatos">
        <mat-list-item *ngFor="let item of data.ranking">
          <div
            matBadge="{{ item.posicion }}"
            matBadgeColor="primary"
            matBadgePosition="before"
            [ngClass]="{
              'badge-accent': item.esMiPosicion,
              'badge-warn': item.esTop3 && !item.esMiPosicion
            }"
            style="display: flex; align-items: center; width: 100%; padding: 8px 0;"
          >
            <span>
              {{ item.nombre }} ({{ item.grado }}{{ item.seccion ? '-' + item.seccion : '' }})
            </span>
            <span style="flex: 1 1 auto;"></span>
            <strong>{{ item.puntosAcumulados }} pts</strong>
          </div>
        </mat-list-item>
      </mat-list>

      <ng-template #sinDatos>
        <p style="text-align: center; color: #999; padding: 20px;">
          No hay datos de ranking aún.
        </p>
      </ng-template>

      <div *ngIf="data.miPosicion" class="mi-posicion">
        <h4>Tu posición:</h4>
        <p>
          #{{ data.miPosicion.posicion }} - {{ data.miPosicion.nombre }}
          ({{ data.miPosicion.puntosAcumulados }} pts)
        </p>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cerrar</button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      mat-dialog-content {
        max-height: 500px;
        min-width: 400px;
      }

      .badge-accent ::ng-deep .mat-badge-content {
        background-color: #ff4081 !important;
      }

      .badge-warn ::ng-deep .mat-badge-content {
        background-color: #f44336 !important;
      }

      .mi-posicion {
        margin-top: 20px;
        padding-top: 20px;
        border-top: 2px solid #e0e0e0;
      }

      .mi-posicion h4 {
        margin-bottom: 8px;
        color: #1976d2;
      }

      .mi-posicion p {
        font-size: 16px;
        font-weight: 500;
      }

      mat-list-item {
        border-bottom: 1px solid #f0f0f0;
      }

      mat-list-item:hover {
        background-color: #f9f9f9;
      }
    `,
  ],
})
export class RankingInlineDialog {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
}