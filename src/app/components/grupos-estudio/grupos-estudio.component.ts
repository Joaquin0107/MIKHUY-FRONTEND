import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment.prod';
import { ViewEncapsulation } from '@angular/core';
import { jsPDF } from 'jspdf';

interface Miembro {
  id: string;
  nombre: string;
  apellido: string;
  puntosAcumulados: number;
  totalSesiones: number;
  juegosCompletados: number;
  posicionEnGrupo: number;
}

interface ComparativaJuego {
  juegoNombre: string;
  promedioProgreso: number;
  totalCompletados: number;
}

interface Grupo {
  id: string;
  nombre: string;
  totalMiembros: number;
  fechaCreacion: string;
  miembros: Miembro[];
  promedioPuntos: number;
  totalSesionesGrupo: number;
  alumnoMasActivo: string;
  juegoMasDominado: string;
  comparativaJuegos: ComparativaJuego[];
}

interface Estudiante {
  id: string;
  nombres: string;
  apellidos: string;
  grado: string;
  seccion: string;
  puntosAcumulados: number;
}

@Component({
  selector: 'app-grupos-estudio',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './grupos-estudio.component.html',
  styleUrls: ['./grupos-estudio.component.css'],
})
export class GruposEstudioComponent implements OnInit {
  private apiUrl = `${environment.apiUrl}/api/grupos`;
  private estudiantesUrl = `${environment.apiUrl}/api/estudiantes`;

  grupos: Grupo[] = [];
  grupoSeleccionado: Grupo | null = null;
  loading = false;
  error: string | null = null;

  // Modal crear/editar
  mostrarModal = false;
  modoEdicion = false;
  grupoEditandoId: string | null = null;
  nombreGrupo = '';
  estudiantesDisponibles: Estudiante[] = [];
  estudiantesSeleccionados: string[] = [];

