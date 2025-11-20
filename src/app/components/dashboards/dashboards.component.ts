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
    // Cargar jsPDF y html2canvas dinámicamente
    this.loadExternalScripts();

    // Obtener usuario actual desde localStorage
    this.currentUser =
      this.authService.getCurrentUser?.() ||
      JSON.parse(localStorage.getItem('currentUser') || '{}');

    this.isTeacher = this.currentUser?.rol === 'teacher';

    if (this.isTeacher) {
      this.loadAllStudents();
    } else {
      this.loadMyDashboard();
    }
  }

  /**
   * Cargar scripts externos para PDF
   */
  private loadExternalScripts(): void {
    // Cargar html2canvas
    if (!(window as any).html2canvas) {
      const html2canvasScript = document.createElement('script');
      html2canvasScript.src =
        'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
      document.head.appendChild(html2canvasScript);
    }

    // Cargar jsPDF
    if (!(window as any).jspdf) {
      const jspdfScript = document.createElement('script');
      jspdfScript.src =
        'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      document.head.appendChild(jspdfScript);
    }
  }

  /**
   * Cargar mi dashboard (estudiante)
   */
  loadMyDashboard(): void {
    this.loading = true;
    this.error = null;

    this.dashboardService.getMiDashboard().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.dashboardData = response.data;
          this.notificationCount =
            response.data.estadisticas.notificacionesNoLeidas;

          this.selectedStudent = this.mapEstudianteToStudent(
            response.data.estudiante
          );

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

  /**
   * Cargar todos los estudiantes (profesor)
   */
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
            talla: est.talla ? `${est.talla}m` : 'N/A',
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

  /**
   * Seleccionar un estudiante
   */
  selectStudent(student: Student): void {
    this.selectedStudent = student;
    this.loading = true;

    this.dashboardService.getDashboardEstudiante(student.id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.dashboardData = response.data;
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

  /**
   * Buscar estudiantes
   */
  searchStudents(): void {
    if (!this.searchQuery.trim()) {
      this.filteredStudents = [...this.students];
    } else {
      const query = this.searchQuery.toLowerCase();
      this.filteredStudents = this.students.filter(
        (s) =>
          `${s.nombre} ${s.apellido}`.toLowerCase().includes(query) ||
          s.grado.toLowerCase().includes(query) ||
          s.seccion.toLowerCase().includes(query)
      );
    }
  }

  /**
   * GENERAR REPORTE PDF CON GRÁFICAS
   */
  async descargarReporte(): Promise<void> {
    if (!this.selectedStudent || !this.dashboardData) {
      this.snackBar.open('No hay datos para generar el reporte', 'Cerrar', {
        duration: 3000,
      });
      return;
    }

    this.isGeneratingPDF = true;
    this.snackBar.open('Generando reporte PDF...', '', { duration: 2000 });

    try {
      // Esperar a que las librerías estén disponibles
      await this.waitForLibraries();

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;

      // PORTADA
      pdf.setFillColor(72, 163, 243);
      pdf.rect(0, 0, pageWidth, 60, 'F');

      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(28);
      pdf.setFont('helvetica', 'bold');
      pdf.text('REPORTE NUTRICIONAL', pageWidth / 2, 30, { align: 'center' });

      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Plataforma MIKHUY', pageWidth / 2, 45, { align: 'center' });

      // DATOS DEL ESTUDIANTE
      yPosition = 80;
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text(
        `${this.selectedStudent.nombre} ${this.selectedStudent.apellido}`,
        20,
        yPosition
      );

      yPosition += 10;
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Edad: ${this.selectedStudent.edad} años`, 20, yPosition);
      pdf.text(
        `Grado: ${this.selectedStudent.grado} - Sección ${this.selectedStudent.seccion}`,
        80,
        yPosition
      );
      pdf.text(`Talla: ${this.selectedStudent.talla}`, 150, yPosition);

      yPosition += 6;
      pdf.text(`Peso: ${this.selectedStudent.peso}`, 20, yPosition);
      pdf.text(
        `Puntos Acumulados: ${this.dashboardData.estudiante.puntosAcumulados}`,
        80,
        yPosition
      );

      // ESTADÍSTICAS GENERALES
      yPosition += 15;
      pdf.setFillColor(232, 245, 253);
      pdf.rect(15, yPosition - 5, pageWidth - 30, 25, 'F');

      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Estadísticas Generales', 20, yPosition);

      yPosition += 8;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');

      const stats = this.dashboardData.estadisticas;
      pdf.text(`[PG] Puntos Ganados: ${stats.puntosGanados}`, 20, yPosition);
      pdf.text(
        `[JC] Juegos Completados: ${stats.juegosCompletados}`,
        80,
        yPosition
      );

      yPosition += 6;
      pdf.text(`[TS] Total Sesiones: ${stats.totalSesiones}`, 20, yPosition);
      pdf.text(
        `[RK] Posición Ranking: #${stats.posicionRanking} de ${stats.totalEstudiantes}`,
        80,
        yPosition
      );

      // NUEVA PÁGINA PARA GRÁFICAS
      pdf.addPage();
      yPosition = 20;

      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Análisis de Progreso por Juegos', 20, yPosition);

      yPosition += 15;

      // GRÁFICA 1: Conocimiento Nutricional (Desafío Nutrimental)
      const nutrimental = this.getJuegoData('Desafío Nutrimental');
      if (nutrimental) {
        await this.addGameChartToPDF(
          pdf,
          nutrimental,
          yPosition,
          'Desafío Nutrimental',
          '🎓'
        );
        yPosition += 45;
      }

      // GRÁFICA 2: Reto 7 Días
      const reto7dias = this.getJuegoData('Reto 7 Días');
      if (reto7dias) {
        await this.addGameChartToPDF(
          pdf,
          reto7dias,
          yPosition,
          'Reto 7 Días',
          '🍽️'
        );
        yPosition += 45;
      }

      // GRÁFICA 3: Coach Exprés
      const coach = this.getJuegoData('Coach Exprés');
      if (coach) {
        await this.addGameChartToPDF(
          pdf,
          coach,
          yPosition,
          'Coach Exprés',
          '🧠'
        );
        yPosition += 45;
      }

      // NUEVA PÁGINA PARA ANÁLISIS NUTRICIONAL
      pdf.addPage();
      yPosition = 20;

      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Análisis Nutricional', 20, yPosition);

      yPosition += 15;

      // GRÁFICA 4: Distribución de Macronutrientes
      if (this.dashboardData.ultimoAnalisis) {
        await this.addMacronutrientChart(pdf, yPosition);
        yPosition += 80;
      }

      // GRÁFICA 5: Etapa de Cambio
      if (this.dashboardData.ultimoAnalisis?.etapaCambio) {
        await this.addStageChart(pdf, yPosition);
        yPosition += 60;
      }

      // NUEVA PÁGINA PARA COMPARATIVA
      pdf.addPage();
      yPosition = 20;

      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Comparativa de Juegos', 20, yPosition);

      yPosition += 15;

      // GRÁFICA 6: Comparativa General
      await this.addComparisonChart(pdf, yPosition);

      // ÚLTIMA PÁGINA: RECOMENDACIONES
      pdf.addPage();
      yPosition = 20;

      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Recomendaciones y Conclusiones', 20, yPosition);

      yPosition += 15;
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');

      const recomendaciones = this.generarRecomendaciones();
      const splitText = pdf.splitTextToSize(recomendaciones, pageWidth - 40);
      pdf.text(splitText, 20, yPosition);

      // PIE DE PÁGINA EN TODAS LAS PÁGINAS
      const totalPages = pdf.internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text(
          `Generado el ${new Date().toLocaleDateString(
            'es-ES'
          )} - Página ${i} de ${totalPages}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }

      // GUARDAR PDF
      const fileName = `Reporte_${this.selectedStudent.nombre}_${
        this.selectedStudent.apellido
      }_${Date.now()}.pdf`;
      pdf.save(fileName);

      this.snackBar.open('✅ Reporte PDF generado exitosamente', 'Cerrar', {
        duration: 3000,
      });
      this.isGeneratingPDF = false;
    } catch (error) {
      console.error('Error generando PDF:', error);
      this.snackBar.open('❌ Error al generar el reporte PDF', 'Cerrar', {
        duration: 3000,
      });
      this.isGeneratingPDF = false;
    }
  }

  /**
   * Agregar gráfica de juego al PDF
   */
  private async addGameChartToPDF(
    pdf: any,
    juego: JuegoResponse,
    yPos: number,
    titulo: string,
    emoji: string
  ): Promise<void> {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const progreso = this.calcularPorcentajeProgreso(juego);

    pdf.setFillColor(248, 249, 250);
    pdf.rect(15, yPos - 5, pageWidth - 30, 40, 'F');

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${emoji} ${titulo}`, 20, yPos + 3);

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.text(
      `Nivel ${juego.nivelActual || 0}/${juego.maxNiveles}`,
      20,
      yPos + 10
    );
    pdf.text(`${juego.puntosGanados || 0} puntos`, 60, yPos + 10);
    pdf.text(`Jugado ${juego.vecesJugado || 0} veces`, 100, yPos + 10);

    // Barra de progreso
    const barY = yPos + 17;
    const barWidth = pageWidth - 40;
    const barHeight = 8;

    pdf.setFillColor(224, 224, 224);
    pdf.rect(20, barY, barWidth, barHeight, 'F');

    const fillWidth = (progreso / 100) * barWidth;
    const color = this.getColorByProgress(progreso);
    const rgb = this.hexToRgb(color);
    pdf.setFillColor(rgb.r, rgb.g, rgb.b);
    pdf.rect(20, barY, fillWidth, barHeight, 'F');

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${progreso}%`, pageWidth - 25, barY + 6);

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text(
      juego.completado ? '✓ Completado' : '⏳ En progreso',
      20,
      yPos + 32
    );
  }

  /**
   * Agregar gráfica de macronutrientes
   */
  private async addMacronutrientChart(pdf: any, yPos: number): Promise<void> {
    if (!this.dashboardData?.ultimoAnalisis) return;

    const analisis = this.dashboardData.ultimoAnalisis;
    const pageWidth = pdf.internal.pageSize.getWidth();

    pdf.setFillColor(248, 249, 250);
    pdf.rect(15, yPos - 5, pageWidth - 30, 70, 'F');

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Distribución de Macronutrientes', 20, yPos + 3);

    // Gráfica de barras horizontal
    const startY = yPos + 15;
    const barHeight = 12;
    const maxWidth = pageWidth - 100;

    // Proteínas
    pdf.setFillColor(66, 133, 244);
    pdf.rect(
      70,
      startY,
      (analisis.proteinasPorcentaje / 100) * maxWidth,
      barHeight,
      'F'
    );
    pdf.setFontSize(10);
    pdf.text('Proteínas:', 20, startY + 8);
    pdf.text(`${analisis.proteinasPorcentaje}%`, pageWidth - 30, startY + 8);

    // Carbohidratos
    pdf.setFillColor(123, 198, 126);
    pdf.rect(
      70,
      startY + 18,
      (analisis.carbohidratosPorcentaje / 100) * maxWidth,
      barHeight,
      'F'
    );
    pdf.text('Carbohidratos:', 20, startY + 26);
    pdf.text(
      `${analisis.carbohidratosPorcentaje}%`,
      pageWidth - 30,
      startY + 26
    );

    // Grasas
    pdf.setFillColor(255, 183, 77);
    pdf.rect(
      70,
      startY + 36,
      (analisis.grasasPorcentaje / 100) * maxWidth,
      barHeight,
      'F'
    );
    pdf.text('Grasas:', 20, startY + 44);
    pdf.text(`${analisis.grasasPorcentaje}%`, pageWidth - 30, startY + 44);
  }

  /**
   * Agregar gráfica de etapas de cambio
   */
  private async addStageChart(pdf: any, yPos: number): Promise<void> {
    if (!this.dashboardData?.ultimoAnalisis?.etapaCambio) return;

    const pageWidth = pdf.internal.pageSize.getWidth();
    const etapas = [
      'Pre-contemplación',
      'Contemplación',
      'Preparación',
      'Acción',
      'Mantenimiento',
    ];
    const etapaActual = this.dashboardData.ultimoAnalisis.etapaCambio;

    pdf.setFillColor(227, 242, 253);
    pdf.rect(15, yPos - 5, pageWidth - 30, 50, 'F');

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Etapa de Cambio Conductual', 20, yPos + 3);

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    const circleY = yPos + 20;
    const spacing = (pageWidth - 40) / etapas.length;

    etapas.forEach((etapa, index) => {
      const x = 20 + index * spacing + spacing / 2;
      const isActive = etapa === etapaActual;

      if (isActive) {
        pdf.setFillColor(72, 163, 243);
        pdf.circle(x, circleY, 5, 'F');
        pdf.setTextColor(72, 163, 243);
      } else {
        pdf.setFillColor(224, 224, 224);
        pdf.circle(x, circleY, 4, 'F');
        pdf.setTextColor(150, 150, 150);
      }

      pdf.setFontSize(7);
      const splitEtapa = pdf.splitTextToSize(etapa, spacing - 5);
      pdf.text(splitEtapa, x, circleY + 10, { align: 'center' });
    });

    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Etapa Actual: ${etapaActual}`, 20, yPos + 40);
  }

  /**
   * Agregar gráfica comparativa
   */
  private async addComparisonChart(pdf: any, yPos: number): Promise<void> {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const maxWidth = pageWidth - 100;

    this.dashboardData?.juegos.forEach((juego, index) => {
      const progreso = this.calcularPorcentajeProgreso(juego);
      const y = yPos + index * 18;

      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.text(juego.nombre, 20, y + 6);

      pdf.setFillColor(224, 224, 224);
      pdf.rect(80, y, maxWidth, 8, 'F');

      const fillWidth = (progreso / 100) * maxWidth;
      const rgb = juego.completado
        ? { r: 123, g: 198, b: 126 }
        : { r: 72, g: 163, b: 243 };
      pdf.setFillColor(rgb.r, rgb.g, rgb.b);
      pdf.rect(80, y, fillWidth, 8, 'F');

      pdf.setFont('helvetica', 'bold');
      pdf.text(`${progreso}%`, pageWidth - 25, y + 6);
    });
  }

  /**
   * Generar recomendaciones
   */
  private generarRecomendaciones(): string {
    if (!this.dashboardData) return '';

    const stats = this.dashboardData.estadisticas;
    let recomendaciones = 'RECOMENDACIONES:\n\n';

    if (stats.juegosCompletados < 3) {
      recomendaciones +=
        '• Se recomienda completar todos los juegos para obtener una evaluación nutricional completa.\n\n';
    }

    if (stats.puntosGanados < 1000) {
      recomendaciones +=
        '• Aumentar la participación en las actividades para mejorar el conocimiento nutricional.\n\n';
    }

    if (this.dashboardData.ultimoAnalisis) {
      recomendaciones +=
        '• El estudiante ha completado la evaluación nutricional. Se recomienda seguimiento periódico.\n\n';
    }

    recomendaciones += 'CONCLUSIONES:\n\n';
    recomendaciones += `El estudiante ha acumulado ${stats.puntosAcumulados} puntos y se encuentra en la posición #${stats.posicionRanking} del ranking. `;
    recomendaciones +=
      'Continúe motivando al estudiante a participar activamente en las actividades de la plataforma.';

    return recomendaciones;
  }

  /**
   * Esperar a que las librerías estén cargadas
   */
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

  /**
   * Convertir hex a RGB
   */
  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 };
  }

  // ========================================================
  // FUNCIONES PARA GRÁFICOS DE JUEGOS
  // ========================================================

  getJuegoData(nombreJuego: string): JuegoResponse | null {
    if (!this.dashboardData || !this.dashboardData.juegos) return null;

    return (
      this.dashboardData.juegos.find((j) =>
        j.nombre.toLowerCase().includes(nombreJuego.toLowerCase())
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
      this.dashboardData.ultimoAnalisis.etapaCambio
    );
    const etapaComparar = etapas.indexOf(etapa);

    return etapaComparar <= etapaActualIndex;
  }

  getCircleSegment(percentage: number): number {
    return (percentage / 100) * 377;
  }

  /**
   * Enviar reporte por correo
   */
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
        console.log('📧 Enviando correo:', result);
        this.snackBar.open(
          `✅ Correo enviado exitosamente a ${result.email}`,
          'Cerrar',
          { duration: 3000 }
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
      talla: estudiante.talla ? `${estudiante.talla}m` : 'N/A',
      peso: estudiante.peso ? `${estudiante.peso}kg` : 'N/A',
      avatar: estudiante.avatarUrl,
      puntosAcumulados: estudiante.puntosAcumulados,
    };
  }

  formatearTiempo(segundos: number): string {
    if (!segundos || segundos === 0) return '00:00:00';

    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const segs = segundos % 60;

    return `${horas.toString().padStart(2, '0')}:${minutos
      .toString()
      .padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
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

// ============================================
// Email Dialog Component - CON ADJUNTOS
// ============================================
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
      <h2 mat-dialog-title>
        <mat-icon>email</mat-icon>
        Enviar Reporte por Correo
      </h2>

      <mat-dialog-content>
        <p class="student-info">
          Reporte de:
          <strong>{{ data.student.nombre }} {{ data.student.apellido }}</strong>
        </p>

        <form [formGroup]="emailForm">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Correo del destinatario</mat-label>
            <input
              matInput
              type="email"
              placeholder="padre@ejemplo.com"
              formControlName="email"
            />
            <mat-icon matPrefix>email</mat-icon>
            <mat-error *ngIf="emailForm.get('email')?.hasError('required')">
              El correo es requerido
            </mat-error>
            <mat-error *ngIf="emailForm.get('email')?.hasError('email')">
              Ingresa un correo válido
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Asunto</mat-label>
            <input matInput formControlName="subject" />
            <mat-icon matPrefix>subject</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Mensaje</mat-label>
            <textarea
              matInput
              rows="4"
              formControlName="message"
              placeholder="Agregue un mensaje personalizado..."
            ></textarea>
          </mat-form-field>
        </form>

        <!-- ✅ SECCIÓN DE ADJUNTAR ARCHIVO -->
        <div class="file-upload-section">
          <input
            type="file"
            #fileInput
            (change)="onFileSelected($event)"
            accept=".pdf,application/pdf"
            hidden
          />

          <button
            mat-stroked-button
            (click)="fileInput.click()"
            [disabled]="isLoading"
            class="upload-button"
          >
            <mat-icon>attach_file</mat-icon>
            {{ selectedFile ? 'Cambiar archivo' : 'Adjuntar PDF' }}
          </button>

          <!-- Mostrar archivo seleccionado -->
          <div *ngIf="selectedFile" class="file-selected">
            <mat-icon class="file-icon">picture_as_pdf</mat-icon>
            <div class="file-info">
              <strong>{{ selectedFile.name }}</strong>
              <small>{{ formatFileSize(selectedFile.size) }}</small>
            </div>
            <button
              mat-icon-button
              (click)="removeFile()"
              [disabled]="isLoading"
              class="remove-button"
            >
              <mat-icon>close</mat-icon>
            </button>
          </div>
        </div>

        <div class="attach-info" [class.has-file]="selectedFile">
          <mat-icon>{{ selectedFile ? 'check_circle' : 'info' }}</mat-icon>
          <span>
            {{ selectedFile 
              ? 'Archivo adjunto listo para enviar' 
              : 'Opcionalmente puede adjuntar el reporte en PDF' }}
          </span>
        </div>

        <!-- Loading indicator -->
        <div *ngIf="isLoading" class="loading-overlay">
          <mat-spinner diameter="40"></mat-spinner>
          <p>{{ selectedFile ? 'Enviando correo con archivo adjunto...' : 'Enviando correo...' }}</p>
        </div>

        <!-- Error message -->
        <div *ngIf="errorMessage" class="error-message">
          <mat-icon>error</mat-icon>
          <span>{{ errorMessage }}</span>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="cancelar()" [disabled]="isLoading">
          Cancelar
        </button>
        <button
          mat-raised-button
          color="primary"
          [disabled]="!emailForm.valid || isLoading"
          (click)="enviar()"
        >
          <mat-icon>send</mat-icon>
          {{ selectedFile ? 'Enviar con PDF' : 'Enviar' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [
    `
      .email-dialog {
        font-family: 'Poppins', sans-serif;
      }

      h2 {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #48a3f3;
        font-weight: 600;
        margin: 0;
      }

      .student-info {
        color: #666;
        margin-bottom: 1.5rem;
        padding: 1rem;
        background: #f8f9fa;
        border-radius: 8px;
      }

      .full-width {
        width: 100%;
        margin-bottom: 1rem;
      }

      /* ===== FILE UPLOAD SECTION ===== */
      .file-upload-section {
        margin: 1rem 0;
        padding: 1rem;
        background: #f8f9fa;
        border-radius: 8px;
        border: 2px dashed #e0e0e0;
        transition: all 0.3s;
      }

      .file-upload-section:hover {
        border-color: #48a3f3;
        background: #f0f7ff;
      }

      .upload-button {
        width: 100%;
        height: 48px;
        font-size: 0.95rem;
      }

      .upload-button mat-icon {
        margin-right: 0.5rem;
      }

      .file-selected {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 0.75rem;
        background: white;
        border-radius: 8px;
        border: 1px solid #48a3f3;
        margin-top: 0.75rem;
      }

      .file-icon {
        color: #f44336;
        font-size: 32px;
        width: 32px;
        height: 32px;
      }

      .file-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      .file-info strong {
        font-size: 0.9rem;
        color: #333;
      }

      .file-info small {
        font-size: 0.75rem;
        color: #999;
      }

      .remove-button {
        color: #999;
      }

      .remove-button:hover {
        color: #f44336;
      }

      /* ===== ATTACH INFO ===== */
      .attach-info {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem;
        background: #e3f2fd;
        border-radius: 8px;
        font-size: 0.9rem;
        color: #666;
        margin-top: 1rem;
        transition: all 0.3s;
      }

      .attach-info.has-file {
        background: #e8f5e9;
        color: #2e7d32;
      }

      .attach-info mat-icon {
        color: #48a3f3;
      }

      .attach-info.has-file mat-icon {
        color: #4caf50;
      }

      /* ===== LOADING & ERROR ===== */
      .loading-overlay {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        margin-top: 1rem;
        background: #f8f9fa;
        border-radius: 8px;
      }

      .loading-overlay p {
        margin: 0;
        color: #666;
      }

      .error-message {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem;
        margin-top: 1rem;
        background: #ffebee;
        border-radius: 8px;
        color: #c62828;
        font-size: 0.9rem;
      }

      .error-message mat-icon {
        color: #c62828;
      }

      mat-dialog-content {
        padding: 1rem 0;
        overflow: visible;
        min-height: 400px;
      }

      mat-dialog-actions button mat-icon {
        margin-right: 0.5rem;
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
    `,
  ],
})
export class EmailDialog implements OnInit {
  emailForm!: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EmailDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private mailService: MailService,
    private snackBar: MatSnackBar,
    private authService: AuthService
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
        Validators.required
      ],
    });
  }

  /**
   * Manejar selección de archivo
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Validar que sea PDF
      if (file.type !== 'application/pdf') {
        this.snackBar.open('⚠️ Solo se permiten archivos PDF', 'Cerrar', {
          duration: 3000,
        });
        return;
      }

      // Validar tamaño (máx 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        this.snackBar.open('⚠️ El archivo es muy grande. Máximo 10MB', 'Cerrar', {
          duration: 3000,
        });
        return;
      }

      this.selectedFile = file;
      console.log('📎 Archivo seleccionado:', file.name, `(${this.formatFileSize(file.size)})`);
    }
  }

  /**
   * Remover archivo seleccionado
   */
  removeFile(): void {
    this.selectedFile = null;
    console.log('🗑️ Archivo removido');
  }

  /**
   * Formatear tamaño de archivo
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Enviar email (con o sin archivo adjunto)
   */
  enviar(): void {
    if (!this.emailForm.valid) {
      this.snackBar.open('Por favor, complete todos los campos requeridos', 'Cerrar', {
        duration: 3000,
      });
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    // Obtener nombre del profesor del usuario actual
    const currentUser = this.authService.getCurrentUser();
    const profesorNombre = currentUser 
      ? `${currentUser.nombres || ''} ${currentUser.apellidos || ''}`.trim() || 'Profesor'
      : 'Profesor';

    if (this.selectedFile) {
      // ✅ ENVIAR CON ARCHIVO ADJUNTO
      this.enviarConAdjunto(profesorNombre);
    } else {
      // ✅ ENVIAR SIN ARCHIVO ADJUNTO
      this.enviarSinAdjunto();
    }
  }

  /**
   * Enviar email SIN archivo adjunto
   */
  private enviarSinAdjunto(): void {
    const emailData = {
      to: this.emailForm.value.email,
      subject: this.emailForm.value.subject,
      message: this.emailForm.value.message || '',
    };

    console.log('📧 [EmailDialog] Enviando email simple:', emailData);

    this.mailService.sendEmail(emailData).subscribe({
      next: (response) => {
        console.log('✅ [EmailDialog] Email enviado exitosamente:', response);
        this.isLoading = false;
        
        this.snackBar.open('✅ Correo enviado exitosamente', 'Cerrar', {
          duration: 3000,
        });

        this.dialogRef.close({
          success: true,
          email: emailData.to,
          withAttachment: false,
          response: response,
        });
      },
      error: (error) => {
        this.handleError(error);
      },
    });
  }

  /**
   * Enviar email CON archivo adjunto
   */
  private enviarConAdjunto(profesorNombre: string): void {
    if (!this.selectedFile) return;

    // Crear FormData
    const formData = new FormData();
    formData.append('to', this.emailForm.value.email);
    formData.append('subject', this.emailForm.value.subject);
    formData.append('message', this.emailForm.value.message || '');
    formData.append('profesorNombre', profesorNombre);
    formData.append('pdf', this.selectedFile, this.selectedFile.name);

    console.log('📧 [EmailDialog] Enviando email con PDF adjunto');
    console.log('📎 Archivo:', this.selectedFile.name, `(${this.formatFileSize(this.selectedFile.size)})`);

    this.mailService.sendEmailWithPdf(formData).subscribe({
      next: (response) => {
        console.log('✅ [EmailDialog] Email con PDF enviado exitosamente:', response);
        this.isLoading = false;
        
        this.snackBar.open('✅ Correo con PDF enviado exitosamente', 'Cerrar', {
          duration: 3000,
        });

        this.dialogRef.close({
          success: true,
          email: this.emailForm.value.email,
          withAttachment: true,
          fileName: this.selectedFile?.name,
          response: response,
        });
      },
      error: (error) => {
        this.handleError(error);
      },
    });
  }

  /**
   * Manejar errores
   */
  private handleError(error: any): void {
    console.error('❌ [EmailDialog] Error al enviar email:', error);
    this.isLoading = false;

    if (error.status === 400) {
      this.errorMessage = 'Datos inválidos. Verifique el correo y el archivo.';
    } else if (error.status === 401) {
      this.errorMessage = 'Sesión expirada. Por favor, inicie sesión nuevamente.';
    } else if (error.status === 500) {
      this.errorMessage = 'Error en el servidor. Intente nuevamente más tarde.';
    } else {
      this.errorMessage = error.error?.message || 'Error al enviar el correo. Intente nuevamente.';
    }

    this.snackBar.open(`❌ ${this.errorMessage}`, 'Cerrar', {
      duration: 5000,
    });
  }

  /**
   * Cancelar
   */
  cancelar(): void {
    if (!this.isLoading) {
      this.dialogRef.close();
    }
  }
}