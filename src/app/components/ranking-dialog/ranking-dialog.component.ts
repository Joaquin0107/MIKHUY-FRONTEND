import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatDialogModule,
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';
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
    <div class="rk-wrap">
      <!-- HEADER -->
      <div class="rk-header">
        <div class="rk-header-icon">
          <mat-icon>emoji_events</mat-icon>
        </div>
        <div class="rk-header-text">
          <h2>Ranking del Juego</h2>
          <p>{{ data.juegoNombre }}</p>
        </div>
        <button mat-icon-button class="rk-close" (click)="cerrar()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- STATS -->
      <div class="rk-stats" *ngIf="data.totalEstudiantes">
        <mat-icon>group</mat-icon>
        <span
          >{{ data.totalEstudiantes }} estudiante{{
            data.totalEstudiantes !== 1 ? 's' : ''
          }}
          participando</span
        >
      </div>

      <div class="rk-solo" *ngIf="data.ranking && data.ranking.length === 1">
        <div class="rk-solo-card">
          <div class="rk-solo-avatar">
            {{ getInitials(data.ranking[0]?.nombre) }}
          </div>
          <div class="rk-solo-nombre">{{ data.ranking[0]?.nombre }}</div>
          <div class="rk-solo-pts">
            {{ data.ranking[0]?.puntosAcumulados }} pts
          </div>
          <div class="rk-solo-trophy">🥇 1er lugar</div>
          <p class="rk-solo-msg">
            ¡Eres el primero en jugar! Invita a tus compañeros de aula a
            participar para competir con ellos.
          </p>
        </div>
      </div>

      <!-- PODIO TOP 3 -->
      <div class="rk-podium" *ngIf="data.ranking && data.ranking.length >= 3">
        <!-- 2do lugar -->
        <div class="pod pod-2" [class.mi-pod]="data.ranking[1]?.esMiPosicion">
          <div class="pod-trophy">🥈</div>
          <div class="pod-avatar">
            {{ getInitials(data.ranking[1]?.nombre) }}
          </div>
          <div class="pod-name">{{ data.ranking[1]?.nombre }}</div>
          <div class="pod-grade">
            {{ data.ranking[1]?.grado
            }}{{
              data.ranking[1]?.seccion ? '-' + data.ranking[1].seccion : ''
            }}
          </div>
          <div class="pod-pts">{{ data.ranking[1]?.puntosAcumulados }}</div>
          <div class="pod-pts-label">pts</div>
          <div class="pod-me-tag" *ngIf="data.ranking[1]?.esMiPosicion">Tú</div>
        </div>
        <!-- 1er lugar -->
        <div class="pod pod-1" [class.mi-pod]="data.ranking[0]?.esMiPosicion">
          <div class="pod-trophy">🥇</div>
          <div class="pod-avatar">
            {{ getInitials(data.ranking[0]?.nombre) }}
          </div>
          <div class="pod-name">{{ data.ranking[0]?.nombre }}</div>
          <div class="pod-grade">
            {{ data.ranking[0]?.grado
            }}{{
              data.ranking[0]?.seccion ? '-' + data.ranking[0].seccion : ''
            }}
          </div>
          <div class="pod-pts">{{ data.ranking[0]?.puntosAcumulados }}</div>
          <div class="pod-pts-label">pts</div>
          <div class="pod-me-tag" *ngIf="data.ranking[0]?.esMiPosicion">Tú</div>
        </div>
        <!-- 3er lugar -->
        <div class="pod pod-3" [class.mi-pod]="data.ranking[2]?.esMiPosicion">
          <div class="pod-trophy">🥉</div>
          <div class="pod-avatar">
            {{ getInitials(data.ranking[2]?.nombre) }}
          </div>
          <div class="pod-name">{{ data.ranking[2]?.nombre }}</div>
          <div class="pod-grade">
            {{ data.ranking[2]?.grado
            }}{{
              data.ranking[2]?.seccion ? '-' + data.ranking[2].seccion : ''
            }}
          </div>
          <div class="pod-pts">{{ data.ranking[2]?.puntosAcumulados }}</div>
          <div class="pod-pts-label">pts</div>
          <div class="pod-me-tag" *ngIf="data.ranking[2]?.esMiPosicion">Tú</div>
        </div>
      </div>

      <!-- LISTA SCROLLEABLE (#4 en adelante) -->
      <div
        class="rk-scroll-area"
        *ngIf="data.ranking && data.ranking.length > 3"
      >
        <div
          class="rk-item"
          *ngFor="let item of data.ranking.slice(3)"
          [class.me]="item.esMiPosicion"
          [id]="item.esMiPosicion ? 'mi-item' : ''"
        >
          <div class="rk-pos">#{{ item.posicion }}</div>
          <div class="rk-info">
            <div class="rk-info-name">
              {{ item.nombre }}
              <span class="me-tag" *ngIf="item.esMiPosicion">Tú</span>
            </div>
            <div class="rk-info-sub">
              <span
                >{{ item.grado
                }}{{ item.seccion ? '-' + item.seccion : '' }}</span
              >
              <span class="sep">·</span>
              <mat-icon>sports_esports</mat-icon>
              <span
                >{{ item.juegosCompletados || 0 }} juego{{
                  (item.juegosCompletados || 0) !== 1 ? 's' : ''
                }}</span
              >
            </div>
          </div>
          <div class="rk-pts-col">
            <span class="rk-pts-num">{{ item.puntosAcumulados }}</span>
            <span class="rk-pts-lbl">pts</span>
          </div>
        </div>

        <!-- Estado vacío si solo hay 3 o menos -->
        <div class="empty-rest" *ngIf="data.ranking.length === 3">
          <p>Solo hay 3 participantes hasta ahora.</p>
        </div>
      </div>

      <!-- Estado vacío general -->
      <div
        class="empty-state"
        *ngIf="!data.ranking || data.ranking.length === 0"
      >
        <mat-icon>leaderboard</mat-icon>
        <h3>No hay datos de ranking aún</h3>
        <p>Sé el primero en completar este juego</p>
      </div>

      <!-- STICKY: Mi posición (siempre visible si no estoy en top 3) -->
      <div
        class="rk-sticky"
        *ngIf="data.miPosicion && !isInTop3(data.miPosicion.posicion)"
      >
        <div class="rk-mypos-banner">
          <div class="mypos-circle">
            <span>#{{ data.miPosicion.posicion }}</span>
          </div>
          <div class="mypos-info">
            <div class="mypos-label">Tu posición</div>
            <div class="mypos-name">
              {{ data.miPosicion.nombre }}
              <span class="me-tag">Tú</span>
            </div>
            <div class="mypos-meta">
              <span
                >{{ data.miPosicion.grado
                }}{{
                  data.miPosicion.seccion ? '-' + data.miPosicion.seccion : ''
                }}</span
              >
              <span class="sep">·</span>
              <mat-icon>sports_esports</mat-icon>
              <span
                >{{ data.miPosicion.juegosCompletados || 0 }} juego{{
                  (data.miPosicion.juegosCompletados || 0) !== 1 ? 's' : ''
                }}</span
              >
            </div>
          </div>
          <div class="mypos-pts">
            <span class="mypos-pts-num">{{
              data.miPosicion.puntosAcumulados
            }}</span>
            <span class="mypos-pts-lbl">pts</span>
          </div>
        </div>
      </div>

      <!-- FOOTER -->
      <div class="rk-footer">
        <button
          mat-raised-button
          color="primary"
          *ngIf="data.miPosicion && !isInTop3(data.miPosicion.posicion)"
          (click)="scrollAMiPosicion()"
        >
          <mat-icon>my_location</mat-icon>
          Ver mi posición
        </button>
        <button
          mat-raised-button
          [color]="mostrandoEvolucion ? 'accent' : 'basic'"
          (click)="mostrandoEvolucion = !mostrandoEvolucion"
          *ngIf="data.evolucionSemanal && data.evolucionSemanal.length > 1"
        >
          <mat-icon>{{ mostrandoEvolucion ? 'close' : 'show_chart' }}</mat-icon>
          {{ mostrandoEvolucion ? 'Ocultar' : 'Mi Evolución' }}
        </button>
        <button mat-raised-button color="primary" (click)="cerrar()">
          <mat-icon>check</mat-icon>
          Entendido
        </button>
      </div>

      <!-- ══════════════════════════════════════════════════════════
           CP118: Gráfico lineal de evolución de posición semanal
      ═══════════════════════════════════════════════════════════ -->
      <div
        class="rk-evolucion"
        *ngIf="
          mostrandoEvolucion &&
          data.evolucionSemanal &&
          data.evolucionSemanal.length > 1
        "
      >
        <div class="rk-evolucion-header">
          <mat-icon>show_chart</mat-icon>
          <h3>Mi Evolución de Posición</h3>
          <span class="rk-evolucion-sub">Semana a semana</span>
        </div>

        <div class="rk-chart-wrap">
          <svg
            [attr.viewBox]="'0 0 ' + evChartW + ' ' + evChartH"
            class="rk-line-chart"
          >
            <!-- Líneas de cuadrícula horizontales -->
            <line
              *ngFor="let gridY of getGridLines()"
              [attr.x1]="evPadL"
              [attr.y1]="gridY"
              [attr.x2]="evChartW - evPadR"
              [attr.y2]="gridY"
              stroke="#f0f0f0"
              stroke-width="1"
            />

            <!-- Área bajo la curva -->
            <polygon [attr.points]="getEvolucionAreaPoints()" class="ev-area" />

            <!-- Línea de evolución -->
            <polyline
              [attr.points]="getEvolucionLinePoints()"
              class="ev-line"
            />

            <!-- Puntos + tooltip label -->
            <g *ngFor="let pt of getEvolucionPoints(); let i = index">
              <circle
                [attr.cx]="pt.x"
                [attr.cy]="pt.y"
                r="5"
                class="ev-point"
                [class.ev-point-best]="pt.esMejor"
              />
              <text [attr.x]="pt.x" [attr.y]="pt.y - 10" class="ev-pos-label">
                #{{ pt.posicion }}
              </text>
              <text
                [attr.x]="pt.x"
                [attr.y]="evChartH - evPadB + 14"
                class="ev-week-label"
              >
                S{{ i + 1 }}
              </text>
            </g>

            <!-- Eje Y: etiqueta posición -->
            <text
              [attr.x]="evPadL - 6"
              [attr.y]="evPadT + 4"
              class="ev-axis-label"
              text-anchor="end"
            >
              #{{ getEvolucionMinPos() }}
            </text>
            <text
              [attr.x]="evPadL - 6"
              [attr.y]="evChartH - evPadB + 4"
              class="ev-axis-label"
              text-anchor="end"
            >
              #{{ getEvolucionMaxPos() }}
            </text>
          </svg>
        </div>

        <!-- Leyenda inferior -->
        <div class="rk-evolucion-legend">
          <div class="ev-legend-item">
            <span class="ev-dot-best"></span>
            <span>Mejor posición alcanzada</span>
          </div>
          <div class="ev-legend-item">
            <span class="ev-dot-normal"></span>
            <span>Posición semanal</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .rk-solo {
        display: flex;
        justify-content: center;
        padding: 1.5rem 1rem;
      }
      .rk-solo-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        background: #f0f7ff;
        border: 2px solid #bbdefb;
        border-radius: 16px;
        padding: 1.5rem 2rem;
        text-align: center;
        max-width: 320px;
      }
      .rk-solo-avatar {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: linear-gradient(135deg, #ffd700, #ffa500);
        color: white;
        font-size: 1.4rem;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .rk-solo-nombre {
        font-weight: 700;
        font-size: 1rem;
        color: #333;
      }
      .rk-solo-pts {
        color: #f57c00;
        font-weight: 700;
        font-size: 1.1rem;
      }
      .rk-solo-trophy {
        font-size: 0.9rem;
        color: #1565c0;
        font-weight: 600;
      }
      .rk-solo-msg {
        font-size: 0.85rem;
        color: #555;
        line-height: 1.5;
        margin: 4px 0 0;
      }

      /* ── Wrap ────────────────────────────────────────────────────────────── */
      .rk-wrap {
        font-family: 'Poppins', sans-serif;
        max-width: 100%;
        display: flex;
        flex-direction: column;
        max-height: 90vh;
        overflow: hidden;
      }

      /* ── Header ──────────────────────────────────────────────────────────── */
      .rk-header {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 40px 3.5rem;
        background: linear-gradient(135deg, #ffb74d 0%, #f9a825 100%);
        margin: -2px -24px 0 -24px;
        flex-shrink: 0;
      }

      .rk-header-icon {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.25);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .rk-header-icon mat-icon {
        color: #fff;
        font-size: 28px;
        width: 28px;
        height: 28px;
      }

      .rk-header-text {
        flex: 1;
      }
      .rk-header-text h2 {
        margin: 0;
        color: #fff;
        font-size: 1.25rem;
        font-weight: 700;
      }
      .rk-header-text p {
        margin: 2px 0 0;
        color: rgba(255, 255, 255, 0.9);
        font-size: 0.88rem;
      }

      .rk-close {
        color: white !important;
      }
      .rk-close:hover {
        background: rgba(255, 255, 255, 0.15) !important;
      }

      /* ── Stats ───────────────────────────────────────────────────────────── */
      .rk-stats {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 1.5rem;
        background: #e3f2fd;
        border-bottom: 1px solid #b3d9f7;
        font-size: 0.88rem;
        font-weight: 500;
        color: #1565c0;
        flex-shrink: 0;
      }
      .rk-stats mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        color: #42a5f5;
      }

      /* ── Podio ───────────────────────────────────────────────────────────── */
      .rk-podium {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 10px;
        padding: 1.25rem 1.5rem;
        background: #fafafa;
        border-bottom: 1px solid #eee;
        align-items: end;
        flex-shrink: 0;
      }

      .pod {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 5px;
        padding: 12px 6px;
        border-radius: 12px;
        border: 1px solid #e0e0e0;
        background: #fff;
        position: relative;
      }

      .pod-1 {
        order: 2;
        padding-top: 20px;
        border: 2px solid #f9a825;
        box-shadow: 0 0 0 4px rgba(249, 168, 37, 0.12);
      }
      .pod-2 {
        order: 1;
      }
      .pod-3 {
        order: 3;
      }
      .pod.mi-pod {
        box-shadow: 0 0 0 3px #42a5f5;
      }

      .pod-trophy {
        display: flex;
        justify-content: center;
      }
      .pod-1 .pod-trophy {
      }

      .pod-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        font-weight: 600;
      }
      .pod-1 .pod-avatar {
        width: 52px;
        height: 52px;
        font-size: 16px;
        background: #fff3e0;
        color: #e65100;
      }
      .pod-2 .pod-avatar {
        background: #f0f0f0;
        color: #555;
      }
      .pod-3 .pod-avatar {
        background: #fbe9e7;
        color: #bf360c;
      }

      .pod-name {
        font-size: 11px;
        font-weight: 600;
        color: #333;
        text-align: center;
        max-width: 110px;
        line-height: 1.3;
      }
      .pod-1 .pod-name {
        font-size: 12px;
      }
      .pod-grade {
        font-size: 10px;
        color: #888;
      }
      .pod-pts {
        font-size: 17px;
        font-weight: 700;
        color: #f9a825;
      }
      .pod-1 .pod-pts {
        font-size: 22px;
      }
      .pod-pts-label {
        font-size: 10px;
        color: #aaa;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-top: -3px;
      }

      .pod-me-tag {
        position: absolute;
        top: 6px;
        right: 6px;
        font-size: 9px;
        font-weight: 600;
        color: #1565c0;
        background: #bbdefb;
        padding: 2px 6px;
        border-radius: 20px;
      }

      /* ── Scroll area ─────────────────────────────────────────────────────── */
      .rk-scroll-area {
        overflow-y: auto;
        max-height: 180px;
        padding: 0.875rem 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 7px;
        min-height: 0;
      }

      .rk-scroll-area::-webkit-scrollbar {
        width: 6px;
      }
      .rk-scroll-area::-webkit-scrollbar-track {
        background: transparent;
      }
      .rk-scroll-area::-webkit-scrollbar-thumb {
        background: #b0d4f1;
        border-radius: 4px;
      }

      .rk-item {
        display: grid;
        grid-template-columns: 44px 1fr auto;
        align-items: center;
        gap: 12px;
        padding: 11px 14px;
        border-radius: 10px;
        border: 1px solid #ebebeb;
        background: #fff;
        transition: transform 0.15s;
      }
      .rk-item:hover {
        transform: translateX(3px);
      }
      .rk-item.me {
        border: 2px solid #42a5f5;
        background: #e3f2fd;
      }

      .rk-pos {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f0f0f0;
        font-size: 12px;
        font-weight: 600;
        color: #666;
        flex-shrink: 0;
      }
      .rk-item.me .rk-pos {
        background: #42a5f5;
        color: #fff;
      }

      .rk-info-name {
        font-size: 0.9rem;
        font-weight: 600;
        color: #333;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .me-tag {
        font-size: 10px;
        font-weight: 600;
        color: #1565c0;
        background: #bbdefb;
        padding: 2px 7px;
        border-radius: 20px;
        flex-shrink: 0;
      }

      .rk-info-sub {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 0.78rem;
        color: #888;
        margin-top: 2px;
      }
      .rk-info-sub mat-icon {
        font-size: 14px;
        width: 14px;
        height: 14px;
      }
      .sep {
        color: #ccc;
      }

      .rk-pts-col {
        text-align: right;
      }
      .rk-pts-num {
        font-size: 1.2rem;
        font-weight: 700;
        color: #f9a825;
        display: block;
      }
      .rk-pts-lbl {
        font-size: 10px;
        color: #aaa;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      /* ── Empty states ────────────────────────────────────────────────────── */
      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 3rem 2rem;
        text-align: center;
      }
      .empty-state mat-icon {
        font-size: 72px;
        width: 72px;
        height: 72px;
        color: #ddd;
        margin-bottom: 1rem;
      }
      .empty-state h3 {
        margin: 0 0 0.5rem;
        font-size: 1.1rem;
        color: #666;
      }
      .empty-state p {
        margin: 0;
        font-size: 0.9rem;
        color: #999;
      }
      .empty-rest p {
        text-align: center;
        color: #999;
        font-size: 0.85rem;
        padding: 0.5rem 0;
      }

      /* ── Sticky mi posición ──────────────────────────────────────────────── */
      .rk-sticky {
        flex-shrink: 0;
        padding: 10px 1.5rem;
        border-top: 1px solid #eee;
        background: #fff;
      }

      .rk-mypos-banner {
        display: grid;
        grid-template-columns: auto 1fr auto;
        align-items: center;
        gap: 14px;
        padding: 13px 16px;
        border-radius: 12px;
        border: 2px solid #42a5f5;
        background: #e3f2fd;
      }

      .mypos-circle {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: #42a5f5;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .mypos-circle span {
        font-size: 13px;
        font-weight: 700;
        color: #fff;
      }

      .mypos-label {
        font-size: 10px;
        color: #1565c0;
        text-transform: uppercase;
        letter-spacing: 0.6px;
        font-weight: 600;
        margin-bottom: 2px;
      }
      .mypos-name {
        font-size: 14px;
        font-weight: 600;
        color: #333;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .mypos-meta {
        font-size: 12px;
        color: #666;
        display: flex;
        align-items: center;
        gap: 4px;
        margin-top: 3px;
      }
      .mypos-meta mat-icon {
        font-size: 14px;
        width: 14px;
        height: 14px;
      }

      .mypos-pts {
        text-align: right;
      }
      .mypos-pts-num {
        font-size: 1.4rem;
        font-weight: 700;
        color: #42a5f5;
        display: block;
      }
      .mypos-pts-lbl {
        font-size: 10px;
        color: #1565c0;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      /* ── Footer ──────────────────────────────────────────────────────────── */
      .rk-footer {
        flex-shrink: 0;
        padding: 12px 1.5rem;
        border-top: 1px solid #eee;
        display: flex;
        justify-content: center;
        gap: 12px;
        background: #fff;
      }

      .rk-footer button {
        min-width: 140px;
        height: 40px;
        border-radius: 8px !important;
        font-weight: 600;
        font-size: 0.88rem;
      }

      /* ── Responsive ──────────────────────────────────────────────────────── */
      @media (max-width: 600px) {
        .rk-wrap {
          width: 100%;
        }
        .rk-podium {
          padding: 1rem;
          gap: 8px;
        }
        .rk-item {
          padding: 10px 12px;
          gap: 10px;
        }
        .rk-footer button {
          min-width: 120px;
        }
      }

      /* ── Evolución semanal CP118 ──────────────────────────────────────────── */
      .rk-evolucion {
        border-top: 2px solid #e3f2fd;
        background: #f8fbff;
        padding: 16px 20px 20px;
        flex-shrink: 0;
      }

      .rk-evolucion-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
      }

      .rk-evolucion-header mat-icon {
        color: #1976d2;
        font-size: 22px;
        width: 22px;
        height: 22px;
      }

      .rk-evolucion-header h3 {
        margin: 0;
        font-size: 1rem;
        font-weight: 700;
        color: #1565c0;
        flex: 1;
      }

      .rk-evolucion-sub {
        font-size: 0.78rem;
        color: #90a4ae;
      }

      .rk-chart-wrap {
        width: 100%;
        overflow-x: auto;
      }

      .rk-line-chart {
        width: 100%;
        max-width: 520px;
        display: block;
        margin: 0 auto;
      }

      .ev-area {
        fill: rgba(25, 118, 210, 0.08);
      }

      .ev-line {
        fill: none;
        stroke: #1976d2;
        stroke-width: 2.5;
        stroke-linecap: round;
        stroke-linejoin: round;
      }

      .ev-point {
        fill: #1976d2;
        stroke: white;
        stroke-width: 2;
      }

      .ev-point-best {
        fill: #f9a825;
        stroke: white;
        stroke-width: 2.5;
        r: 7;
      }

      .ev-pos-label {
        font-size: 10px;
        fill: #1565c0;
        font-weight: 700;
        text-anchor: middle;
        font-family: 'Poppins', sans-serif;
      }

      .ev-week-label {
        font-size: 9px;
        fill: #90a4ae;
        text-anchor: middle;
        font-family: 'Poppins', sans-serif;
      }

      .ev-axis-label {
        font-size: 9px;
        fill: #bbb;
        font-family: 'Poppins', sans-serif;
      }

      .rk-evolucion-legend {
        display: flex;
        gap: 20px;
        justify-content: center;
        margin-top: 10px;
      }

      .ev-legend-item {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 11px;
        color: #666;
      }

      .ev-dot-best {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: #f9a825;
        border: 2px solid white;
        box-shadow: 0 0 0 1.5px #f9a825;
        flex-shrink: 0;
      }

      .ev-dot-normal {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: #1976d2;
        border: 2px solid white;
        box-shadow: 0 0 0 1.5px #1976d2;
        flex-shrink: 0;
      }
    `,
  ],
})
export class RankingInlineDialog {
  // ── CP118: Evolución de posición semanal ──────────────────────────────────
  mostrandoEvolucion = false;

  // Dimensiones del SVG del gráfico lineal
  readonly evChartW = 480;
  readonly evChartH = 160;
  readonly evPadL = 36;
  readonly evPadR = 16;
  readonly evPadT = 24;
  readonly evPadB = 24;

  constructor(
    public dialogRef: MatDialogRef<RankingInlineDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  /** Devuelve las iniciales (hasta 2 letras) del nombre completo */
  getInitials(nombre: string): string {
    if (!nombre) return '?';
    const partes = nombre.trim().split(' ');
    if (partes.length === 1) return partes[0][0].toUpperCase();
    return (partes[0][0] + partes[1][0]).toUpperCase();
  }

  /** true si la posición está dentro del podio (top 3) */
  isInTop3(posicion: number): boolean {
    return posicion <= 3;
  }

  /** Hace scroll al ítem del usuario en la lista */
  scrollAMiPosicion(): void {
    const el = document.getElementById('mi-item');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  cerrar(): void {
    this.dialogRef.close();
  }

  // ── CP118: helpers para el gráfico de evolución semanal ──────────────────

  /** Posiciones de la serie (ascendente = mejor = más arriba en SVG) */
  private getEvolucionSerie(): { semana: number; posicion: number }[] {
    return (this.data.evolucionSemanal || []) as {
      semana: number;
      posicion: number;
    }[];
  }

  getEvolucionMinPos(): number {
    const s = this.getEvolucionSerie();
    return s.length ? Math.min(...s.map((e) => e.posicion)) : 1;
  }

  getEvolucionMaxPos(): number {
    const s = this.getEvolucionSerie();
    return s.length ? Math.max(...s.map((e) => e.posicion)) : 10;
  }

  /** Convierte posición a coordenada Y (posición baja → arriba del chart) */
  private posToY(pos: number): number {
    const minP = this.getEvolucionMinPos();
    const maxP = this.getEvolucionMaxPos();
    const range = maxP - minP || 1;
    const chartH = this.evChartH - this.evPadT - this.evPadB;
    // posición mejor (menor número) → Y más arriba (evPadT)
    return this.evPadT + ((pos - minP) / range) * chartH;
  }

  private indexToX(i: number, total: number): number {
    const chartW = this.evChartW - this.evPadL - this.evPadR;
    return this.evPadL + (total <= 1 ? chartW / 2 : (i / (total - 1)) * chartW);
  }

  getEvolucionPoints(): {
    x: number;
    y: number;
    posicion: number;
    esMejor: boolean;
  }[] {
    const s = this.getEvolucionSerie();
    const minP = this.getEvolucionMinPos();
    return s.map((e, i) => ({
      x: this.indexToX(i, s.length),
      y: this.posToY(e.posicion),
      posicion: e.posicion,
      esMejor: e.posicion === minP,
    }));
  }

  getEvolucionLinePoints(): string {
    return this.getEvolucionPoints()
      .map((p) => `${p.x},${p.y}`)
      .join(' ');
  }

  getEvolucionAreaPoints(): string {
    const pts = this.getEvolucionPoints();
    if (!pts.length) return '';
    const bottom = this.evChartH - this.evPadB;
    const top = pts.map((p) => `${p.x},${p.y}`).join(' ');
    return `${pts[0].x},${bottom} ${top} ${pts[pts.length - 1].x},${bottom}`;
  }

  /** Líneas horizontales de cuadrícula a intervalos fijos */
  getGridLines(): number[] {
    const lines: number[] = [];
    const steps = 4;
    for (let i = 0; i <= steps; i++) {
      lines.push(
        this.evPadT + (i / steps) * (this.evChartH - this.evPadT - this.evPadB),
      );
    }
    return lines;
  }
}