  historial: any[] = [];
  mesActual = new Date();
  diasDelMes: { fecha: Date; sesiones: any[]; tieneActividad: boolean }[] = [];
  diaSeleccionado: { fecha: Date; sesiones: any[] } | null = null;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.cargarGrupos();
    this.cargarEstudiantes();
  }

  cargarGrupos(): void {
    this.loading = true;
    this.http.get<any>(`${this.apiUrl}`).subscribe({
      next: (res) => {
        this.grupos = res.data || [];
        this.loading = false;
      },
      error: () => {
        this.error = 'Error cargando grupos';
        this.loading = false;
      },
    });
  }

  cargarEstudiantes(): void {
    this.http.get<any>(`${this.estudiantesUrl}`).subscribe({
      next: (res) => {
        this.estudiantesDisponibles = res.data || [];
      },
      error: () => {},
    });
  }

  abrirModalCrear(): void {
    this.modoEdicion = false;
    this.grupoEditandoId = null;
    this.nombreGrupo = '';
    this.estudiantesSeleccionados = [];
    this.mostrarModal = true;
  }

  abrirModalEditar(grupo: Grupo): void {
    this.modoEdicion = true;
    this.grupoEditandoId = grupo.id;
    this.nombreGrupo = grupo.nombre;
    this.estudiantesSeleccionados = grupo.miembros.map((m) => m.id);
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  toggleEstudiante(id: string): void {
    const idx = this.estudiantesSeleccionados.indexOf(id);
    if (idx >= 0) {
      this.estudiantesSeleccionados.splice(idx, 1);
    } else {
      if (this.estudiantesSeleccionados.length >= 5) {
        this.snackBar.open('Máximo 5 estudiantes por grupo', 'OK', {
          duration: 3000,
        });
        return;
      }
      this.estudiantesSeleccionados.push(id);
    }
  }

  esSeleccionado(id: string): boolean {
    return this.estudiantesSeleccionados.includes(id);
  }

  guardarGrupo(): void {
    if (!this.nombreGrupo.trim()) {
      this.snackBar.open('El nombre del grupo es obligatorio', 'OK', {
        duration: 3000,
      });
      return;
    }
    if (this.estudiantesSeleccionados.length === 0) {
      this.snackBar.open('Selecciona al menos un estudiante', 'OK', {
        duration: 3000,
      });
      return;
    }

    const payload = {
      nombre: this.nombreGrupo,
      estudianteIds: this.estudiantesSeleccionados,
    };

    const req = this.modoEdicion
      ? this.http.put<any>(`${this.apiUrl}/${this.grupoEditandoId}`, payload)
      : this.http.post<any>(`${this.apiUrl}`, payload);

    req.subscribe({
      next: () => {
        this.snackBar.open(
          this.modoEdicion ? 'Grupo actualizado' : 'Grupo creado',
          'OK',
          { duration: 3000 },
        );
        this.cerrarModal();
        this.cargarGrupos();
      },
      error: (err) => {
        this.snackBar.open(
          err.error?.message || 'Error guardando grupo',
          'OK',
          { duration: 3000 },
        );
      },
    });
  }

  eliminarGrupo(id: string): void {
    if (!confirm('¿Eliminar este grupo?')) return;
    this.http.delete<any>(`${this.apiUrl}/${id}`).subscribe({
      next: () => {
        this.snackBar.open('Grupo eliminado', 'OK', { duration: 3000 });
        if (this.grupoSeleccionado?.id === id) this.grupoSeleccionado = null;
        this.cargarGrupos();
      },
      error: () =>
        this.snackBar.open('Error eliminando grupo', 'OK', { duration: 3000 }),
    });
  }

  verDetalle(grupo: Grupo): void {
    this.loading = true;
    this.http.get<any>(`${this.apiUrl}/${grupo.id}`).subscribe({
      next: (res) => {
        this.grupoSeleccionado = res.data;
        this.loading = false;
        this.cargarHistorial(grupo.id); 
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  volverALista(): void {
    this.grupoSeleccionado = null;
  }

  goBack(): void {
    this.router.navigate(['/dashboards']);
  }

  getMedalColor(pos: number): string {
    return pos === 1
      ? '#FFD700'
      : pos === 2
        ? '#C0C0C0'
        : pos === 3
          ? '#CD7F32'
          : '#90a4ae';
  }

  getMedalIcon(pos: number): string {
    return pos <= 3 ? 'emoji_events' : 'person';
  }

  cargarHistorial(grupoId: string): void {
    this.http.get<any>(`${this.apiUrl}/${grupoId}/historial`).subscribe({
      next: (res) => {
        this.historial = res.data || [];
        this.generarCalendario();
      },
      error: () => {},
    });
  }

  generarCalendario(): void {
    const año = this.mesActual.getFullYear();
    const mes = this.mesActual.getMonth();
    const primerDia = new Date(año, mes, 1);
    const ultimoDia = new Date(año, mes + 1, 0);
    this.diasDelMes = [];

    // Días vacíos al inicio (lunes como primer día)
    const offset = (primerDia.getDay() + 6) % 7;
    for (let i = 0; i < offset; i++) {
      this.diasDelMes.push({
        fecha: new Date(0),
        sesiones: [],
        tieneActividad: false,
      });
    }

    for (let d = 1; d <= ultimoDia.getDate(); d++) {
      const fecha = new Date(año, mes, d);
      const fechaStr = fecha.toISOString().split('T')[0];
      const sesionesDelDia = this.historial.filter((h) => h.fecha === fechaStr);
      this.diasDelMes.push({
        fecha,
        sesiones: sesionesDelDia,
        tieneActividad: sesionesDelDia.length > 0,
      });
    }
  }

  mesAnterior(): void {
    this.mesActual = new Date(
      this.mesActual.getFullYear(),
      this.mesActual.getMonth() - 1,
      1,
    );
    this.generarCalendario();
  }

  mesSiguiente(): void {
    this.mesActual = new Date(
      this.mesActual.getFullYear(),
      this.mesActual.getMonth() + 1,
      1,
    );
    this.generarCalendario();
  }

  seleccionarDia(dia: {
    fecha: Date;
    sesiones: any[];
    tieneActividad: boolean;
  }): void {
    if (!dia.tieneActividad || dia.fecha.getTime() === 0) return;
    this.diaSeleccionado = dia.tieneActividad ? dia : null;
  }

  getNombreMes(): string {
    return this.mesActual.toLocaleDateString('es-PE', {
      month: 'long',
      year: 'numeric',
    });
  }

  // Variable de control para el spinner de carga en la vista
  isGeneratingPDF = false;

  async descargarReporteGrupo(): Promise<void> {
    if (!this.grupoSeleccionado) {
      this.snackBar.open('No hay un grupo seleccionado para generar el reporte', 'Cerrar', {
        duration: 3000,
      });
      return;
    }
    
    this.isGeneratingPDF = true;
    this.snackBar.open('Generando reporte PDF del grupo...', '', { duration: 2000 });

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const PW = pdf.internal.pageSize.getWidth(); // 210 mm
      const PH = pdf.internal.pageSize.getHeight(); // 297 mm
      const TOTAL_PAGES = 2; // Estructurado simétricamente en 2 páginas

      // ── Paleta Institucional MIKHUY (Sincronizado con Dashboard) ──
      const BLUE = [48, 130, 220] as [number, number, number];
      const BLUE_DARK = [30, 100, 180] as [number, number, number];
      const BLUE_LIGHT = [232, 242, 255] as [number, number, number];
      const GREEN = [76, 175, 80] as [number, number, number];
      const GREEN_LIGHT = [232, 245, 233] as [number, number, number];
      const ORANGE = [255, 152, 0] as [number, number, number];
      const RED = [244, 67, 54] as [number, number, number];
      const GRAY_BG = [248, 249, 250] as [number, number, number];
      const GRAY_LINE = [220, 220, 220] as [number, number, number];
      const TEXT_DARK = [33, 37, 41] as [number, number, number];
      const TEXT_GRAY = [108, 117, 125] as [number, number, number];
      const WHITE = [255, 255, 255] as [number, number, number];

      // ── Helpers de Dibujo Estructural Nativo ───────────────────────
      const sf = (c: [number, number, number]) => pdf.setFillColor(c[0], c[1], c[2]);
      const ss = (c: [number, number, number]) => pdf.setDrawColor(c[0], c[1], c[2]);
      const st = (c: [number, number, number]) => pdf.setTextColor(c[0], c[1], c[2]);

      const rr = (x: number, y: number, w: number, h: number, fill: [number, number, number], r = 3) => {
        sf(fill);
        pdf.roundedRect(x, y, w, h, r, r, 'F');
      };

      const rect = (x: number, y: number, w: number, h: number, fill: [number, number, number]) => {
        sf(fill);
        pdf.rect(x, y, w, h, 'F');
      };

      const badge = (x: number, y: number, label: string, bg: [number, number, number], fg: [number, number, number], w = 40) => {
        rr(x, y, w, 7, bg, 3);
        st(fg);
        pdf.setFontSize(7.5);
        pdf.setFont('helvetica', 'bold');
        pdf.text(label, x + w / 2, y + 5, { align: 'center' });
      };

      const hline = (y: number, x1 = 15, x2 = PW - 15) => {
        ss(GRAY_LINE);
        pdf.setLineWidth(0.3);
        pdf.line(x1, y, x2, y);
      };

      const sectionBar = (x: number, y: number, title: string, color: [number, number, number], size = 11) => {
        rect(x, y, 3, 9, color);
        st(TEXT_DARK);
        pdf.setFontSize(size);
        pdf.setFont('helvetica', 'bold');
        pdf.text(title, x + 5, y + 6.5);
      };

      const statBox = (x: number, y: number, w: number, h: number, value: string, label: string, accent: [number, number, number]) => {
        rr(x, y, w, h, GRAY_BG, 4);
        rect(x, y, 2.5, h, accent);
        st(accent);
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text(value, x + w / 2, y + h / 2 + 2, { align: 'center' });
        st(TEXT_GRAY);
        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'normal');
        pdf.text(label, x + w / 2, y + h - 3.5, { align: 'center' });
      };

      // ══════════════════════════════════════════════════════
      //  PÁGINA 1 — Resumen Ejecutivo e Integrantes del Grupo
      // ══════════════════════════════════════════════════════
      this.pdfHeader(pdf, 'REPORTE DEL GRUPO DE ESTUDIO', `Grupo: ${this.grupoSeleccionado.nombre}  |  Consolidado Docente`, '1 de 2', PW, BLUE, BLUE_DARK, WHITE);

      st([170, 205, 245]);
      pdf.setFontSize(8);
      pdf.text(`Generado: ${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}`, 18, 37);

      let posY = 48;

      // Card superior informativa del grupo
      rr(15, posY, PW - 30, 26, GRAY_BG, 4);
      st(TEXT_DARK);
      pdf.setFontSize(13);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Resumen General: ${this.grupoSeleccionado.nombre}`, 22, posY + 10);
      st(TEXT_GRAY);
      pdf.setFontSize(8.5);
      pdf.setFont('helvetica', 'normal');
      
      const fechaCrea = this.grupoSeleccionado.fechaCreacion ? new Date(this.grupoSeleccionado.fechaCreacion).toLocaleDateString('es-ES') : '—';
      pdf.text(`Fecha de Creación: ${fechaCrea}}`, 22, posY + 18);

      posY += 34;
      sectionBar(15, posY, 'MÉTRICAS CLAVE DEL GRUPO', BLUE);
      posY += 12;

      // Extracción y procesamiento dinámico de los miembros
      const alumnos = this.grupoSeleccionado.miembros || [];
      const totalAlumnos = alumnos.length;
      const totalPuntosGrupo = alumnos.reduce((sum: number, est: any) => sum + (est.puntosAcumulados || 0), 0);
      const promedioPuntos = totalAlumnos > 0 ? Math.round(totalPuntosGrupo / totalAlumnos) : 0;

      // Distribución de las cajas de estadísticas (3 columnas simétricas)
      const boxWidth = (PW - 35) / 3;
      statBox(15, posY, boxWidth, 26, String(totalAlumnos), 'Estudiantes Inscritos', BLUE);
      statBox(15 + (boxWidth + 2.5), posY, boxWidth, 26, `${totalPuntosGrupo.toLocaleString()} pts`, 'Puntaje Acumulado Total', ORANGE);
      statBox(15 + (boxWidth + 2.5) * 2, posY, boxWidth, 26, `${promedioPuntos} pts`, 'Promedio de Puntos', GREEN);

      posY += 34;
      hline(posY);
      posY += 8;

      // Tabla de alumnos pertenecientes al grupo
      sectionBar(15, posY, 'ALUMNOS INTEGRANTES Y RENDIMIENTO INDIVIDUAL', GREEN);
      posY += 12;

      // Cabecera de la Tabla
      const cols = { nombre: 18, sesiones: 110, juegos: 145, puntos: 175 };
      rr(15, posY, PW - 30, 10, BLUE_LIGHT, 3);
      st(BLUE_DARK);
      pdf.setFontSize(8.5);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Estudiante (Apellidos y Nombres)', cols.nombre, posY + 7);
      pdf.text('Sesiones', cols.sesiones, posY + 7);
      pdf.text('Juegos Comp.', cols.juegos, posY + 7);
      pdf.text('Puntaje', cols.puntos, posY + 7);
      posY += 11;

      if (alumnos.length === 0) {
        st(TEXT_GRAY);
        pdf.setFont('helvetica', 'italic');
        pdf.text('No hay estudiantes registrados en este grupo de estudio.', 20, posY + 6);
        posY += 10;
      } else {
        alumnos.forEach((est: any, idx: number) => {
          if (posY > PH - 25) return; // Control preventivo de overflow de página
          
          const bgRow = idx % 2 === 0 ? WHITE : GRAY_BG;
          rr(15, posY, PW - 30, 9, bgRow, 0);
          
          st(TEXT_DARK);
          pdf.setFontSize(8);
          pdf.setFont('helvetica', 'normal');
          
          const nombreCompleto = `${est.apellido || ''}, ${est.nombre || ''}`;
          pdf.text(nombreCompleto, cols.nombre, posY + 6);
          pdf.text(`${est.totalSesiones || 0} ses.`, cols.sesiones, posY + 6);
          pdf.text(`${est.juegosCompletados || 0} juegos`, cols.juegos, posY + 6);
          
          // Resaltar los puntos en negrita
          pdf.setFont('helvetica', 'bold');
          pdf.text(`${(est.puntosAcumulados || 0).toLocaleString()} pts`, cols.puntos, posY + 6);
          
          posY += 9.5;
        });
      }

      this.pdfFooter(pdf, 1, TOTAL_PAGES, PW, PH, BLUE, WHITE);

      // ══════════════════════════════════════════════════════
      //  PÁGINA 2 — Conclusiones Pedagógicas y Seguimiento
      // ══════════════════════════════════════════════════════
      pdf.addPage();
      this.pdfHeader(pdf, 'REPORTE DEL GRUPO DE ESTUDIO', `Grupo: ${this.grupoSeleccionado.nombre}  |  Análisis Cognitivo`, '2 de 2', PW, BLUE, BLUE_DARK, WHITE);
      
      let posY2 = 48;
      sectionBar(15, posY2, 'PLANIFICACIÓN Y MARCO PEDAGÓGICO', ORANGE);
      posY2 += 14;

      const planTexto = `Este reporte consolida el comportamiento nutricional y los hitos lúdicos alcanzados en la plataforma MIKHUY por el grupo "${this.grupoSeleccionado.nombre}". El objetivo es guiar el progreso pedagógico colectivo, asegurando que los alumnos alcancen las competencias cognitivas relacionadas a la identificación de micronutrientes deficientes y a la correcta categorización calórica de los alimentos diarios.`;
      const splitPlan = pdf.splitTextToSize(planTexto, PW - 40);
      rr(15, posY2, PW - 30, splitPlan.length * 5 + 8, GRAY_BG, 3);
      rect(15, posY2, 2.5, splitPlan.length * 5 + 8, ORANGE);
      st(TEXT_DARK);
      pdf.setFontSize(8.5);
      pdf.setFont('helvetica', 'normal');
      pdf.text(splitPlan, 21, posY2 + 7);
      
      posY2 += splitPlan.length * 5 + 16;
      hline(posY2);
      posY2 += 8;

      sectionBar(15, posY2, 'CONCLUSIÓN PEDAGÓGICA GENERAL', BLUE);
      posY2 += 14;

      // Generación automática de análisis situacional basado en el promedio real calculado
      let conclusionGrupAL = '';
      if (promedioPuntos >= 800) {
        conclusionGrupAL = `El grupo "${this.grupoSeleccionado.nombre}" demuestra un desempeño sobresaliente en los juegos interactivos de MIKHUY. Presentan un promedio robusto de conocimiento alimentario. Se sugiere iniciar retos presenciales de planificación de menús saludables semanales para capitalizar el avance teórico avanzado.`;
      } else if (promedioPuntos >= 400) {
        conclusionGrupAL = `El grupo "${this.grupoSeleccionado.nombre}" se sitúa en un nivel de aprendizaje intermedio y estable. Se evidencia participación continua en los módulos. Se recomienda reforzar de manera presencial el uso del minijuego "Clasifica tus alimentos" para consolidar los conocimientos sobre carbohidratos y grasas saturadas.`;
      } else {
        conclusionGrupAL = `El grupo "${this.grupoSeleccionado.nombre}" registra un avance inicial en la plataforma MIKHUY. Se sugiere coordinar sesiones colectivas guiadas en el aula de cómputo para motivar la acumulación de puntos y la comprensión activa de las metas calóricas diarias de salud.`;
      }

      const splitConclusion = pdf.splitTextToSize(conclusionGrupAL, PW - 40);
      const boxH = splitConclusion.length * 6 + 10;
      rr(15, posY2, PW - 30, boxH, GRAY_BG, 4);
      rect(15, posY2, PW - 30, 3, BLUE);
      st(TEXT_DARK);
      pdf.setFontSize(9);
      pdf.text(splitConclusion, 21, posY2 + 11);

      posY2 += boxH + 30;
      hline(posY2);
      
      // Firmas automáticas institucionales de MIKHUY
      st(TEXT_GRAY);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'italic');
      pdf.text('Reporte consolidado por aula - Plataforma de Monitoreo MIKHUY', PW / 2, posY2 + 8, { align: 'center' });
      pdf.text('La información expuesta cumple con los lineamientos de privacidad del seguimiento estudiantil.', PW / 2, posY2 + 13, { align: 'center' });

      this.pdfFooter(pdf, 2, TOTAL_PAGES, PW, PH, BLUE, WHITE);

      // Generar nombre de archivo sanitizado y único
      const nomArchivo = `Reporte_Grupo_${this.grupoSeleccionado.nombre.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
      pdf.save(nomArchivo);
      
      this.snackBar.open('Reporte del grupo en PDF descargado exitosamente', 'Cerrar', { duration: 3000 });
      this.isGeneratingPDF = false;
    } catch (err) {
      console.error('Error generando PDF de grupos:', err);
      this.snackBar.open('Error al compilar el reporte PDF del grupo', 'Cerrar', { duration: 3000 });
      this.isGeneratingPDF = false;
    }
  }

  // Métodos estructurales reutilizados para mantener consistencia visual con el Dashboard
  private pdfHeader(pdf: any, title: string, subtitle: string, pageLabel: string, PW: number, blue: [number, number, number], blueDark: [number, number, number], white: [number, number, number]): void {
    pdf.setFillColor(blue[0], blue[1], blue[2]);
    pdf.rect(0, 0, PW, 40, 'F');
    pdf.setFillColor(blueDark[0], blueDark[1], blueDark[2]);
    pdf.rect(PW - 38, 0, 38, 40, 'F');
    pdf.setTextColor(white[0], white[1], white[2]);
    pdf.setFontSize(15);
    pdf.setFont('helvetica', 'bold');
    pdf.text(title, 18, 19);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(200, 225, 255);
    pdf.text(subtitle, 18, 29);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(170, 205, 245);
    pdf.text(pageLabel, PW - 6, 18, { align: 'right' });
  }

  private pdfFooter(pdf: any, page: number, total: number, PW: number, PH: number, blue: [number, number, number], white: [number, number, number]): void {
    pdf.setFillColor(blue[0], blue[1], blue[2]);
    pdf.rect(0, PH - 12, PW, 12, 'F');
    pdf.setTextColor(white[0], white[1], white[2]);
    pdf.setFontSize(7.5);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Plataforma MIKHUY — Sistema de Seguimiento Nutricional Estudiantil', 15, PH - 4.5);
    pdf.text(`Página ${page} de ${total}`, PW - 15, PH - 4.5, { align: 'right' });
  }
}
