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
}
