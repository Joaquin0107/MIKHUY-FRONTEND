import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  MatDialogModule,
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import {
  DashboardService,
  DashboardEstudianteResponse,
  EstudianteResponse,
  JuegoResponse,
  SaludInfo,
  EstadisticasSalud,
} from '../../services/dashboard.service';
import { StudentService } from '../../services/student.service';
import { AuthService } from '../../services/auth.service';
import { MailService } from '../../services/mail.service';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface Student {
  id: string;
  nombre: string;
  apellido: string;
  edad: number;
  grado: string;
  seccion: string;
  talla: string;
  peso: string;
  avatar?: string;
  puntosAcumulados?: number;
}

@Component({
  selector: 'app-dashboards',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatBadgeModule,
    MatMenuModule,
    MatListModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    ReactiveFormsModule,
    MatSnackBarModule,
  ],
  templateUrl: './dashboards.component.html',
  styleUrls: ['./dashboards.component.css'],
})
export class DashboardsComponent implements OnInit {
  notificationCount = 0;
  searchQuery = '';
  selectedStudent: Student | null = null;

  students: Student[] = [];
  filteredStudents: Student[] = [];

  dashboardData: DashboardEstudianteResponse | null = null;
  loading = true;
  error: string | null = null;

  currentUser: any = null;
  isTeacher = false;
  isGeneratingPDF = false;

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private dashboardService: DashboardService,
    private studentService: StudentService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private mailService: MailService,
  ) {}

  ngOnInit(): void {
    this.loadExternalScripts();

    this.currentUser =
      this.authService.getCurrentUser() ||
      JSON.parse(localStorage.getItem('currentUser') || '{}');

    this.isTeacher = this.currentUser?.rol === 'teacher';

    if (this.isTeacher) {
      this.loadAllStudents();
    } else {
      this.loadMyDashboard();
    }
  }

  private loadExternalScripts(): void {
    if (!(window as any).html2canvas) {
      const html2canvasScript = document.createElement('script');
      html2canvasScript.src =
        'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
      document.head.appendChild(html2canvasScript);
    }

    if (!(window as any).jspdf) {
      const jspdfScript = document.createElement('script');
      jspdfScript.src =
        'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      document.head.appendChild(jspdfScript);
    }
  }

  loadMyDashboard(): void {
    this.loading = true;
    this.error = null;

    this.dashboardService.getMiDashboard().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.dashboardData = response.data;
          this.notificationCount =
            response.data.estadisticas?.notificacionesNoLeidas || 0;

          this.selectedStudent = this.mapEstudianteToStudent(
            response.data.estudiante,
          );

          this.verificarAlertasSalud(response.data.salud);

          this.loading = false;
        } else {
          this.error = response.message || 'Error al cargar el dashboard';
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('Error cargando dashboard:', err);
        this.error =
          'Error al cargar el dashboard. Por favor, intenta de nuevo.';
        this.loading = false;
      },
    });
  }

  loadAllStudents(): void {
    this.loading = true;
    this.error = null;

    this.studentService.getAll().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.students = response.data.map((est) => ({
            id: est.id,
            nombre: est.nombres,
            apellido: est.apellidos,
            edad: est.edad,
            grado: est.grado,
            seccion: est.seccion,
            talla: est.talla ? `${est.talla}cm` : 'N/A',
            peso: est.peso ? `${est.peso}kg` : 'N/A',
            avatar: est.avatarUrl,
            puntosAcumulados: est.puntosAcumulados,
          }));

          this.filteredStudents = [...this.students];

          if (this.students.length > 0) {
            this.selectStudent(this.students[0]);
          } else {
            this.loading = false;
            this.error = 'No hay estudiantes registrados';
          }
        } else {
          this.error = response.message || 'Error al cargar estudiantes';
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('Error cargando estudiantes:', err);
        this.error =
          'Error al cargar estudiantes. Por favor, intenta de nuevo.';
        this.loading = false;
      },
    });
  }

  selectStudent(student: Student): void {
    this.selectedStudent = student;
    this.loading = true;

    this.dashboardService.getDashboardEstudiante(student.id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.dashboardData = response.data;

          console.log('Dashboard Data:', this.dashboardData);
          console.log('Salud Info:', this.dashboardData.salud);
          console.log(
            'Historial Mediciones:',
            this.dashboardData.salud?.historialMediciones,
          );

          this.verificarAlertasSalud(response.data.salud);

          this.loading = false;
        } else {
          this.error =
            response.message || 'Error al cargar datos del estudiante';
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('Error cargando dashboard del estudiante:', err);
        this.error = 'Error al cargar datos del estudiante.';
        this.loading = false;
      },
    });
  }

  searchStudents(): void {
    if (!this.searchQuery.trim()) {
      this.filteredStudents = [...this.students];
    } else {
      const query = this.searchQuery.toLowerCase();
      this.filteredStudents = this.students.filter(
        (s) =>
          `${s.nombre} ${s.apellido}`.toLowerCase().includes(query) ||
          s.grado.toLowerCase().includes(query) ||
          s.seccion.toLowerCase().includes(query),
      );
    }
  }

  verificarAlertasSalud(saludInfo: SaludInfo | null | undefined): void {
    if (!saludInfo?.medicionActual || !saludInfo?.estadisticas) {
      return;
    }

    const estado = saludInfo.estadisticas;
    const alertas: string[] = [];

    if (estado.estadoNutricionalActual === 'Obesidad') {
      alertas.push(
        '⚠️ ALERTA: El estudiante presenta obesidad. Se recomienda consulta con nutricionista.',
      );
    } else if (estado.estadoNutricionalActual === 'Bajo peso') {
      alertas.push(
        '⚠️ ALERTA: El estudiante presenta bajo peso. Se recomienda evaluación médica.',
      );
    } else if (estado.estadoNutricionalActual === 'Sobrepeso') {
      alertas.push(
        '⚠️ ADVERTENCIA: El estudiante presenta sobrepeso. Monitorear alimentación y actividad física.',
      );
    }

    if (estado.tendencia === 'Preocupante') {
      alertas.push(
        '📉 TENDENCIA PREOCUPANTE: El estado nutricional ha empeorado. Revisar hábitos alimenticios.',
      );
    }

    if (Math.abs(estado.variacionPeso) > 5) {
      alertas.push(
        `📊 CAMBIO SIGNIFICATIVO: Variación de peso del ${estado.variacionPeso.toFixed(
          1,
        )}% desde la última medición.`,
      );
    }

    if (alertas.length > 0) {
      this.mostrarDialogoAlertas(alertas, estado);
    }
  }

  mostrarDialogoAlertas(alertas: string[], estado: EstadisticasSalud): void {
    const dialogRef = this.dialog.open(AlertaSaludDialog, {
      width: '600px',
      data: {
        alertas: alertas,
        estadisticas: estado,
        estudiante: this.selectedStudent,
      },
      disableClose: false,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'ver-recomendaciones') {
        const element = document.querySelector('.health-recommendation');
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }

  async descargarReporte(): Promise<void> {
    if (!this.selectedStudent || !this.dashboardData) {
      this.snackBar.open('No hay datos para generar el reporte', 'Cerrar', { duration: 3000 });
      return;
    }
    this.isGeneratingPDF = true;
    this.snackBar.open('Generando reporte PDF...', '', { duration: 2000 });
 
    try {
      const pdf  = new jsPDF('p', 'mm', 'a4');
      const PW   = pdf.internal.pageSize.getWidth();   // 210 mm
      const PH   = pdf.internal.pageSize.getHeight();  // 297 mm
      const TOTAL_PAGES = 4;
 
      // ── Paleta ──────────────────────────────────────────────
      const BLUE        = [48,  130, 220] as [number,number,number];
      const BLUE_DARK   = [30,  100, 180] as [number,number,number];
      const BLUE_LIGHT  = [232, 242, 255] as [number,number,number];
      const GREEN       = [76,  175, 80]  as [number,number,number];
      const GREEN_LIGHT = [232, 245, 233] as [number,number,number];
      const ORANGE      = [255, 152, 0]   as [number,number,number];
      const RED         = [244, 67,  54]  as [number,number,number];
      const PURPLE      = [150, 50,  180] as [number,number,number];
      const GRAY_BG     = [248, 249, 250] as [number,number,number];
      const GRAY_LINE   = [220, 220, 220] as [number,number,number];
      const TEXT_DARK   = [33,  37,  41]  as [number,number,number];
      const TEXT_GRAY   = [108, 117, 125] as [number,number,number];
      const WHITE       = [255, 255, 255] as [number,number,number];
 
      // ── Helpers (coordenadas: Y crece hacia ABAJO desde el top) ─
      const sf = (c: [number,number,number]) => pdf.setFillColor(c[0], c[1], c[2]);
      const ss = (c: [number,number,number]) => pdf.setDrawColor(c[0], c[1], c[2]);
      const st = (c: [number,number,number]) => pdf.setTextColor(c[0], c[1], c[2]);
 
      // Rectángulo redondeado: x,y = top-left en mm (Y desde arriba)
      const rr = (x: number, y: number, w: number, h: number,
                  fill: [number,number,number], r = 3) => {
        sf(fill);
        pdf.roundedRect(x, y, w, h, r, r, 'F');
      };
 
      // Rectángulo simple
      const rect = (x: number, y: number, w: number, h: number,
                    fill: [number,number,number]) => {
        sf(fill); pdf.rect(x, y, w, h, 'F');
      };
 
      // Badge centrado
      const badge = (x: number, y: number, label: string,
                     bg: [number,number,number], fg: [number,number,number], w = 40) => {
        rr(x, y, w, 7, bg, 3);
        st(fg); pdf.setFontSize(7.5); pdf.setFont('helvetica', 'bold');
        pdf.text(label, x + w / 2, y + 5, { align: 'center' });
      };
 
      // Línea horizontal
      const hline = (y: number, x1 = 15, x2 = PW - 15) => {
        ss(GRAY_LINE); pdf.setLineWidth(0.3); pdf.line(x1, y, x2, y);
      };
 
      // Barra lateral + título de sección
      const sectionBar = (x: number, y: number, title: string,
                          color: [number,number,number], size = 11) => {
        rect(x, y, 3, 9, color);
        st(TEXT_DARK); pdf.setFontSize(size); pdf.setFont('helvetica', 'bold');
        pdf.text(title, x + 5, y + 6.5);
      };
 
      // Caja de estadística
      const statBox = (x: number, y: number, w: number, h: number,
                       value: string, label: string, accent: [number,number,number]) => {
        rr(x, y, w, h, GRAY_BG, 4);
        rect(x, y, 2.5, h, accent);
        st(accent); pdf.setFontSize(18); pdf.setFont('helvetica', 'bold');
        pdf.text(value, x + w / 2, y + h / 2 + 3, { align: 'center' });
        st(TEXT_GRAY); pdf.setFontSize(7); pdf.setFont('helvetica', 'normal');
        pdf.text(label, x + w / 2, y + h - 3.5, { align: 'center' });
      };
 
      // Arco gauge: segmentos de línea (jsPDF no tiene arc nativo)
      const gaugeArc = (cx: number, cy: number, r: number,
                        startDeg: number, endDeg: number,
                        color: [number,number,number], lw: number, steps = 30) => {
        ss(color); pdf.setLineWidth(lw);
        for (let i = 0; i < steps; i++) {
          const a1 = ((startDeg + (endDeg - startDeg) * i     / steps) * Math.PI) / 180;
          const a2 = ((startDeg + (endDeg - startDeg) * (i+1) / steps) * Math.PI) / 180;
          pdf.line(cx + r * Math.cos(a1), cy + r * Math.sin(a1),
                   cx + r * Math.cos(a2), cy + r * Math.sin(a2));
        }
      };
 
      // Flecha arriba/abajo con líneas
      const arrow = (x: number, y: number, up: boolean,
                     color: [number,number,number]) => {
        ss(color); pdf.setLineWidth(0.9);
        if (up) {
          pdf.line(x, y + 2.5, x, y - 2.5);
          pdf.line(x, y - 2.5, x - 1.8, y);
          pdf.line(x, y - 2.5, x + 1.8, y);
        } else {
          pdf.line(x, y - 2.5, x, y + 2.5);
          pdf.line(x, y + 2.5, x - 1.8, y);
          pdf.line(x, y + 2.5, x + 1.8, y);
        }
      };
 
      // ══════════════════════════════════════════════════════
      //  PÁGINA 1 — Perfil + Salud + Estadísticas
      // ══════════════════════════════════════════════════════
      this.pdfHeader(pdf, 'REPORTE NUTRICIONAL',
        'Plataforma MIKHUY  |  Sistema de Seguimiento Estudiantil', '1 de 4',
        PW, BLUE, BLUE_DARK, WHITE);
 
      st([170, 205, 245]); pdf.setFontSize(8); pdf.setFont('helvetica', 'normal');
      pdf.text(`Generado: ${new Date().toLocaleDateString('es-ES',
        { day: '2-digit', month: 'long', year: 'numeric' })}`, 18, 37);
 
      let y = 48; // cursor top-down en mm
 
      // Avatar silueta
      sf(BLUE_LIGHT); pdf.circle(28, y + 13, 13, 'F');
      sf(BLUE);       pdf.circle(28, y + 9,   5, 'F');
                      pdf.circle(28, y + 19,  8, 'F');
 
      st(TEXT_DARK); pdf.setFontSize(16); pdf.setFont('helvetica', 'bold');
      pdf.text(`${this.selectedStudent.nombre} ${this.selectedStudent.apellido}`, 47, y + 7);
      st(TEXT_GRAY); pdf.setFontSize(9); pdf.setFont('helvetica', 'normal');
      pdf.text(
        `Edad: ${this.selectedStudent.edad} años   |   Grado: ${this.selectedStudent.grado} — Sección ${this.selectedStudent.seccion}`,
        47, y + 15);
      badge(47, y + 20,
        `${this.dashboardData.estadisticas.puntosGanados} pts acumulados`,
        BLUE_LIGHT, BLUE, 52);
 
      y += 32;
      hline(y); y += 8;
 
      // — ANÁLISIS DE SALUD —
      if (this.dashboardData.salud?.medicionActual) {
        const med   = this.dashboardData.salud.medicionActual;
        const stats = this.dashboardData.salud.estadisticas;
 
        sectionBar(15, y, 'ANÁLISIS DE SALUD', RED);
        y += 14;
 
        const cardH = 68;
        rr(15, y, PW - 30, cardH, GRAY_BG, 4);
 
        // Gauge: centro en (50, y + cardH/2)
        const cx = 50, cyG = y + cardH / 2;
        const gR = 19;
        gaugeArc(cx, cyG, gR, 180, 360, [210,210,210], 5.5); // fondo gris
        gaugeArc(cx, cyG, gR, 180, 225, [66, 165,245],  5);  // azul
        gaugeArc(cx, cyG, gR, 225, 270, [102,187,106],  5);  // verde
        gaugeArc(cx, cyG, gR, 270, 315, [255,167,38 ],  5);  // naranja
        gaugeArc(cx, cyG, gR, 315, 360, [239,83, 80 ],  5);  // rojo
 
        // Aguja
        const imc     = stats?.imcActual || 0;
        const imcNorm = Math.min(Math.max((imc - 10) / 35, 0), 1);
        const nRad    = ((180 + imcNorm * 180) * Math.PI) / 180;
        ss(TEXT_DARK); pdf.setLineWidth(1);
        pdf.line(cx, cyG, cx + (gR - 3) * Math.cos(nRad), cyG + (gR - 3) * Math.sin(nRad));
        sf(TEXT_DARK); pdf.circle(cx, cyG, 2, 'F');
        sf(WHITE);     pdf.circle(cx, cyG, 1, 'F');
 
        // Valor IMC (debajo del gauge)
        st(TEXT_DARK); pdf.setFontSize(14); pdf.setFont('helvetica', 'bold');
        pdf.text(imc.toFixed(1), cx, cyG + 10, { align: 'center' });
        st(TEXT_GRAY); pdf.setFontSize(7); pdf.setFont('helvetica', 'normal');
        pdf.text('Índice de Masa Corporal', cx, cyG + 16, { align: 'center' });
 
        // Badge estado nutricional
        const ec  = this.getEstadoColor(stats?.estadoNutricionalActual || '');
        const eFg: [number,number,number] = [ec.r, ec.g, ec.b];
        const eBg: [number,number,number] = [
          Math.min(ec.r + 150, 255), Math.min(ec.g + 150, 255), Math.min(ec.b + 150, 255)];
        badge(cx - 18, y + cardH - 9, stats?.estadoNutricionalActual || '-', eBg, eFg, 36);
 
        // 4 datos a la derecha del gauge
        const rx = 88;
        [
          { l: 'Peso',       v: `${med.peso} kg`,             c: BLUE    },
          { l: 'Talla',      v: `${med.talla} cm`,            c: GREEN   },
          { l: 'Tendencia',  v: stats?.tendencia || '-',       c: ORANGE  },
          { l: 'Mediciones', v: `${stats?.totalMediciones||0}`,c: TEXT_GRAY },
        ].forEach((item, i) => {
          const ix = rx + (i % 2) * 55;
          const iy = y + 8 + Math.floor(i / 2) * 24;
          sf(item.c); pdf.circle(ix, iy + 3, 1.8, 'F');
          st(TEXT_GRAY); pdf.setFontSize(7.5); pdf.setFont('helvetica', 'normal');
          pdf.text(item.l, ix + 5, iy + 4);
          st(TEXT_DARK); pdf.setFontSize(13); pdf.setFont('helvetica', 'bold');
          pdf.text(item.v, ix + 5, iy + 13);
        });
 
        // Variaciones con flechas
        const vy = y + cardH - 9;
        if (stats?.variacionPeso !== 0) {
          const up = (stats?.variacionPeso || 0) > 0;
          arrow(rx + 4, vy, up, up ? RED : GREEN);
          st(up ? RED : GREEN); pdf.setFontSize(7.5); pdf.setFont('helvetica', 'bold');
          pdf.text(`${Math.abs(stats?.variacionPeso || 0).toFixed(1)}% vs medicion anterior`,
            rx + 9, vy + 2);
        }
        if ((stats?.variacionTalla || 0) > 0) {
          arrow(rx + 58, vy, true, GREEN);
          st(GREEN); pdf.setFontSize(7.5); pdf.setFont('helvetica', 'bold');
          pdf.text(`+${(stats?.variacionTalla || 0).toFixed(1)}% crecimiento`, rx + 63, vy + 2);
        }
 
        y += cardH + 4;
 
        // Caja de recomendación
        if (stats?.recomendacion) {
          const splitRec = pdf.splitTextToSize(stats.recomendacion, PW - 52);
          const recH = Math.max(14, splitRec.length * 5.5 + 10);
          rr(15, y, PW - 30, recH, BLUE_LIGHT, 3);
          rect(15, y, 2.5, recH, BLUE);
          st(BLUE); pdf.setFontSize(8); pdf.setFont('helvetica', 'bold');
          pdf.text('Recomendacion:', 21, y + 8);
          st(TEXT_DARK); pdf.setFont('helvetica', 'normal');
          pdf.text(splitRec, 21, y + 14);
          y += recH + 7;
        }
      }
 
      hline(y); y += 8;
 
      // — ESTADÍSTICAS GENERALES —
      sectionBar(15, y, 'ESTADÍSTICAS GENERALES', BLUE);
      y += 12;
 
      const s2 = this.dashboardData.estadisticas;
      const bw = (PW - 40) / 4;
      [
        { v: String(s2.puntosGanados),     l: 'Puntos Ganados',     c: ORANGE },
        { v: String(s2.juegosCompletados), l: 'Juegos Completos',   c: GREEN  },
        { v: String(s2.totalSesiones),     l: 'Total Sesiones',      c: BLUE   },
        { v: `#${s2.posicionRanking}`,     l: `de ${s2.totalEstudiantes} est.`, c: RED },
      ].forEach((s, i) => statBox(15 + i * (bw + 2.5), y, bw, 28, s.v, s.l, s.c));
 
      this.pdfFooter(pdf, 1, TOTAL_PAGES, PW, PH, BLUE, WHITE);
 
      // ═══════════════════════════════════════════════
      // PÁGINA 2 — Progreso por Juego
      // ═══════════════════════════════════════════════
      pdf.addPage();
      this.pdfHeader(pdf, 'PROGRESO POR JUEGO', 'Plataforma MIKHUY',
        '2 de 4', PW, BLUE, BLUE_DARK, WHITE);
      let y2 = 48;
 
      st(TEXT_GRAY); pdf.setFontSize(8.5); pdf.setFont('helvetica', 'normal');
      pdf.text(`Se muestran ${this.dashboardData.juegos?.length || 0} actividad(es) registradas.`, 15, y2);
      y2 += 10;
 
      const cardH2 = 56;
      (this.dashboardData.juegos || []).forEach((juego: any) => {
        const pct    = Math.min(100, this.calcularPorcentajeProgreso(juego));
        const bColor: [number,number,number] = juego.completado ? GREEN  : BLUE;
        const bBg:    [number,number,number] = juego.completado ? GREEN_LIGHT : BLUE_LIGHT;
        const bLabel  = juego.completado ? 'COMPLETADO' : 'EN PROGRESO';
 
        rr(15, y2, PW - 30, cardH2 - 4, GRAY_BG, 5);
        rect(15, y2, 4, cardH2 - 4, bColor);
 
        st(TEXT_DARK); pdf.setFontSize(12); pdf.setFont('helvetica', 'bold');
        pdf.text(juego.nombre, 24, y2 + 12);
        badge(PW - 42, y2 + 4, bLabel, bBg, bColor, 24);
 
        const barX = 24, barW = PW - 60, barH = 9, barY = y2 + 19;
        rr(barX, barY, barW, barH, GRAY_LINE, 4);
        if (pct > 0) rr(barX, barY, Math.max(4, barW * pct / 100), barH, bColor, 4);
        st(bColor); pdf.setFontSize(14); pdf.setFont('helvetica', 'bold');
        pdf.text(`${pct}%`, barX + barW + 4, barY + 7);
 
        const metrics = [
          { v: `Nivel ${juego.nivelActual||0}/${juego.maxNiveles}`, l: 'Progreso'         },
          { v: `${(juego.puntosGanados||0).toLocaleString()} pts`,  l: 'Puntos obtenidos' },
          { v: `${juego.vecesJugado||0}x`,                          l: 'Veces jugado'     },
        ];
        const mW = barW / metrics.length;
        metrics.forEach((m, mi) => {
          const mx2 = barX + mi * mW;
          st(TEXT_DARK); pdf.setFontSize(10); pdf.setFont('helvetica', 'bold');
          pdf.text(m.v, mx2, y2 + 39);
          st(TEXT_GRAY); pdf.setFontSize(7); pdf.setFont('helvetica', 'normal');
          pdf.text(m.l, mx2, y2 + 46);
        });
 
        y2 += cardH2 + 3;
      });
 
      this.pdfFooter(pdf, 2, TOTAL_PAGES, PW, PH, BLUE, WHITE);
 
      // ═══════════════════════════════════════════════
      // PÁGINA 3 — Evolución de Indicadores
      // ═══════════════════════════════════════════════
      if ((this.dashboardData.salud?.historialMediciones?.length || 0) >= 2) {
        pdf.addPage();
        this.pdfHeader(pdf, 'EVOLUCION DE INDICADORES DE SALUD',
          'Plataforma MIKHUY', '3 de 4', PW, BLUE, BLUE_DARK, WHITE);
 
        const mediciones = [...this.dashboardData.salud!.historialMediciones]
          .sort((a: any, b: any) =>
            new Date(a.fechaRegistro).getTime() - new Date(b.fechaRegistro).getTime());
 
        let y3 = 46;
        [
          { titulo: 'Evolucion de Peso',  unidad: 'kg',  color: BLUE,   getter: (m: any) => Number(m.peso)  },
          { titulo: 'Evolucion de Talla', unidad: 'cm',  color: GREEN,  getter: (m: any) => Number(m.talla) },
          { titulo: 'Evolucion del IMC',  unidad: 'IMC', color: PURPLE, getter: (m: any) => Number(m.imc)   },
        ].forEach(cfg => {
          y3 = this.drawLineChart(pdf, y3, PW, mediciones,
            cfg.titulo, cfg.unidad, cfg.color, cfg.getter,
            TEXT_DARK, TEXT_GRAY, GRAY_BG, GRAY_LINE, WHITE);
          y3 += 5;
        });
      }
      this.pdfFooter(pdf, 3, TOTAL_PAGES, PW, PH, BLUE, WHITE);
 
      // ═══════════════════════════════════════════════
      // PÁGINA 4 — Recomendaciones y Conclusiones
      // ═══════════════════════════════════════════════
      pdf.addPage();
      this.pdfHeader(pdf, 'RECOMENDACIONES Y CONCLUSIONES',
        'Plataforma MIKHUY', '4 de 4', PW, BLUE, BLUE_DARK, WHITE);
      let y4 = 48;
 
      y4 = this.addRecommendationSection(pdf, y4, PW,
        'RECOMENDACIONES DE SALUD',
        this.dashboardData.salud?.estadisticas?.recomendacion ||
          'Estado dentro de los parametros normales.',
        RED, GRAY_BG, TEXT_DARK, TEXT_GRAY);
 
      const acadItems: string[] = [];
      if ((this.dashboardData.estadisticas?.juegosCompletados || 0) < 3)
        acadItems.push('Completar todos los juegos educativos para una evaluacion nutricional completa.');
      if ((this.dashboardData.estadisticas?.puntosGanados || 0) < 1000)
        acadItems.push('Incrementar la participacion en actividades educativas.');
      if (!acadItems.length)
        acadItems.push('Excelente participacion en los juegos educativos. Sigue asi!');
 
      y4 = this.addRecommendationSection(pdf, y4, PW,
        'RECOMENDACIONES ACADEMICAS',
        acadItems.join(' '),
        BLUE, GRAY_BG, TEXT_DARK, TEXT_GRAY);
 
      y4 += 4;
      rect(15, y4, 3, 9, BLUE);
      st(TEXT_DARK); pdf.setFontSize(11); pdf.setFont('helvetica', 'bold');
      pdf.text('CONCLUSION', 21, y4 + 6.5);
      y4 += 13;
 
      const conclusionText = this.generarConclusionTexto();
      const splitConc = pdf.splitTextToSize(conclusionText, PW - 46);
      const concH = Math.max(32, splitConc.length * 6.5 + 16);
      rr(15, y4, PW - 30, concH, GRAY_BG, 5);
      rect(15, y4, PW - 30, 4, BLUE);
      st(TEXT_DARK); pdf.setFontSize(10); pdf.setFont('helvetica', 'normal');
      pdf.text(splitConc, 23, y4 + 13);
 
      y4 += concH + 12;
      hline(y4);
      st(TEXT_GRAY); pdf.setFontSize(8); pdf.setFont('helvetica', 'italic');
      pdf.text('Este reporte fue generado automaticamente por la Plataforma MIKHUY.',
        PW / 2, y4 + 7,  { align: 'center' });
      pdf.text('Para consultas adicionales, comuniquese con el equipo docente.',
        PW / 2, y4 + 13, { align: 'center' });
 
      this.pdfFooter(pdf, 4, TOTAL_PAGES, PW, PH, BLUE, WHITE);
 
      const fileName = `Reporte_${this.selectedStudent.nombre}_${this.selectedStudent.apellido}_${Date.now()}.pdf`;
      pdf.save(fileName);
      this.snackBar.open('Reporte PDF generado exitosamente', 'Cerrar', { duration: 3000 });
      this.isGeneratingPDF = false;
 
    } catch (error) {
      console.error('Error generando PDF:', error);
      this.snackBar.open('Error al generar el reporte PDF', 'Cerrar', { duration: 3000 });
      this.isGeneratingPDF = false;
    }
  }
 
  private pdfHeader(
    pdf: any, title: string, subtitle: string, pageLabel: string,
    PW: number, blue: [number,number,number], blueDark: [number,number,number],
    white: [number,number,number]
  ): void {
    pdf.setFillColor(blue[0], blue[1], blue[2]);
    pdf.rect(0, 0, PW, 40, 'F');
    pdf.setFillColor(blueDark[0], blueDark[1], blueDark[2]);
    pdf.rect(PW - 38, 0, 38, 40, 'F');
    pdf.setTextColor(white[0], white[1], white[2]);
    pdf.setFontSize(16); pdf.setFont('helvetica', 'bold');
    pdf.text(title, 18, 19);
    pdf.setFontSize(8); pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(200, 225, 255);
    pdf.text(subtitle, 18, 29);
    pdf.setFontSize(9); pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(170, 205, 245);
    pdf.text(pageLabel, PW - 6, 18, { align: 'right' });
  }
 
  private pdfFooter(
    pdf: any, page: number, total: number,
    PW: number, PH: number,
    blue: [number,number,number], white: [number,number,number]
  ): void {
    pdf.setFillColor(blue[0], blue[1], blue[2]);
    pdf.rect(0, PH - 12, PW, 12, 'F');
    pdf.setTextColor(white[0], white[1], white[2]);
    pdf.setFontSize(7.5); pdf.setFont('helvetica', 'normal');
    pdf.text('Plataforma MIKHUY — Sistema de Seguimiento Nutricional Estudiantil',
      15, PH - 4.5);
    pdf.text(`Pagina ${page} de ${total}`, PW - 15, PH - 4.5, { align: 'right' });
  }
 
  private drawLineChart(
    pdf: any, startY: number, PW: number, mediciones: any[],
    titulo: string, unidad: string, lineColor: [number,number,number],
    getValue: (m: any) => number,
    textDark: [number,number,number], textGray: [number,number,number],
    grayBg: [number,number,number], grayLine: [number,number,number],
    white: [number,number,number]
  ): number {
    const cardH  = 62;
    const padL   = 18, padR = 12, padT = 18, padB = 16;
    const chartX = 14 + padL;
    const chartW = PW - 28 - padL - padR;
    const chartY = startY + padT;
    const chartH = cardH - padT - padB;
 
    pdf.setFillColor(grayBg[0], grayBg[1], grayBg[2]);
    pdf.roundedRect(14, startY, PW - 28, cardH, 3, 3, 'F');
    pdf.setFillColor(lineColor[0], lineColor[1], lineColor[2]);
    pdf.roundedRect(14, startY, PW - 28, 3, 1, 1, 'F');
 
    pdf.setTextColor(textDark[0], textDark[1], textDark[2]);
    pdf.setFontSize(10); pdf.setFont('helvetica', 'bold');
    pdf.text(titulo, 19, startY + 13);
 
    pdf.setFillColor(lineColor[0], lineColor[1], lineColor[2]);
    pdf.roundedRect(PW - 32, startY + 4, 16, 7, 2, 2, 'F');
    pdf.setTextColor(white[0], white[1], white[2]);
    pdf.setFontSize(6.5); pdf.setFont('helvetica', 'bold');
    pdf.text(unidad, PW - 24, startY + 9.5, { align: 'center' });
 
    if (mediciones.length < 2) {
      pdf.setTextColor(textGray[0], textGray[1], textGray[2]);
      pdf.setFontSize(8);
      pdf.text('Se necesitan al menos 2 mediciones.',
        chartX + chartW / 2, startY + cardH / 2, { align: 'center' });
      return startY + cardH;
    }
 
    const valores = mediciones.map(getValue);
    const mn  = Math.min(...valores);
    const mx  = Math.max(...valores);
    const pad = (mx - mn) * 0.15 || 1;
    const minV  = mn - pad;
    const range = (mx + pad) - (mn - pad);
 
    // Grid + etiquetas Y
    pdf.setDrawColor(grayLine[0], grayLine[1], grayLine[2]);
    [0, 0.5, 1].forEach(t => {
      const gy  = chartY + chartH * t;
      const val = minV + range * (1 - t);
      pdf.setLineWidth(0.2); pdf.line(chartX, gy, chartX + chartW, gy);
      pdf.setTextColor(textGray[0], textGray[1], textGray[2]);
      pdf.setFontSize(6); pdf.setFont('helvetica', 'normal');
      pdf.text(val >= 100 ? val.toFixed(0) : val.toFixed(1),
        chartX - 2, gy + 1.5, { align: 'right' });
    });
 
    pdf.setLineWidth(0.5);
    pdf.line(chartX, chartY + chartH, chartX + chartW, chartY + chartH);
 
    // Puntos: valor alto → Y pequeño (arriba)
    const pts = mediciones.map((m, i) => ({
      x: chartX + chartW * i / (mediciones.length - 1),
      y: chartY + chartH * (1 - (getValue(m) - minV) / range),
      v: getValue(m),
      f: new Date(m.fechaRegistro).toLocaleDateString('es-ES',
           { day: '2-digit', month: 'short' }),
    }));
 
    // Área relleno con líneas verticales
    const aC: [number,number,number] = [
      Math.min(lineColor[0] + 170, 255),
      Math.min(lineColor[1] + 170, 255),
      Math.min(lineColor[2] + 170, 255),
    ];
    pdf.setDrawColor(aC[0], aC[1], aC[2]); pdf.setLineWidth(0.4);
    for (let s = 0; s <= 80; s++) {
      const t  = s / 80;
      const sx = chartX + t * chartW;
      const si = Math.min(Math.floor(t * (pts.length - 1)), pts.length - 2);
      const sy = pts[si].y + (pts[si+1].y - pts[si].y) * (t * (pts.length-1) - si);
      pdf.line(sx, sy, sx, chartY + chartH);
    }
 
    // Línea principal
    pdf.setDrawColor(lineColor[0], lineColor[1], lineColor[2]);
    pdf.setLineWidth(1.8);
    for (let i = 0; i < pts.length - 1; i++)
      pdf.line(pts[i].x, pts[i].y, pts[i+1].x, pts[i+1].y);
 
    // Puntos + valores + fechas
    pts.forEach((p) => {
      pdf.setFillColor(white[0], white[1], white[2]);
      pdf.setDrawColor(lineColor[0], lineColor[1], lineColor[2]);
      pdf.setLineWidth(1.4); pdf.circle(p.x, p.y, 2.5, 'FD');
      pdf.setTextColor(lineColor[0], lineColor[1], lineColor[2]);
      pdf.setFontSize(6.5); pdf.setFont('helvetica', 'bold');
      pdf.text(p.v >= 100 ? p.v.toFixed(0) : p.v.toFixed(1),
        p.x, p.y - 4, { align: 'center' });
      pdf.setTextColor(textGray[0], textGray[1], textGray[2]);
      pdf.setFontSize(6); pdf.setFont('helvetica', 'normal');
      pdf.text(p.f, p.x, chartY + chartH + 6, { align: 'center' });
    });
 
    return startY + cardH;
  }
 
  private addRecommendationSection(
    pdf: any, y: number, PW: number,
    sectionTitle: string, content: string,
    accent: [number,number,number], grayBg: [number,number,number],
    textDark: [number,number,number], textGray: [number,number,number]
  ): number {
    pdf.setFillColor(accent[0], accent[1], accent[2]);
    pdf.rect(15, y, 3, 9, 'F');
    pdf.setTextColor(textDark[0], textDark[1], textDark[2]);
    pdf.setFontSize(11); pdf.setFont('helvetica', 'bold');
    pdf.text(sectionTitle, 21, y + 6.5);
    y += 13;
 
    const lines = pdf.splitTextToSize(content, PW - 46);
    const boxH  = Math.max(18, lines.length * 6 + 12);
    pdf.setFillColor(grayBg[0], grayBg[1], grayBg[2]);
    pdf.roundedRect(15, y, PW - 30, boxH, 3, 3, 'F');
    pdf.setFillColor(accent[0], accent[1], accent[2]);
    pdf.rect(15, y, 3, boxH, 'F');
    pdf.setTextColor(textDark[0], textDark[1], textDark[2]);
    pdf.setFontSize(9.5); pdf.setFont('helvetica', 'normal');
    pdf.text(lines, 23, y + 9);
    return y + boxH + 10;
  }
 
  private generarConclusionTexto(): string {
    let txt = `El estudiante ${this.selectedStudent?.nombre} ${this.selectedStudent?.apellido} `;
    if (this.dashboardData?.salud?.estadisticas) {
      const e = this.dashboardData.salud.estadisticas;
      txt += `presenta un estado nutricional ${e.estadoNutricionalActual.toLowerCase()} `;
      txt += `con un IMC de ${e.imcActual.toFixed(1)}. `;
      txt += `La tendencia registrada es ${e.tendencia.toLowerCase()} `;
      txt += `con ${e.totalMediciones} medicion(es) en el sistema. `;
    }
    const s = this.dashboardData?.estadisticas;
    if (s) {
      txt += `Ha acumulado ${s.puntosGanados} puntos y completado ${s.juegosCompletados} juego(s), `;
      txt += `ubicandose en la posicion #${s.posicionRanking} del ranking de ${s.totalEstudiantes} estudiantes. `;
    }
    txt += 'Se recomienda continuar con el seguimiento periodico y reforzar los habitos saludables aprendidos en la plataforma MIKHUY.';
    return txt;
  }

  private async addHealthChartToPDF(
    pdf: any,
    yPos: number,
    tipo: 'peso' | 'talla' | 'imc',
  ): Promise<void> {
    const pageWidth = pdf.internal.pageSize.getWidth();

    let titulo = '';
    let unidad = '';
    let color = { r: 72, g: 163, b: 243 };

    switch (tipo) {
      case 'peso':
        titulo = 'Evolución de Peso';
        unidad = 'kg';
        color = { r: 72, g: 163, b: 243 };
        break;
      case 'talla':
        titulo = 'Evolución de Talla';
        unidad = 'cm';
        color = { r: 123, g: 198, b: 126 };
        break;
      case 'imc':
        titulo = 'Evolución del IMC';
        unidad = 'IMC';
        color = { r: 156, g: 39, b: 176 };
        break;
    }

    pdf.setFillColor(248, 249, 250);
    pdf.rect(15, yPos - 5, pageWidth - 30, 45, 'F');

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text(titulo, 20, yPos + 3);

    const mediciones = [...this.dashboardData!.salud!.historialMediciones].sort(
      (a, b) =>
        new Date(a.fechaRegistro).getTime() -
        new Date(b.fechaRegistro).getTime(),
    );

    const chartWidth = pageWidth - 60;
    const chartHeight = 25;
    const startX = 30;
    const startY = yPos + 10;

    pdf.setDrawColor(224, 224, 224);
    pdf.line(
      startX,
      startY + chartHeight,
      startX + chartWidth,
      startY + chartHeight,
    );

    let valores: number[] = [];
    if (tipo === 'peso') {
      valores = mediciones.map((m) => m.peso);
    } else if (tipo === 'talla') {
      valores = mediciones.map((m) => m.talla);
    } else {
      valores = mediciones.map((m) => m.imc);
    }

    const minVal = Math.min(...valores) * 0.95;
    const maxVal = Math.max(...valores) * 1.05;

    pdf.setDrawColor(color.r, color.g, color.b);
    pdf.setLineWidth(1);

    for (let i = 0; i < valores.length - 1; i++) {
      const x1 = startX + (i * chartWidth) / (valores.length - 1);
      const y1 =
        startY +
        chartHeight -
        ((valores[i] - minVal) / (maxVal - minVal)) * chartHeight;
      const x2 = startX + ((i + 1) * chartWidth) / (valores.length - 1);
      const y2 =
        startY +
        chartHeight -
        ((valores[i + 1] - minVal) / (maxVal - minVal)) * chartHeight;

      pdf.line(x1, y1, x2, y2);
    }

    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.text(
      `${minVal.toFixed(1)} ${unidad}`,
      startX - 15,
      startY + chartHeight,
    );
    pdf.text(`${maxVal.toFixed(1)} ${unidad}`, startX - 15, startY);
  }

  private getEstadoColor(estado: string): { r: number; g: number; b: number } {
    switch (estado) {
      case 'Bajo peso':
        return { r: 25, g: 118, b: 210 };
      case 'Normal':
        return { r: 56, g: 142, b: 60 };
      case 'Sobrepeso':
        return { r: 245, g: 124, b: 0 };
      case 'Obesidad':
        return { r: 211, g: 47, b: 47 };
      default:
        return { r: 0, g: 0, b: 0 };
    }
  }

  private tieneAlertasSalud(stats: EstadisticasSalud): boolean {
    return (
      stats.estadoNutricionalActual === 'Obesidad' ||
      stats.estadoNutricionalActual === 'Bajo peso' ||
      stats.tendencia === 'Preocupante' ||
      Math.abs(stats.variacionPeso) > 5
    );
  }

  private getAlertaTexto(stats: EstadisticasSalud): string {
    const alertas: string[] = [];

    if (stats.estadoNutricionalActual === 'Obesidad') {
      alertas.push('Obesidad detectada - Consulta médica recomendada');
    } else if (stats.estadoNutricionalActual === 'Bajo peso') {
      alertas.push('Bajo peso detectado - Evaluación nutricional necesaria');
    }

    if (stats.tendencia === 'Preocupante') {
      alertas.push('Tendencia negativa en estado nutricional');
    }

    if (Math.abs(stats.variacionPeso) > 5) {
      alertas.push(
        `Cambio significativo de peso (${stats.variacionPeso.toFixed(1)}%)`,
      );
    }

    return alertas.join('. ');
  }

  private generarRecomendacionesCompletas(): string {
    let recomendaciones = '';

    if (this.dashboardData?.salud?.estadisticas) {
      recomendaciones += 'RECOMENDACIONES DE SALUD:\n\n';
      recomendaciones +=
        this.dashboardData.salud.estadisticas.recomendacion + '\n\n';
    }

    const stats = this.dashboardData?.estadisticas;
    if (stats) {
      recomendaciones += 'RECOMENDACIONES ACADÉMICAS:\n\n';

      if (stats.juegosCompletados < 3) {
        recomendaciones +=
          '• Se recomienda completar todos los juegos educativos para una evaluación nutricional completa.\n\n';
      }

      if (stats.puntosGanados < 1000) {
        recomendaciones +=
          '• Incrementar la participación en actividades educativas para reforzar conocimientos nutricionales.\n\n';
      }
    }

    recomendaciones += 'CONCLUSIÓN:\n\n';
    recomendaciones += `El estudiante ${this.selectedStudent?.nombre} ${this.selectedStudent?.apellido} `;

    if (this.dashboardData?.salud?.estadisticas) {
      const estado =
        this.dashboardData.salud.estadisticas.estadoNutricionalActual;
      recomendaciones += `presenta un estado nutricional ${estado.toLowerCase()}. `;
    }

    if (stats) {
      recomendaciones += `Ha acumulado ${stats.puntosAcumulados} puntos y se encuentra en la posición #${stats.posicionRanking} del ranking. `;
    }

    recomendaciones +=
      'Se recomienda continuar con el seguimiento periódico y reforzar los hábitos saludables aprendidos en la plataforma.';

    return recomendaciones;
  }

  private waitForLibraries(): Promise<void> {
    return new Promise((resolve) => {
      const checkLibraries = () => {
        if ((window as any).jspdf && (window as any).html2canvas) {
          resolve();
        } else {
          setTimeout(checkLibraries, 100);
        }
      };
      checkLibraries();
    });
  }

  getJuegoData(nombreJuego: string): JuegoResponse | null {
    if (!this.dashboardData || !this.dashboardData.juegos) return null;

    return (
      this.dashboardData.juegos.find((j) =>
        j.nombre.toLowerCase().includes(nombreJuego.toLowerCase()),
      ) || null
    );
  }

  calcularPorcentajeProgreso(juego: JuegoResponse): number {
    if (!juego || !juego.nivelActual || !juego.maxNiveles) return 0;
    return Math.round((juego.nivelActual / juego.maxNiveles) * 100);
  }

  getColorByProgress(porcentaje: number): string {
    if (porcentaje >= 80) return '#7BC67E';
    if (porcentaje >= 60) return '#FFB74D';
    return '#f44336';
  }

  getGameIcon(nombreJuego: string): string {
    if (nombreJuego.includes('Nutrimental')) return 'school';
    if (nombreJuego.includes('7 Días')) return 'restaurant';
    if (nombreJuego.includes('Coach')) return 'psychology';
    return 'sports_esports';
  }

  getIMCAngle(pesoKg: number, tallaCm: number): number {
  // Convertir talla a metros
  const tallaM = tallaCm / 100;

  // Calcular IMC = peso / talla²
  const imc = pesoKg / (tallaM * tallaM);

  // Normalizar IMC al rango [0,1]
  const norm = Math.min(Math.max((imc - 10) / 35, 0), 1);

  // Mapear al ángulo (180°–360°)
  return 180 + norm * 180;
}


  getTendenciaIcon(tendencia: string): string {
    switch (tendencia) {
      case 'Mejorando':
        return 'trending_up';
      case 'Estable':
        return 'remove';
      case 'Preocupante':
        return 'warning';
      default:
        return 'help_outline';
    }
  }

ngAfterViewInit() {
  if (this.dashboardData?.salud?.medicionActual) {
    const peso = this.dashboardData.salud.medicionActual.peso;
    const talla = this.dashboardData.salud.medicionActual.talla;

    const angle = this.getIMCAngle(peso, talla);

    console.log(
      '🎯 IMC GAUGE → Peso:', peso, 'kg | Talla:', talla, 'cm | rotate:', angle.toFixed(1) + '°'
    );
  }
}

  getWeightChartPoints(): string {
    if (
      !this.dashboardData?.salud?.historialMediciones ||
      this.dashboardData.salud.historialMediciones.length === 0
    ) {
      return '';
    }

    const mediciones = [...this.dashboardData.salud.historialMediciones].sort(
      (a, b) =>
        new Date(a.fechaRegistro).getTime() -
        new Date(b.fechaRegistro).getTime(),
    );

    if (mediciones.length < 2) {
      console.log(
        '⚠️ Solo hay 1 medición de peso. Se necesitan al menos 2 para el gráfico.',
      );
      return '';
    }

    const width = 340;
    const height = 120;
    const padding = 20;

    const pesos = mediciones.map((m) => m.peso);
    const minPeso = Math.min(...pesos) - 2;
    const maxPeso = Math.max(...pesos) + 2;
    const range = maxPeso - minPeso || 1;

    const points = mediciones.map((m, i) => {
      const x = 40 + (i * width) / Math.max(1, mediciones.length - 1);
      const y = 160 - padding - ((m.peso - minPeso) / range) * height;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    });

    console.log('✅ Weight chart points:', points);
    return points.join(' ');
  }

  getWeightPoints(): any[] {
    if (
      !this.dashboardData?.salud?.historialMediciones ||
      this.dashboardData.salud.historialMediciones.length === 0
    ) {
      return [];
    }

    const mediciones = [...this.dashboardData.salud.historialMediciones].sort(
      (a, b) =>
        new Date(a.fechaRegistro).getTime() -
        new Date(b.fechaRegistro).getTime(),
    );

    if (mediciones.length < 2) {
      return [];
    }

    const width = 340;
    const height = 120;
    const padding = 20;

    const pesos = mediciones.map((m) => m.peso);
    const minPeso = Math.min(...pesos) - 2;
    const maxPeso = Math.max(...pesos) + 2;
    const range = maxPeso - minPeso || 1;

    return mediciones.map((m, i) => ({
      x: 40 + (i * width) / Math.max(1, mediciones.length - 1),
      y: 160 - padding - ((m.peso - minPeso) / range) * height,
      peso: m.peso,
      fecha: new Date(m.fechaRegistro).toLocaleDateString('es-ES'),
    }));
  }

  getHeightChartPoints(): string {
    if (
      !this.dashboardData?.salud?.historialMediciones ||
      this.dashboardData.salud.historialMediciones.length === 0
    ) {
      return '';
    }

    const mediciones = [...this.dashboardData.salud.historialMediciones].sort(
      (a, b) =>
        new Date(a.fechaRegistro).getTime() -
        new Date(b.fechaRegistro).getTime(),
    );

    if (mediciones.length < 2) {
      console.log(
        '⚠️ Solo hay 1 medición de talla. Se necesitan al menos 2 para el gráfico.',
      );
      return '';
    }

    const width = 340;
    const height = 120;
    const padding = 20;

    const tallas = mediciones.map((m) => m.talla);
    const minTalla = Math.min(...tallas) - 2;
    const maxTalla = Math.max(...tallas) + 2;
    const range = maxTalla - minTalla || 1;

    const points = mediciones.map((m, i) => {
      const x = 40 + (i * width) / Math.max(1, mediciones.length - 1);
      const y = 160 - padding - ((m.talla - minTalla) / range) * height;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    });

    console.log('✅ Height chart points:', points);
    return points.join(' ');
  }

  getHeightPoints(): any[] {
    if (
      !this.dashboardData?.salud?.historialMediciones ||
      this.dashboardData.salud.historialMediciones.length === 0
    ) {
      return [];
    }

    const mediciones = [...this.dashboardData.salud.historialMediciones].sort(
      (a, b) =>
        new Date(a.fechaRegistro).getTime() -
        new Date(b.fechaRegistro).getTime(),
    );

    if (mediciones.length < 2) {
      return [];
    }

    const width = 340;
    const height = 120;
    const padding = 20;

    const tallas = mediciones.map((m) => m.talla);
    const minTalla = Math.min(...tallas) - 2;
    const maxTalla = Math.max(...tallas) + 2;
    const range = maxTalla - minTalla || 1;

    return mediciones.map((m, i) => ({
      x: 40 + (i * width) / Math.max(1, mediciones.length - 1),
      y: 160 - padding - ((m.talla - minTalla) / range) * height,
      talla: m.talla,
      fecha: new Date(m.fechaRegistro).toLocaleDateString('es-ES'),
    }));
  }

  getIMCChartPoints(): string {
    if (
      !this.dashboardData?.salud?.historialMediciones ||
      this.dashboardData.salud.historialMediciones.length === 0
    ) {
      return '';
    }

    const mediciones = [...this.dashboardData.salud.historialMediciones].sort(
      (a, b) =>
        new Date(a.fechaRegistro).getTime() -
        new Date(b.fechaRegistro).getTime(),
    );

    if (mediciones.length < 2) {
      console.log(
        '⚠️ Solo hay 1 medición de IMC. Se necesitan al menos 2 para el gráfico.',
      );
      return '';
    }

    const width = 340;

    const points = mediciones.map((m, i) => {
      const x = 40 + (i * width) / Math.max(1, mediciones.length - 1);
      const y = this.mapIMCToY(m.imc);
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    });

    console.log('✅ IMC chart points:', points);
    return points.join(' ');
  }

  getIMCPoints(): any[] {
    if (
      !this.dashboardData?.salud?.historialMediciones ||
      this.dashboardData.salud.historialMediciones.length === 0
    ) {
      return [];
    }

    const mediciones = [...this.dashboardData.salud.historialMediciones].sort(
      (a, b) =>
        new Date(a.fechaRegistro).getTime() -
        new Date(b.fechaRegistro).getTime(),
    );

    if (mediciones.length < 2) {
      return [];
    }

    const width = 340;

    return mediciones.map((m, i) => ({
      x: 40 + (i * width) / Math.max(1, mediciones.length - 1),
      y: this.mapIMCToY(m.imc),
      imc: m.imc.toFixed(1),
      estado: m.estadoNutricional.toLowerCase().replace(' ', '-'),
      fecha: new Date(m.fechaRegistro).toLocaleDateString('es-ES'),
    }));
  }

  private mapIMCToY(imc: number): number {
    const chartHeight = 140;
    const startY = 20;

    // Zonas del IMC en el gráfico
    // Bajo peso: y=20 a y=55 (35px) -> IMC < 18.5
    // Normal: y=55 a y=105 (50px) -> IMC 18.5-25
    // Sobrepeso: y=105 a y=135 (30px) -> IMC 25-30
    // Obesidad: y=135 a y=160 (25px) -> IMC > 30

    if (imc < 18.5) {
      // Mapear 0-18.5 a y=55-20
      const percent = imc / 18.5;
      return 55 - percent * 35;
    } else if (imc < 25) {
      // Mapear 18.5-25 a y=105-55
      const percent = (imc - 18.5) / 6.5;
      return 105 - percent * 50;
    } else if (imc < 30) {
      // Mapear 25-30 a y=135-105
      const percent = (imc - 25) / 5;
      return 135 - percent * 30;
    } else {
      // Mapear 30+ a y=160-135
      const percent = Math.min(1, (imc - 30) / 10);
      return 160 - percent * 25;
    }
  }

  isStageActiveOrPast(etapa: string): boolean {
    if (!this.dashboardData?.ultimoAnalisis?.etapaCambio) return false;

    const etapas = [
      'Pre-contemplación',
      'Contemplación',
      'Preparación',
      'Acción',
      'Mantenimiento',
    ];
    const etapaActualIndex = etapas.indexOf(
      this.dashboardData.ultimoAnalisis.etapaCambio,
    );
    const etapaComparar = etapas.indexOf(etapa);

    return etapaComparar <= etapaActualIndex;
  }

  getCircleSegment(percentage: number): number {
    return (percentage / 100) * 377;
  }

  enviarCorreo(): void {
    if (!this.selectedStudent) {
      this.snackBar.open('No hay estudiante seleccionado', 'Cerrar', {
        duration: 3000,
      });
      return;
    }

    const dialogRef = this.dialog.open(EmailDialog, {
      width: '500px',
      data: { student: this.selectedStudent },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.snackBar.open(
          `✅ Correo enviado exitosamente a ${result.email}`,
          'Cerrar',
          { duration: 3000 },
        );
      }
    });
  }

  private mapEstudianteToStudent(estudiante: EstudianteResponse): Student {
    return {
      id: estudiante.id,
      nombre: estudiante.nombres,
      apellido: estudiante.apellidos,
      edad: estudiante.edad,
      grado: estudiante.grado,
      seccion: estudiante.seccion,
      talla: estudiante.talla ? `${estudiante.talla}cm` : 'N/A',
      peso: estudiante.peso ? `${estudiante.peso}kg` : 'N/A',
      avatar: estudiante.avatarUrl,
      puntosAcumulados: estudiante.puntosAcumulados,
    };
  }

  getAvatarUrl(student: Student): string {
    return student.avatar || 'assets/images/default-avatar.png';
  }

  onAvatarError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.style.display = 'none';
  }

  goBack(): void {
    if (this.isTeacher) {
      this.router.navigate(['/landing-profesores']);
    } else {
      this.router.navigate(['/landing-alumnos']);
    }
  }

  openProfile(): void {
    this.router.navigate(['/perfil']);
  }

  logout(): void {
    this.authService.logout();
    localStorage.clear();
    sessionStorage.clear();
    this.router.navigate(['/']);
  }
}

