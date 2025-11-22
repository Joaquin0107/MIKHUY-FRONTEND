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
import { Router } from '@angular/router';
import {
  PerfilService,
  EstudianteResponse,
  UpdateProfileRequest,
} from '../../services/perfil.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
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

  // ✅ CORRECCIÓN: Solo rol student
  userRole: 'student' = 'student';
  notificationCount = 0;
  studentPoints = 0;
  loading = false;
  loadingStats = false;

  // Opciones para estudiantes
  grados = ['1ro', '2do', '3ro', '4to', '5to'];
  secciones = ['A', 'B', 'C', 'D'];

  // ✅ Estadísticas del usuario
  stats = {
    juegosCompletados: 0,
    puntosGanados: 0,
    canjesRealizados: 0,
    diasActivo: 0,
  };

  // Datos del perfil
  perfilData: EstudianteResponse | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private perfilService: PerfilService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.loadPerfilData();
  }

  loadPerfilData(): void {
    console.log('📡 Cargando perfil del estudiante...');
    console.log(
      '🎟️ Token:',
      localStorage.getItem('authToken') ? '✓ EXISTE' : '✗ NO EXISTE'
    );

    this.loading = true;
    this.perfilService.getMiPerfil().subscribe({
      next: (response) => {
        console.log('✅ Perfil recibido:', response);
        if (response.success && response.data) {
          this.perfilData = response.data;
          this.studentPoints = response.data.puntosAcumulados || 0;

          this.stats = {
            juegosCompletados: response.data.juegosCompletados || 0,
            puntosGanados: this.studentPoints,
            canjesRealizados: 0,
            diasActivo: this.calcularDiasActivo(response.data.fechaRegistro), // ✅ Usar fechaRegistro
          };

          this.populateForm(response.data);
          this.loadEstadisticas();

          if (response.data.avatarUrl) {
            this.selectedAvatar = response.data.avatarUrl;
          } else {
            const savedAvatar = sessionStorage.getItem('userAvatar');
            if (savedAvatar) {
              this.selectedAvatar = savedAvatar;
            }
          }
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error cargando perfil:', error);
        console.error('Status:', error.status);
        console.error('URL:', error.url);

        if (error.status === 401) {
          this.showMessage(
            'Sesión expirada. Inicia sesión nuevamente.',
            'error'
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
    this.loadingStats = true;
    this.perfilService.getMisEstadisticas().subscribe({
      next: (response) => {
        console.log('✅ Estadísticas recibidas:', response);
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
        // No mostrar error, usar valores por defecto
        this.loadingStats = false;
      },
    });
  }

  calcularDiasActivo(fechaRegistro?: string): number {
    if (!fechaRegistro) return 0;
    const fecha = new Date(fechaRegistro);
    const hoy = new Date();
    const diff = hoy.getTime() - fecha.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  calcularDiasDesdeRegistro(): number {
    if (this.perfilData) {
      const fechaRegistro = new Date(
        this.perfilData.fechaRegistro || Date.now()
      );
      const hoy = new Date();
      const diff = hoy.getTime() - fechaRegistro.getTime();
      return Math.floor(diff / (1000 * 60 * 60 * 24));
    }
    return 0;
  }

  populateForm(data: EstudianteResponse): void {
    this.perfilForm.patchValue({
      firstName: data.nombres,
      lastName: data.apellidos,
      email: data.email,
      telefono: data.telefono || '',
      edad: data.edad || '',
      peso: data.peso || '',
      talla: data.talla || '',
      grado: data.grado || '5to',
      seccion: data.seccion || 'A',
    });
  }

  initForms(): void {
    // Formulario de perfil
    this.perfilForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.pattern(/^[0-9]{9}$/)]],
      // ✅ CORRECCIÓN: Permitir decimales en peso y talla
      peso: ['', [Validators.min(20), Validators.max(200)]],
      talla: ['', [Validators.min(100), Validators.max(250)]],
      edad: ['', [Validators.min(5), Validators.max(100)]],
      grado: ['5to'],
      seccion: ['A'],
    });

    // Formulario de seguridad
    this.seguridadForm = this.fb.group(
      {
        currentPassword: ['', Validators.required],
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator }
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
    this.showMessage('Por favor completa todos los campos requeridos', 'error');
    return;
  }

  const token = localStorage.getItem('authToken');
  if (!token) {
    this.showMessage('No hay sesión activa. Inicia sesión nuevamente.', 'error');
    this.router.navigate(['/login'], { queryParams: { role: 'student' } });
    return;
  }

  this.loading = true;

  const pesoValue = this.perfilForm.value.peso;
  const tallaValue = this.perfilForm.value.talla;
  const edadValue = this.perfilForm.value.edad;

  const updateData: UpdateProfileRequest = {
    nombres: this.perfilForm.value.firstName,
    apellidos: this.perfilForm.value.lastName,
    telefono: this.perfilForm.value.telefono || undefined,
    grado: this.perfilForm.value.grado,
    seccion: this.perfilForm.value.seccion,
    edad: edadValue ? parseInt(edadValue) : undefined,
    peso: pesoValue ? parseFloat(pesoValue) : undefined,
    talla: tallaValue ? parseFloat(tallaValue) : undefined
    // ✅ REMOVIDO: email (no está en UpdateProfileRequest)
  };

  console.log('📦 Datos a enviar:', updateData);

  this.perfilService.updateMiPerfil(updateData).subscribe({
    next: (response) => {
      console.log('✅ Perfil actualizado:', response);
      if (response.success) {
        this.showMessage('Perfil actualizado exitosamente', 'success');

        const currentUser = this.authService.getCurrentUser();
        if (currentUser) {
          currentUser.name = `${updateData.nombres} ${updateData.apellidos}`;
          // ✅ REMOVIDO: currentUser.email = updateData.email;
          this.authService.saveUser(currentUser);
        }

        this.loadPerfilData();
      }
      this.loading = false;
    },
    error: (error) => {
      console.error('❌ Error actualizando perfil:', error);

      if (error.status === 401) {
        this.showMessage('Sesión expirada. Inicia sesión nuevamente.', 'error');
        setTimeout(() => {
          this.authService.logout();
          this.router.navigate(['/login'], { queryParams: { role: 'student' } });
        }, 2000);
      } else {
        this.showMessage(
          error.error?.message || 'Error al actualizar el perfil',
          'error'
        );
      }
      this.loading = false;
    }
  });
}

  cambiarContrasena(): void {
    if (!this.seguridadForm.valid) {
      this.showMessage(
        'Por favor completa todos los campos correctamente',
        'error'
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
        console.log('✅ Contraseña cambiada:', response);
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
          'error'
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
    this.router.navigate(['/landing-alumnos']);
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
