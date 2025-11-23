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
    private mailService: MailService
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
            response.data.estudiante
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
            this.dashboardData.salud?.historialMediciones
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
          s.seccion.toLowerCase().includes(query)
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
        '⚠️ ALERTA: El estudiante presenta obesidad. Se recomienda consulta con nutricionista.'
      );
    } else if (estado.estadoNutricionalActual === 'Bajo peso') {
      alertas.push(
        '⚠️ ALERTA: El estudiante presenta bajo peso. Se recomienda evaluación médica.'
      );
    } else if (estado.estadoNutricionalActual === 'Sobrepeso') {
      alertas.push(
        '⚠️ ADVERTENCIA: El estudiante presenta sobrepeso. Monitorear alimentación y actividad física.'
      );
    }

    if (estado.tendencia === 'Preocupante') {
      alertas.push(
        '📉 TENDENCIA PREOCUPANTE: El estado nutricional ha empeorado. Revisar hábitos alimenticios.'
      );
    }

    if (Math.abs(estado.variacionPeso) > 5) {
      alertas.push(
        `📊 CAMBIO SIGNIFICATIVO: Variación de peso del ${estado.variacionPeso.toFixed(
          1
        )}% desde la última medición.`
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
      this.snackBar.open('No hay datos para generar el reporte', 'Cerrar', {
        duration: 3000,
      });
      return;
    }

    this.isGeneratingPDF = true;
    this.snackBar.open('Generando reporte PDF completo...', '', {
      duration: 2000,
    });

    try {
      await this.waitForLibraries();

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;

      pdf.setFillColor(72, 163, 243);
      pdf.rect(0, 0, pageWidth, 60, 'F');

      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(28);
      pdf.setFont('helvetica', 'bold');
      pdf.text('REPORTE NUTRICIONAL', pageWidth / 2, 30, { align: 'center' });

      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Plataforma MIKHUY', pageWidth / 2, 45, { align: 'center' });

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

      if (this.dashboardData.salud?.medicionActual) {
        yPosition += 15;
        pdf.setFillColor(255, 235, 238);
        pdf.rect(15, yPosition - 5, pageWidth - 30, 60, 'F');

        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(72, 163, 243);
        pdf.text('❤️ ANÁLISIS DE SALUD', 20, yPosition);

        yPosition += 10;
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(0, 0, 0);

        const medicion = this.dashboardData.salud.medicionActual;
        const stats = this.dashboardData.salud.estadisticas;

        pdf.text(`Peso: ${medicion.peso} kg`, 20, yPosition);
        pdf.text(`Talla: ${medicion.talla} cm`, 70, yPosition);
        if (stats) {
          pdf.text(`IMC: ${stats.imcActual.toFixed(1)}`, 120, yPosition);
        }

        yPosition += 8;

        if (stats) {
          const estadoColor = this.getEstadoColor(
            stats.estadoNutricionalActual
          );
          pdf.setTextColor(estadoColor.r, estadoColor.g, estadoColor.b);
          pdf.setFont('helvetica', 'bold');
          pdf.text(`Estado: ${stats.estadoNutricionalActual}`, 20, yPosition);

          pdf.setTextColor(0, 0, 0);
          pdf.setFont('helvetica', 'normal');
          pdf.text(`Tendencia: ${stats.tendencia}`, 80, yPosition);
          pdf.text(`Mediciones: ${stats.totalMediciones}`, 130, yPosition);

          yPosition += 8;

          const variacionPesoText =
            stats.variacionPeso > 0
              ? `↑ +${stats.variacionPeso.toFixed(1)}%`
              : `↓ ${stats.variacionPeso.toFixed(1)}%`;
          pdf.text(`Variación peso: ${variacionPesoText}`, 20, yPosition);

          if (stats.variacionTalla > 0) {
            pdf.text(
              `Variación talla: ↑ +${stats.variacionTalla.toFixed(1)}%`,
              90,
              yPosition
            );
          }

          yPosition += 12;
          if (this.tieneAlertasSalud(stats)) {
            pdf.setFillColor(255, 243, 224);
            pdf.rect(15, yPosition - 5, pageWidth - 30, 15, 'F');

            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(244, 67, 54);
            pdf.text('⚠️ ALERTAS:', 20, yPosition);

            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(0, 0, 0);
            const alertaText = this.getAlertaTexto(stats);
            const splitAlerta = pdf.splitTextToSize(alertaText, pageWidth - 50);
            pdf.text(splitAlerta, 45, yPosition);
          }
        }
      }

      yPosition += 20;
      pdf.setFillColor(232, 245, 253);
      pdf.rect(15, yPosition - 5, pageWidth - 30, 25, 'F');

      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(72, 163, 243);
      pdf.text('📊 Estadísticas Generales', 20, yPosition);

      yPosition += 8;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);

      const stats = this.dashboardData.estadisticas;
      pdf.text(`Puntos Ganados: ${stats.puntosGanados}`, 20, yPosition);
      pdf.text(`Juegos Completados: ${stats.juegosCompletados}`, 80, yPosition);

      yPosition += 6;
      pdf.text(`Total Sesiones: ${stats.totalSesiones}`, 20, yPosition);
      pdf.text(
        `Posición Ranking: #${stats.posicionRanking} de ${stats.totalEstudiantes}`,
        80,
        yPosition
      );

      if (this.dashboardData.salud?.historialMediciones?.length > 0) {
        pdf.addPage();
        yPosition = 20;

        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(72, 163, 243);
        pdf.text('📈 Evolución de Indicadores de Salud', 20, yPosition);

        yPosition += 15;

        await this.addHealthChartToPDF(pdf, yPosition, 'peso');
        yPosition += 50;

        await this.addHealthChartToPDF(pdf, yPosition, 'talla');
        yPosition += 50;

        if (yPosition > 200) {
          pdf.addPage();
          yPosition = 20;
        }
        await this.addHealthChartToPDF(pdf, yPosition, 'imc');
      }

      pdf.addPage();
      yPosition = 20;

      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(72, 163, 243);
      pdf.text('💡 Recomendaciones y Conclusiones', 20, yPosition);

      yPosition += 15;
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);

      const recomendaciones = this.generarRecomendacionesCompletas();
      const splitText = pdf.splitTextToSize(recomendaciones, pageWidth - 40);
      pdf.text(splitText, 20, yPosition);

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

      const fileName = `Reporte_Completo_${this.selectedStudent.nombre}_${
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

  private async addHealthChartToPDF(
    pdf: any,
    yPos: number,
    tipo: 'peso' | 'talla' | 'imc'
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
        new Date(b.fechaRegistro).getTime()
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
      startY + chartHeight
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
      startY + chartHeight
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
        `Cambio significativo de peso (${stats.variacionPeso.toFixed(1)}%)`
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

  getIMCAngle(imc: number): number {
    if (!imc) return 0;

    if (imc < 18.5) {
      return (imc / 18.5) * 45;
    } else if (imc < 25) {
      return 45 + ((imc - 18.5) / 6.5) * 55;
    } else if (imc < 30) {
      return 100 + ((imc - 25) / 5) * 40;
    } else {
      return Math.min(180, 140 + ((imc - 30) / 10) * 40);
    }
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
        new Date(b.fechaRegistro).getTime()
    );

    if (mediciones.length < 2) {
      console.log(
        '⚠️ Solo hay 1 medición de peso. Se necesitan al menos 2 para el gráfico.'
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
        new Date(b.fechaRegistro).getTime()
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
        new Date(b.fechaRegistro).getTime()
    );

    if (mediciones.length < 2) {
      console.log(
        '⚠️ Solo hay 1 medición de talla. Se necesitan al menos 2 para el gráfico.'
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
        new Date(b.fechaRegistro).getTime()
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
        new Date(b.fechaRegistro).getTime()
    );

    if (mediciones.length < 2) {
      console.log(
        '⚠️ Solo hay 1 medición de IMC. Se necesitan al menos 2 para el gráfico.'
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
        new Date(b.fechaRegistro).getTime()
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
      this.dashboardData.ultimoAnalisis.etapaCambio
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
                data.estadisticas.imcActual | number : '1.1-1'
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
    @Inject(MAT_DIALOG_DATA) public data: any
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