@Component({
  selector: 'alerta-salud-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="alerta-dialog">
      <h2 mat-dialog-title>
        <mat-icon class="warning-icon">warning</mat-icon>
        Alertas de Salud
      </h2>

      <mat-dialog-content>
        <div class="student-info">
          <strong>Estudiante:</strong> {{ data.estudiante.nombre }}
          {{ data.estudiante.apellido }}
        </div>

        <div class="alertas-list">
          <div class="alerta-item" *ngFor="let alerta of data.alertas">
            <mat-icon>error_outline</mat-icon>
            <p>{{ alerta }}</p>
          </div>
        </div>

        <div class="estado-actual">
          <h3>Estado Actual:</h3>
          <div class="estado-grid">
            <div class="estado-item">
              <span class="label">IMC:</span>
              <span class="value">{{
                data.estadisticas.imcActual | number: '1.1-1'
              }}</span>
            </div>
            <div class="estado-item">
              <span class="label">Estado:</span>
              <span
                class="value"
                [ngClass]="
                  getEstadoClass(data.estadisticas.estadoNutricionalActual)
                "
              >
                {{ data.estadisticas.estadoNutricionalActual }}
              </span>
            </div>
            <div class="estado-item">
              <span class="label">Tendencia:</span>
              <span class="value">{{ data.estadisticas.tendencia }}</span>
            </div>
          </div>
        </div>

        <div class="recomendacion-box">
          <mat-icon>lightbulb</mat-icon>
          <p>{{ data.estadisticas.recomendacion }}</p>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="cerrar()">Cerrar</button>
        <button
          mat-raised-button
          color="primary"
          (click)="verRecomendaciones()"
        >
          <mat-icon>visibility</mat-icon>
          Ver Recomendaciones
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [
    `
      .alerta-dialog {
        font-family: 'Poppins', sans-serif;
      }

      h2 {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        color: #f44336;
        margin: 0;
      }

      .warning-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
        color: #ff9800;
      }

      .student-info {
        padding: 1rem;
        background: #f8f9fa;
        border-radius: 8px;
        margin-bottom: 1.5rem;
        font-size: 0.95rem;
      }

      .alertas-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-bottom: 1.5rem;
      }

      .alerta-item {
        display: flex;
        align-items: flex-start;
        gap: 1rem;
        padding: 1rem;
        background: #ffebee;
        border-left: 4px solid #f44336;
        border-radius: 8px;
      }

      .alerta-item mat-icon {
        color: #f44336;
        flex-shrink: 0;
      }

      .alerta-item p {
        margin: 0;
        color: #333;
        line-height: 1.5;
      }

      .estado-actual {
        margin-bottom: 1.5rem;
      }

      .estado-actual h3 {
        margin: 0 0 1rem;
        font-size: 1.1rem;
        color: #333;
      }

      .estado-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .estado-item {
        display: flex;
        flex-direction: column;
        padding: 0.75rem;
        background: #f8f9fa;
        border-radius: 8px;
        text-align: center;
      }

      .estado-item .label {
        font-size: 0.8rem;
        color: #666;
        margin-bottom: 0.25rem;
      }

      .estado-item .value {
        font-size: 1.1rem;
        font-weight: 600;
        color: #333;
      }

      .value.bajo-peso {
        color: #1976d2;
      }

      .value.normal {
        color: #388e3c;
      }

      .value.sobrepeso {
        color: #f57c00;
      }

      .value.obesidad {
        color: #d32f2f;
      }

      .recomendacion-box {
        display: flex;
        align-items: flex-start;
        gap: 1rem;
        padding: 1.25rem;
        background: #e3f2fd;
        border-left: 4px solid #48a3f3;
        border-radius: 8px;
      }

      .recomendacion-box mat-icon {
        color: #48a3f3;
        flex-shrink: 0;
      }

      .recomendacion-box p {
        margin: 0;
        line-height: 1.6;
        color: #333;
      }

      mat-dialog-content {
        max-height: 70vh;
        overflow-y: auto;
      }

      mat-dialog-actions button mat-icon {
        margin-right: 0.5rem;
      }

      @media (max-width: 600px) {
        .estado-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class AlertaSaludDialog {
  constructor(
    public dialogRef: MatDialogRef<AlertaSaludDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  getEstadoClass(estado: string): string {
    return estado.toLowerCase().replace(' ', '-');
  }

  cerrar(): void {
    this.dialogRef.close();
  }

  verRecomendaciones(): void {
    this.dialogRef.close('ver-recomendaciones');
  }
}

@Component({
  selector: 'email-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="email-dialog">
      <!-- Header -->
      <div class="dialog-header">
        <div class="header-icon">
          <mat-icon>email</mat-icon>
        </div>
        <div class="header-text">
          <h2>Enviar Reporte por Correo</h2>
          <p>{{ data.student.nombre }} {{ data.student.apellido }}</p>
        </div>
        <button
          mat-icon-button
          class="close-btn"
          (click)="cancelar()"
          [disabled]="isLoading"
        >
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Content -->
      <mat-dialog-content>
        <form [formGroup]="emailForm">
          <!-- Email Field -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Correo del destinatario</mat-label>
            <mat-icon matPrefix>person</mat-icon>
            <input
              matInput
              type="email"
              placeholder="padre@ejemplo.com"
              formControlName="email"
            />
            <mat-error *ngIf="emailForm.get('email')?.hasError('required')">
              El correo es requerido
            </mat-error>
            <mat-error *ngIf="emailForm.get('email')?.hasError('email')">
              Ingresa un correo válido
            </mat-error>
          </mat-form-field>

          <!-- Subject Field -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Asunto</mat-label>
            <mat-icon matPrefix>subject</mat-icon>
            <input matInput formControlName="subject" />
          </mat-form-field>

          <!-- Message Field -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Mensaje</mat-label>
            <textarea
              matInput
              rows="5"
              formControlName="message"
              placeholder="Escriba un mensaje personalizado..."
            >
            </textarea>
          </mat-form-field>
        </form>

        <!-- File Upload Section -->
        <div
          class="file-upload-section"
          [class.has-file]="selectedFile"
          [class.drag-over]="isDragOver"
          (dragover)="onDragOver($event)"
          (dragleave)="onDragLeave($event)"
          (drop)="onDrop($event)"
        >
          <input
            type="file"
            #fileInput
            (change)="onFileSelected($event)"
            accept=".pdf,application/pdf"
            hidden
          />

          <!-- Upload Area (when no file) -->
          <div
            *ngIf="!selectedFile"
            class="upload-area"
            (click)="fileInput.click()"
          >
            <mat-icon class="upload-icon">cloud_upload</mat-icon>
            <p class="upload-text">Arrastra un archivo PDF aquí</p>
            <p class="upload-subtext">o haz clic para seleccionar</p>
            <span class="upload-hint">Máximo 10MB</span>
          </div>

          <!-- File Selected -->
          <div *ngIf="selectedFile" class="file-selected">
            <div class="file-preview">
              <mat-icon class="pdf-icon">picture_as_pdf</mat-icon>
            </div>
            <div class="file-details">
              <strong>{{ selectedFile.name }}</strong>
              <span class="file-size">{{
                formatFileSize(selectedFile.size)
              }}</span>
            </div>
            <div class="file-actions">
              <button
                mat-icon-button
                (click)="fileInput.click()"
                [disabled]="isLoading"
                matTooltip="Cambiar archivo"
              >
                <mat-icon>sync</mat-icon>
              </button>
              <button
                mat-icon-button
                (click)="removeFile()"
                [disabled]="isLoading"
                matTooltip="Eliminar"
                class="remove-btn"
              >
                <mat-icon>delete</mat-icon>
              </button>
            </div>
          </div>
        </div>

        <!-- Status Info -->
        <div class="status-info" [class.success]="selectedFile">
          <mat-icon>{{ selectedFile ? 'check_circle' : 'info' }}</mat-icon>
          <span>{{
            selectedFile
              ? 'PDF listo para enviar'
              : 'Adjunta el reporte en PDF (opcional)'
          }}</span>
        </div>

        <!-- Loading State -->
        <div *ngIf="isLoading" class="loading-state">
          <mat-spinner diameter="36"></mat-spinner>
          <p>
            {{
              selectedFile
                ? 'Enviando correo con adjunto...'
                : 'Enviando correo...'
            }}
          </p>
        </div>

        <!-- Error Message -->
        <div *ngIf="errorMessage" class="error-state">
          <mat-icon>error</mat-icon>
          <span>{{ errorMessage }}</span>
        </div>
      </mat-dialog-content>

      <!-- Actions -->
      <mat-dialog-actions>
        <button mat-stroked-button (click)="cancelar()" [disabled]="isLoading">
          Cancelar
        </button>
        <button
          mat-raised-button
          color="primary"
          [disabled]="!emailForm.valid || isLoading"
          (click)="enviar()"
          class="send-btn"
        >
          <mat-icon>{{ isLoading ? 'hourglass_empty' : 'send' }}</mat-icon>
          {{
            isLoading
              ? 'Enviando...'
              : selectedFile
                ? 'Enviar con PDF'
                : 'Enviar'
          }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .email-dialog {
        font-family: 'Poppins', sans-serif;
        width: 500px;
        max-width: 90vw;
      }

      /* ========== HEADER ========== */
      .dialog-header {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1.25rem 1.5rem;
        background: linear-gradient(135deg, #48a3f3 0%, #5bb3ff 100%);
        margin: -24px -24px 1.5rem -24px;
        border-radius: 4px 4px 0 0;
      }

      .header-icon {
        width: 48px;
        height: 48px;
        min-width: 48px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .header-icon mat-icon {
        color: white;
        font-size: 26px;
        width: 26px;
        height: 26px;
      }

      .header-text {
        flex: 1;
        min-width: 0;
      }

      .header-text h2 {
        margin: 0;
        color: white;
        font-size: 1.15rem;
        font-weight: 600;
        line-height: 1.3;
      }

      .header-text p {
        margin: 0.25rem 0 0;
        color: rgba(255, 255, 255, 0.9);
        font-size: 0.85rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .close-btn {
        color: white;
        margin-left: auto;
      }

      .close-btn:hover {
        background: rgba(255, 255, 255, 0.15);
      }

      /* ========== CONTENT ========== */
      mat-dialog-content {
        padding: 0 1.5rem !important;
        margin: 0 !important;
        overflow-x: hidden;
        max-height: 60vh;
      }

      .full-width {
        width: 100%;
        margin-bottom: 1rem;
      }

      ::ng-deep .full-width .mat-mdc-form-field-icon-prefix {
        color: #48a3f3;
        padding-right: 8px;
      }

      /* ========== FILE UPLOAD ========== */
      .file-upload-section {
        margin: 1rem 0 1.25rem;
        border: 2px dashed #d0d0d0;
        border-radius: 12px;
        background: #fafafa;
        transition: all 0.3s ease;
        overflow: hidden;
      }

      .file-upload-section:hover {
        border-color: #48a3f3;
        background: #f5faff;
      }

      .file-upload-section.drag-over {
        border-color: #48a3f3;
        background: #e3f2fd;
        transform: scale(1.01);
      }

      .file-upload-section.has-file {
        border-style: solid;
        border-color: #4caf50;
        background: #f1f8e9;
      }

      .upload-area {
        padding: 2rem 1.5rem;
        text-align: center;
        cursor: pointer;
      }

      .upload-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: #48a3f3;
        margin-bottom: 0.75rem;
      }

      .upload-text {
        margin: 0;
        font-size: 1rem;
        font-weight: 500;
        color: #333;
      }

      .upload-subtext {
        margin: 0.35rem 0 0;
        font-size: 0.85rem;
        color: #888;
      }

      .upload-hint {
        display: inline-block;
        margin-top: 0.75rem;
        padding: 0.25rem 0.75rem;
        background: #e8e8e8;
        border-radius: 12px;
        font-size: 0.75rem;
        color: #666;
      }

      /* File Selected State */
      .file-selected {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1.25rem;
      }

      .file-preview {
        width: 56px;
        height: 56px;
        min-width: 56px;
        background: white;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .pdf-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
        color: #f44336;
      }

      .file-details {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0.3rem;
        min-width: 0;
        overflow: hidden;
      }

      .file-details strong {
        font-size: 0.9rem;
        color: #333;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .file-size {
        font-size: 0.8rem;
        color: #666;
      }

      .file-actions {
        display: flex;
        gap: 0.25rem;
        flex-shrink: 0;
      }

      .file-actions button {
        color: #666;
      }

      .file-actions .remove-btn:hover {
        color: #f44336;
      }

      /* ========== STATUS INFO ========== */
      .status-info {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1rem;
        background: #e3f2fd;
        border-radius: 8px;
        font-size: 0.85rem;
        color: #1976d2;
      }

      .status-info.success {
        background: #e8f5e9;
        color: #388e3c;
      }

      .status-info mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
        flex-shrink: 0;
      }

      /* ========== LOADING STATE ========== */
      .loading-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        padding: 1.5rem;
        margin-top: 1rem;
        background: #f5f5f5;
        border-radius: 12px;
      }

      .loading-state p {
        margin: 0;
        color: #666;
        font-size: 0.9rem;
      }

      /* ========== ERROR STATE ========== */
      .error-state {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1rem;
        margin-top: 1rem;
        background: #ffebee;
        border-radius: 8px;
        border-left: 3px solid #f44336;
        color: #c62828;
        font-size: 0.85rem;
      }

      .error-state mat-icon {
        color: #f44336;
        font-size: 20px;
        width: 20px;
        height: 20px;
        flex-shrink: 0;
      }

      /* ========== ACTIONS ========== */
      mat-dialog-actions {
        padding: 1.25rem 1.5rem !important;
        margin: 1rem -24px -24px -24px !important;
        gap: 1rem;
        display: flex;
        justify-content: flex-end;
        border-top: 1px solid #eee;
        background: #fafafa;
      }

      mat-dialog-actions button {
        min-width: 120px;
        height: 42px;
        border-radius: 8px !important;
        font-weight: 500;
        font-size: 0.9rem;
      }

      .send-btn {
        background: linear-gradient(
          135deg,
          #48a3f3 0%,
          #5bb3ff 100%
        ) !important;
        color: white !important;
      }

      .send-btn mat-icon {
        margin-right: 0.5rem;
        font-size: 18px;
        width: 18px;
        height: 18px;
      }

      /* ========== RESPONSIVE ========== */
      @media (max-width: 560px) {
        .email-dialog {
          width: 100%;
        }

        .dialog-header {
          padding: 1rem;
          margin: -24px -24px 1rem -24px;
        }

        .header-icon {
          width: 40px;
          height: 40px;
          min-width: 40px;
        }

        .header-icon mat-icon {
          font-size: 22px;
          width: 22px;
          height: 22px;
        }

        .header-text h2 {
          font-size: 1rem;
        }

        mat-dialog-content {
          padding: 0 1rem !important;
          max-height: 50vh;
        }

        .upload-area {
          padding: 1.5rem 1rem;
        }

        .upload-icon {
          font-size: 40px;
          width: 40px;
          height: 40px;
        }

        .file-selected {
          padding: 1rem;
        }

        .file-preview {
          width: 48px;
          height: 48px;
          min-width: 48px;
        }

        mat-dialog-actions {
          padding: 1rem !important;
          flex-direction: column;
        }

        mat-dialog-actions button {
          width: 100%;
        }
      }
    `,
  ],
})
export class EmailDialog implements OnInit {
  emailForm!: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;
  selectedFile: File | null = null;
  isDragOver = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EmailDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private mailService: MailService,
    private snackBar: MatSnackBar,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      subject: [
        `Reporte Nutricional - ${this.data.student.nombre} ${this.data.student.apellido}`,
        Validators.required,
      ],
      message: [
        `Estimado/a padre/madre de familia,\n\nAdjunto encontrará el reporte nutricional de ${this.data.student.nombre} ${this.data.student.apellido}.\n\nSaludos cordiales,\nPlataforma MIKHUY`,
        Validators.required,
      ],
    });
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processFile(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processFile(input.files[0]);
    }
  }

  private processFile(file: File): void {
    if (file.type !== 'application/pdf') {
      this.snackBar.open('⚠️ Solo se permiten archivos PDF', 'Cerrar', {
        duration: 3000,
      });
      return;
    }
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      this.snackBar.open('⚠️ El archivo es muy grande. Máximo 10MB', 'Cerrar', {
        duration: 3000,
      });
      return;
    }
    this.selectedFile = file;
  }

  removeFile(): void {
    this.selectedFile = null;
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  enviar(): void {
    if (!this.emailForm.valid) {
      this.snackBar.open('Por favor, complete todos los campos', 'Cerrar', {
        duration: 3000,
      });
      return;
    }
    this.isLoading = true;
    this.errorMessage = null;

    const currentUser = this.authService.getCurrentUser();
    const profesorNombre = currentUser
      ? `${currentUser.nombres || ''} ${currentUser.apellidos || ''}`.trim() ||
        'Profesor'
      : 'Profesor';

    if (this.selectedFile) {
      this.enviarConAdjunto(profesorNombre);
    } else {
      this.enviarSinAdjunto();
    }
  }

  private enviarSinAdjunto(): void {
    const emailData = {
      to: this.emailForm.value.email,
      subject: this.emailForm.value.subject,
      message: this.emailForm.value.message || '',
    };

    this.mailService.sendEmail(emailData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.dialogRef.close({
          success: true,
          email: emailData.to,
          withAttachment: false,
        });
      },
      error: (error) => this.handleError(error),
    });
  }

  private enviarConAdjunto(profesorNombre: string): void {
    if (!this.selectedFile) return;

    const formData = new FormData();
    formData.append('to', this.emailForm.value.email);
    formData.append('subject', this.emailForm.value.subject);
    formData.append('message', this.emailForm.value.message || '');
    formData.append('profesorNombre', profesorNombre);
    formData.append('pdf', this.selectedFile, this.selectedFile.name);

    this.mailService.sendEmailWithPdf(formData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.dialogRef.close({
          success: true,
          email: this.emailForm.value.email,
          withAttachment: true,
        });
      },
      error: (error) => this.handleError(error),
    });
  }

  private handleError(error: any): void {
    this.isLoading = false;
    if (error.status === 400) {
      this.errorMessage = 'Datos inválidos. Verifique el correo y el archivo.';
    } else if (error.status === 401) {
      this.errorMessage = 'Sesión expirada. Inicie sesión nuevamente.';
    } else if (error.status === 500) {
      this.errorMessage = 'Error en el servidor. Intente más tarde.';
    } else {
      this.errorMessage = error.error?.message || 'Error al enviar el correo.';
    }
  }

  cancelar(): void {
    if (!this.isLoading) {
      this.dialogRef.close();
    }
  }
}