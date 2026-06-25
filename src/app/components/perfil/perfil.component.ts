import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AmigoService, Companero } from '../../services/amigo.service';
import { RouterLink } from '@angular/router';
import {
  PerfilService,
  EstudianteResponse,
  UpdateProfileRequest,
} from '../../services/perfil.service';
import { StudentService } from '../../services/student.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTabsModule,
    MatBadgeModule,
    MatMenuModule,
    MatDividerModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css'],
})
export class PerfilComponent implements OnInit {
  perfilForm!: FormGroup;
  seguridadForm!: FormGroup;
  hideCurrentPassword = true;
  hideNewPassword = true;
  hideConfirmPassword = true;
  selectedAvatar: string | null = null;
  avatarFile: File | null = null;

  currentUserRole: 'student' | 'teacher' = 'student';
  isViewingOwnProfile = true;
  estudianteId: string | null = null;

  notificationCount = 0;
  studentPoints = 0;
  loading = false;
  loadingStats = false;
  grados = ['1ro', '2do', '3ro', '4to', '5to'];
  secciones = ['A', 'B', 'C', 'D'];

  stats = {
    juegosCompletados: 0,
    puntosGanados: 0,
    canjesRealizados: 0,
    diasActivo: 0,
  };

  perfilData: EstudianteResponse | null = null;

  // ── Amigos ────────────────────────────────────────────────────────────────
  companeros: Companero[] = [];
  loadingCompaneros = false;
  loadingAmigo = false;
  busquedaAmigo = '';
  solicitudesRecibidas: any[] = [];
  amigosConfirmados: Companero[] = [];
  estadosAmistad: { [key: string]: string } = {};

  private miEstudianteId = '';
  private miNombreCompleto = '';

  get companerosFiltrados(): Companero[] {
    if (!this.busquedaAmigo.trim()) return this.companeros;
    const q = this.busquedaAmigo.toLowerCase();
    return this.companeros.filter(
      (c) =>
        c.nombres.toLowerCase().includes(q) ||
        c.apellidos.toLowerCase().includes(q),
    );
  }

