import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
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
import { PerfilService, EstudianteResponse, EstadisticasEstudianteResponse } from '../../services/perfil.service';
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
    MatSnackBarModule
  ],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {
  
  perfilForm!: FormGroup;
  seguridadForm!: FormGroup;
  hideCurrentPassword = true;
  hideNewPassword = true;
  hideConfirmPassword = true;
  
  selectedAvatar: string | null = null;
  avatarFile: File | null = null;
  
  userRole: 'student' | 'teacher' = 'student';
  notificationCount = 0;
  studentPoints = 0;
  loading = false;
  loadingStats = false;

  // Opciones para estudiantes
  grados = ['1ro', '2do', '3ro', '4to', '5to'];
  secciones = ['A', 'B', 'C', 'D'];

  // Opciones para profesores
  materias = ['Comunicaciones', 'Matemáticas', 'Historia', 'Educación Física', 'Otra'];

  // Estadísticas del usuario
  stats = {
    juegoCompletados: 0,
    puntosGanados: 0,
    canjesRealizados: 0,
    diasActivo: 0
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
    this.loadUserRole();
    this.loadPerfilData();
  }

  loadUserRole(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.userRole = currentUser.rol === 'student' ? 'student' : 'teacher';
    }
  }

  loadPerfilData(): void {
    if (this.userRole !== 'student') {
      this.loadMockDataForTeacher();
      return;
    }

    this.loading = true;
    this.perfilService.getMiPerfil().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.perfilData = response.data;
          this.studentPoints = response.data.puntosAcumulados || 0;
          this.populateForm(response.data);
          this.loadEstadisticas();
          
          // Cargar avatar si existe
          if (response.data.avatarUrl) {
            this.selectedAvatar = response.data.avatarUrl;
          } else {
            // Cargar avatar guardado localmente
            const savedAvatar = sessionStorage.getItem('userAvatar');
            if (savedAvatar) {
              this.selectedAvatar = savedAvatar;
            }
          }
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando perfil:', error);
        this.showMessage('Error al cargar el perfil', 'error');
        this.loading = false;
        // Cargar datos mock en caso de error
        this.loadMockData();
      }
    });
  }

  loadEstadisticas(): void {
    if (this.userRole !== 'student') return;

    this.loadingStats = true;
    this.perfilService.getMisEstadisticas().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.stats = {
            juegoCompletados: response.data.juegoCompletados || 0,
            puntosGanados: response.data.puntosGanados || 0,
            canjesRealizados: response.data.canjesRealizados || 0,
            diasActivo: response.data.diasActivo || 0
          };
        }
        this.loadingStats = false;
      },
      error: (error) => {
        console.error('Error cargando estadísticas:', error);
        this.loadingStats = false;
      }
    });
  }

  populateForm(data: EstudianteResponse): void {
    this.perfilForm.patchValue({
      firstName: data.nombre,
      lastName: data.apellido,
      email: data.email,
      telefono: data.telefono || '',
      grado: data.grado || '5to',
      seccion: data.seccion || 'A'
    });
  }

  loadMockData(): void {
    // Datos de ejemplo si no hay conexión al backend
    this.perfilForm.patchValue({
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'alumno@mikhuy.com',
      telefono: '',
      grado: '5to',
      seccion: 'A'
    });
  }

  loadMockDataForTeacher(): void {
    this.perfilForm.patchValue({
      firstName: 'María',
      lastName: 'García',
      email: 'profesor@mikhuy.com',
      telefono: '',
      materia: 'Matemáticas',
      experiencia: '5'
    });
  }

  initForms(): void {
    // Formulario de perfil
    this.perfilForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.pattern(/^[0-9]{9}$/)]],
      peso: ['', [Validators.min(20), Validators.max(200)]],
      talla: ['', [Validators.min(100), Validators.max(250)]],
      edad: ['', [Validators.min(5), Validators.max(100)]],
      grado: [''],
      seccion: [''],
      materia: [''],
      experiencia: ['']
    });

    // Formulario de seguridad
    this.seguridadForm = this.fb.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(group: FormGroup): {[key: string]: boolean} | null {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  onAvatarSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validar tamaño (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.showMessage('La imagen no debe superar 5MB', 'error');
        return;
      }

      // Validar tipo
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

      // Si tienes endpoint para subir avatar, descomenta esto:
      // this.uploadAvatar(file);
    }
  }

  uploadAvatar(file: File): void {
    this.perfilService.uploadAvatar(file).subscribe({
      next: (response) => {
        if (response.success) {
          this.showMessage('Avatar actualizado correctamente', 'success');
        }
      },
      error: (error) => {
        console.error('Error subiendo avatar:', error);
        this.showMessage('Error al subir el avatar', 'error');
      }
    });
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

    if (this.userRole !== 'student') {
      this.showMessage('Perfil actualizado (modo local)', 'success');
      return;
    }

    this.loading = true;

    const updateData = {
      nombre: this.perfilForm.value.firstName,
      apellido: this.perfilForm.value.lastName,
      email: this.perfilForm.value.email,
      telefono: this.perfilForm.value.telefono || undefined,
      grado: this.perfilForm.value.grado,
      seccion: this.perfilForm.value.seccion
    };

    this.perfilService.updateMiPerfil(updateData).subscribe({
      next: (response) => {
        if (response.success) {
          this.showMessage('Perfil actualizado exitosamente', 'success');
          
          // Actualizar datos locales
          const currentUser = this.authService.getCurrentUser();
          if (currentUser) {
            currentUser.name = `${updateData.nombre} ${updateData.apellido}`;
            currentUser.email = updateData.email;
            this.authService.saveUser(currentUser);
          }
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error actualizando perfil:', error);
        this.showMessage(
          error.error?.message || 'Error al actualizar el perfil',
          'error'
        );
        this.loading = false;
      }
    });
  }

  cambiarContrasena(): void {
    if (!this.seguridadForm.valid) {
      this.showMessage('Por favor completa todos los campos correctamente', 'error');
      return;
    }

    this.loading = true;

    const passwordData = {
      currentPassword: this.seguridadForm.value.currentPassword,
      newPassword: this.seguridadForm.value.newPassword
    };

    this.perfilService.cambiarContrasena(passwordData).subscribe({
      next: (response) => {
        if (response.success) {
          this.showMessage('Contraseña actualizada exitosamente', 'success');
          this.seguridadForm.reset();
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cambiando contraseña:', error);
        this.showMessage(
          error.error?.message || 'Error al cambiar la contraseña',
          'error'
        );
        this.loading = false;
      }
    });
  }

  showMessage(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: type === 'success' ? 'snackbar-success' : 'snackbar-error'
    });
  }

  goBack(): void {
    if (this.userRole === 'student') {
      this.router.navigate(['/landing-alumnos']);
    } else {
      this.router.navigate(['/landing-profesores']);
    }
  }

  navigateToGames(): void {
    this.router.navigate(['/juegos']);
  }

  navigateToBenefits(): void {
    this.router.navigate(['/beneficios']);
  }

  navigateToChatbot(): void {
    this.router.navigate(['/chatbot']);
  }

  logout(): void {
    this.authService.logout();
    sessionStorage.clear();
    this.router.navigate(['/']);
  }
}