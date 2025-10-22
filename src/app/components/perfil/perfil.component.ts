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
import { Router } from '@angular/router';

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
    MatDividerModule
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
  studentPoints = 1250;

  // Opciones para estudiantes
  grados = ['1ro', '2do', '3ro', '4to', '5to'];
  secciones = ['A', 'B', 'C', 'D'];

  // Opciones para profesores
  materias = ['Comunicaciones', 'Matemáticas', 'Historia', 'Educación Física', 'Otra'];

  // Estadísticas del usuario
  stats = {
    juegoCompletados: 12,
    puntosGanados: 1250,
    canjesRealizados: 5,
    diasActivo: 28
  };

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.initForms();
  }

  loadUserData(): void {
    const currentUser = sessionStorage.getItem('currentUser');
    if (currentUser) {
      const user = JSON.parse(currentUser);
      this.userRole = user.role;
      this.studentPoints = user.points || 0;
    }

    // Cargar avatar guardado
    const savedAvatar = sessionStorage.getItem('userAvatar');
    if (savedAvatar) {
      this.selectedAvatar = savedAvatar;
    }
  }

  initForms(): void {
    // Formulario de perfil
    this.perfilForm = this.fb.group({
      firstName: ['Juan', [Validators.required, Validators.minLength(2)]],
      lastName: ['Pérez', [Validators.required, Validators.minLength(2)]],
      email: ['alumno@mikhuy.com', [Validators.required, Validators.email]],
      telefono: ['', [Validators.pattern(/^[0-9]{9}$/)]],
      grado: this.userRole === 'student' ? ['5to', Validators.required] : [''],
      seccion: this.userRole === 'student' ? ['A', Validators.required] : [''],
      materia: this.userRole === 'teacher' ? ['', Validators.required] : [''],
      experiencia: this.userRole === 'teacher' ? ['', Validators.required] : ['']
    });

    // Formulario de seguridad
    this.seguridadForm = this.fb.group({
      currentPassword: ['', Validators.required],
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
  }

  guardarPerfil(): void {
    if (this.perfilForm.valid) {
      console.log('Perfil guardado:', this.perfilForm.value);
      alert('Perfil actualizado exitosamente');
      
      // Actualizar datos en sessionStorage
      const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
      currentUser.name = `${this.perfilForm.value.firstName} ${this.perfilForm.value.lastName}`;
      currentUser.email = this.perfilForm.value.email;
      sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
  }

  cambiarContrasena(): void {
    if (this.seguridadForm.valid) {
      console.log('Contraseña cambiada');
      alert('Contraseña actualizada exitosamente');
      this.seguridadForm.reset();
    }
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
    sessionStorage.clear();
    console.log('Logout');
    this.router.navigate(['/']);
  }
}