  getAmigosConfirmados(): Companero[] {
    return this.amigosConfirmados;
  }
  // ─────────────────────────────────────────────────────────────────────────

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private perfilService: PerfilService,
    private studentService: StudentService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private amigoService: AmigoService,
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.loadUserRole();
    this.checkRouteParams();
  }

  loadUserRole(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.currentUserRole =
        currentUser.rol === 'teacher' ? 'teacher' : 'student';
      console.log('👤 Rol del usuario:', this.currentUserRole);
    }
  }

  checkRouteParams(): void {
    this.route.queryParams.subscribe((params) => {
      this.estudianteId = params['estudianteId'] || null;

      if (this.estudianteId && this.currentUserRole === 'teacher') {
        this.isViewingOwnProfile = false;
        this.loadEstudianteDataForTeacher(this.estudianteId);
      } else {
        this.isViewingOwnProfile = true;
        this.loadPerfilData();
      }
    });
  }

  navigateToAnalysis(): void {
    this.router.navigate(['/dashboards']);
  }

  // ── Carga de datos ────────────────────────────────────────────────────────

  loadEstudianteDataForTeacher(estudianteId: string): void {
    this.loading = true;
    this.studentService.getById(estudianteId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.perfilData = response.data;
          this.studentPoints = response.data.puntosAcumulados || 0;
          this.stats = {
            juegosCompletados: response.data.juegosCompletados || 0,
            puntosGanados: this.studentPoints,
            canjesRealizados: 0,
            diasActivo: this.calcularDiasActivo(response.data.fechaRegistro),
          };
          this.populateForm(response.data);
          if (response.data.avatarUrl) {
            this.selectedAvatar = response.data.avatarUrl;
          }
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error cargando estudiante:', error);
        this.showMessage('Error al cargar los datos del estudiante', 'error');
        this.loading = false;
        this.router.navigate(['/dashboards']);
      },
    });
  }

  loadPerfilData(): void {
    this.loading = true;
    this.perfilService.getMiPerfil().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.perfilData = response.data;
          this.studentPoints = response.data.puntosAcumulados || 0;
          this.stats = {
            juegosCompletados: response.data.juegosCompletados || 0,
            puntosGanados: this.studentPoints,
            canjesRealizados: 0,
            diasActivo: this.calcularDiasActivo(response.data.fechaRegistro),
          };
          this.populateForm(response.data);
          this.loadEstadisticas();

          // ── Amigos: capturar id y nombre del estudiante autenticado ───────
          if (response.data.id) {
            this.miEstudianteId = response.data.id.toString();
            this.miNombreCompleto = `${response.data.nombres} ${response.data.apellidos}`;
          }
          // Procesar notificaciones de amistad y cargar compañeros
          this.procesarNotificacionesAmistad();
          this.loadCompaneros();
          // ─────────────────────────────────────────────────────────────────

          if (response.data.avatarUrl) {
            this.selectedAvatar = response.data.avatarUrl;
          } else {
            const savedAvatar = sessionStorage.getItem('userAvatar');
            if (savedAvatar) this.selectedAvatar = savedAvatar;
          }
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error cargando perfil:', error);
        if (error.status === 401) {
          this.showMessage(
            'Sesión expirada. Inicia sesión nuevamente.',
            'error',
          );
          setTimeout(() => {
            this.authService.logout();
            this.router.navigate(['/login'], {
              queryParams: { role: 'student' },
            });
          }, 2000);
        } else {
          this.showMessage('Error al cargar el perfil', 'error');
        }
        this.loading = false;
      },
    });
  }

  loadEstadisticas(): void {
    if (!this.isViewingOwnProfile) return;
    this.loadingStats = true;
    this.perfilService.getMisEstadisticas().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.stats = {
            juegosCompletados: response.data.juegosCompletados || 0,
            puntosGanados: response.data.puntosGanados || 0,
            canjesRealizados: response.data.puntosGastados
              ? Math.floor(response.data.puntosGastados / 100)
              : 0,
            diasActivo: this.calcularDiasDesdeRegistro(),
          };
        }
        this.loadingStats = false;
      },
      error: (error) => {
        console.error('❌ Error cargando estadísticas:', error);
        this.loadingStats = false;
      },
    });
  }

  // ── Métodos de Amigos ─────────────────────────────────────────────────────

  /**
   * Carga las notificaciones del back y procesa las de tipo amistad
   * para actualizar el localStorage y las solicitudes recibidas.
   */
  procesarNotificacionesAmistad(): void {
    this.amigoService.getSolicitudesRecibidas().subscribe({
      next: (solicitudes) => {
        this.solicitudesRecibidas = solicitudes;
      },
      error: (err: any) => console.error('Error al cargar solicitudes:', err),
    });
  }

  loadCompaneros(): void {
    this.loadingCompaneros = true;
    this.amigoService.getCompaneros().subscribe({
      next: (lista) => {
        this.companeros = lista;
        this.loadingCompaneros = false; // ← AGREGAR

        this.amigoService.getAmigos().subscribe({
          next: (lista) => (this.amigosConfirmados = lista),
          error: () => (this.amigosConfirmados = []),
        });
        this.companeros.forEach((c) => {
          this.amigoService.getEstado(c.id).subscribe({
            next: (estado) => {
              this.estadosAmistad[c.id] = estado;
            },
            error: (err) => {
              console.warn(
                `No se pudo obtener estado para el compañero ${c.id}:`,
                err,
              );
              this.estadosAmistad[c.id] = 'ninguno';
            },
          });
        });
      },
      error: (err) => {
        console.error('Error al cargar compañeros:', err);
        this.loadingCompaneros = false;
      },
    });
  }

  getEstadoAmigo(otroId: string): string {
    return this.estadosAmistad[otroId] || 'ninguno';
  }

  enviarSolicitud(companero: Companero): void {
    this.amigoService.enviarSolicitud(companero.id).subscribe({
      next: () => {
        this.showMessage(`Solicitud enviada a ${companero.nombres}`, 'success');
        this.estadosAmistad[companero.id] = 'pendiente_enviada';
      },
      error: (err: any) =>
        this.showMessage(
          err.error?.message || 'Error al enviar solicitud',
          'error',
        ),
    });
  }

  aceptarSolicitud(remitenteId: string, remitenteNombre: string): void {
    this.amigoService.aceptarSolicitud(remitenteId).subscribe({
      next: () => {
        this.showMessage(`¡Ahora eres amigo de ${remitenteNombre}!`, 'success');
        this.estadosAmistad[remitenteId] = 'amigos';
        this.procesarNotificacionesAmistad();
        this.amigoService
          .getAmigos()
          .subscribe((a) => (this.amigosConfirmados = a));
      },
      error: (err: any) =>
        this.showMessage('Error al aceptar amistad', 'error'),
    });
  }

  rechazarSolicitud(remitenteId: string, remitenteNombre?: string): void {
    this.amigoService.eliminarRelacion(remitenteId).subscribe({
      next: () => {
        this.showMessage('Solicitud rechazada', 'success');
        this.estadosAmistad[remitenteId] = 'ninguno';
        this.procesarNotificacionesAmistad();
      },
      error: (err: any) =>
        this.showMessage('Error al rechazar solicitud', 'error'),
    });
  }

  eliminarAmigo(amigoId: string): void {
    this.amigoService.eliminarRelacion(amigoId).subscribe({
      next: () => {
        this.showMessage('Amigo eliminado de tu lista', 'success');
        this.estadosAmistad[amigoId] = 'ninguno';
        this.amigoService
          .getAmigos()
          .subscribe((a) => (this.amigosConfirmados = a));
      },
      error: (err: any) => this.showMessage('Error al eliminar amigo', 'error'),
    });
  }

  getEstado(otroId: string): string {
    return this.estadosAmistad[otroId] || 'ninguno';
  }

  // ─────────────────────────────────────────────────────────────────────────

  calcularDiasActivo(fechaRegistro?: string): number {
    if (!fechaRegistro) return 0;
    const fecha = new Date(fechaRegistro);
    const hoy = new Date();
    return Math.floor(
      (hoy.getTime() - fecha.getTime()) / (1000 * 60 * 60 * 24),
    );
  }

  calcularDiasDesdeRegistro(): number {
    if (this.perfilData) {
      const fechaRegistro = new Date(
        this.perfilData.fechaRegistro || Date.now(),
      );
      const hoy = new Date();
      return Math.floor(
        (hoy.getTime() - fechaRegistro.getTime()) / (1000 * 60 * 60 * 24),
      );
    }
    return 0;
  }

  populateForm(data: EstudianteResponse): void {
    const seccionNorm = data.seccion
      ? data.seccion.replace('Sección ', '').trim()
      : 'A';
    this.perfilForm.patchValue({
      firstName: data.nombres,
      lastName: data.apellidos,
      email: data.email,
      telefono: data.telefono || '',
      edad: data.edad || '',
      peso: data.peso || '',
      talla: data.talla || '',
      grado: data.grado || '5to',
      seccion: seccionNorm,
    });
  }

  initForms(): void {
    this.perfilForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.pattern(/^[0-9]{9}$/)]],
      peso: ['', [Validators.min(0.5), Validators.max(200)]],
      talla: ['', [Validators.min(1.0), Validators.max(2.5)]],
      edad: ['', [Validators.min(11), Validators.max(17)]],
      grado: ['5to'],
      seccion: ['A'],
    });

    this.seguridadForm = this.fb.group(
      {
        currentPassword: ['', Validators.required],
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator },
    );
  }

  passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  onAvatarSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        this.showMessage('La imagen no debe superar 5MB', 'error');
        return;
      }
      if (!file.type.startsWith('image/')) {
        this.showMessage('Solo se permiten archivos de imagen', 'error');
        return;
      }
      this.avatarFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedAvatar = e.target.result;
        sessionStorage.setItem('userAvatar', e.target.result);
      };
      reader.onload = (e: any) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX = 200;
          const scale = Math.min(MAX / img.width, MAX / img.height, 1);
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          canvas
            .getContext('2d')!
            .drawImage(img, 0, 0, canvas.width, canvas.height);
          const compressed = canvas.toDataURL('image/jpeg', 0.7);
          this.selectedAvatar = compressed;
          sessionStorage.setItem('userAvatar', compressed);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeAvatar(): void {
    this.selectedAvatar = null;
    this.avatarFile = null;
    sessionStorage.removeItem('userAvatar');
    this.showMessage('Avatar eliminado', 'success');
  }

  guardarPerfil(): void {
    if (!this.perfilForm.valid) {
      this.showMessage(
        'Por favor completa todos los campos requeridos',
        'error',
      );
      return;
    }

    const token =
      localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (!token) {
      this.showMessage('Sesión expirada. Inicia sesión nuevamente.', 'error');
      setTimeout(() => {
        this.authService.logout();
        this.router.navigate(['/login'], {
          queryParams: { role: this.currentUserRole },
        });
      }, 2000);
      return;
    }

    this.loading = true;

    const seccionRaw = this.perfilForm.value.seccion as string;
    const seccionNormalizada =
      seccionRaw?.replace('Sección ', '').trim() ?? seccionRaw;
    const pesoValue = this.perfilForm.value.peso;
    const tallaValue = this.perfilForm.value.talla;
    const edadValue = this.perfilForm.value.edad;

    const updateData: UpdateProfileRequest = {
      nombres: this.perfilForm.value.firstName,
      apellidos: this.perfilForm.value.lastName,
      email: this.perfilForm.value.email,
      telefono: this.perfilForm.value.telefono || undefined,
      grado: this.perfilForm.value.grado,
      seccion: seccionNormalizada,
      edad: edadValue ? parseInt(edadValue) : undefined,
      peso: pesoValue ? parseFloat(pesoValue) : undefined,
      talla: tallaValue
        ? parseFloat(parseFloat(tallaValue).toFixed(2))
        : undefined,
    };

    if (this.avatarFile && this.selectedAvatar) {
      updateData.avatarUrl = this.selectedAvatar;
    }

    if (!this.isViewingOwnProfile && this.estudianteId) {
      this.studentService
        .updateEstudiante(this.estudianteId, updateData)
        .subscribe({
          next: (response) => {
            this.showMessage(
              'Perfil del estudiante actualizado exitosamente',
              'success',
            );
            this.loading = false;
            this.loadEstudianteDataForTeacher(this.estudianteId!);
          },
          error: (error) => {
            console.error('❌ Error actualizando estudiante:', error);
            if (error.status === 401) {
              this.showMessage(
                'Sesión expirada. Inicia sesión nuevamente.',
                'error',
              );
              setTimeout(() => {
                this.authService.logout();
                this.router.navigate(['/login'], {
                  queryParams: { role: 'teacher' },
                });
              }, 2000);
            } else {
              this.showMessage(
                error.error?.message ||
                  'Error al actualizar el perfil del estudiante',
                'error',
              );
            }
            this.loading = false;
          },
        });
    } else {
      this.perfilService.updateMiPerfil(updateData).subscribe({
        next: (response) => {
          if (response.success) {
            this.showMessage('Perfil actualizado exitosamente', 'success');
            const currentUser = this.authService.getCurrentUser();
            if (currentUser) {
              currentUser.name = `${updateData.nombres} ${updateData.apellidos}`;
              if (updateData.avatarUrl)
                currentUser.avatarUrl = updateData.avatarUrl;
              this.authService.saveUser(currentUser);
            }
            this.avatarFile = null;
            this.loadPerfilData();
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('❌ Error actualizando perfil:', error);
          if (error.status === 401) {
            this.showMessage(
              'Sesión expirada. Inicia sesión nuevamente.',
              'error',
            );
            setTimeout(() => {
              this.authService.logout();
              this.router.navigate(['/login'], {
                queryParams: { role: 'student' },
              });
            }, 2000);
          } else if (error.status === 0) {
            this.showMessage('No se pudo conectar con el servidor.', 'error');
          } else {
            this.showMessage(
              error.error?.message || 'Error al actualizar el perfil',
              'error',
            );
          }
          this.loading = false;
        },
      });
    }
  }

  cambiarContrasena(): void {
    if (!this.seguridadForm.valid) {
      this.showMessage(
        'Por favor completa todos los campos correctamente',
        'error',
      );
      return;
    }
    if (this.seguridadForm.errors?.['passwordMismatch']) {
      this.showMessage('Las contraseñas no coinciden', 'error');
      return;
    }

    this.loading = true;
    const passwordData = {
      oldPassword: this.seguridadForm.value.currentPassword,
      newPassword: this.seguridadForm.value.newPassword,
      confirmPassword: this.seguridadForm.value.confirmPassword,
    };

    this.authService.cambiarContrasena(passwordData).subscribe({
      next: (response) => {
        if (response.success) {
          this.showMessage('Contraseña actualizada exitosamente', 'success');
          this.seguridadForm.reset();
          this.hideCurrentPassword = true;
          this.hideNewPassword = true;
          this.hideConfirmPassword = true;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error cambiando contraseña:', error);
        this.showMessage(
          error.error?.message || 'Error al cambiar la contraseña.',
          'error',
        );
        this.loading = false;
      },
    });
  }

  showMessage(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: type === 'success' ? 'snackbar-success' : 'snackbar-error',
    });
  }

  goBack(): void {
    if (this.currentUserRole === 'teacher') {
      this.router.navigate(['/dashboards']);
    } else {
      this.router.navigate(['/landing-alumnos']);
    }
  }

  navigateToGames(): void {
    this.router.navigate(['/juegos']);
  }

  navigateToBenefits(): void {
    this.router.navigate(['/beneficios']);
  }

  logout(): void {
    this.authService.logout();
    sessionStorage.clear();
    this.router.navigate(['/']);
  }
}
