import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatStepperModule } from '@angular/material/stepper';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    MatStepperModule
  ],
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css']
})
export class RegistroComponent implements OnInit {
  registroForm!: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;
  userRole: 'student' | 'teacher' = 'student';

  avatarFile: File | null = null;
  selectedAvatar: string | null = null;

  // Opciones para estudiantes
  grados = ['1ro', '2do', '3ro', '4to', '5to', '6to'];
  secciones = ['A', 'B', 'C', 'D'];

  // Opciones para profesores
  materias = [
    'Comunicaciones',
    'Matemáticas',
    'Historia',
    'Educación Física',
    'Otra'
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Obtener el rol de la URL
    this.route.queryParams.subscribe(params => {
      this.userRole = params['role'] || 'student';
      this.initForm();
    });
  }

  initForm(): void {
    if (this.userRole === 'student') {
      this.registroForm = this.fb.group({
        // Datos personales
        firstName: ['', [Validators.required, Validators.minLength(2)]],
        lastName: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        
        // Datos académicos
        grado: ['', Validators.required],
        seccion: ['', Validators.required],
        
        // Seguridad
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
        
        // Términos
        acceptTerms: [false, Validators.requiredTrue]
      }, { validators: this.passwordMatchValidator });
      
    } else {
      this.registroForm = this.fb.group({
        // Datos personales
        firstName: ['', [Validators.required, Validators.minLength(2)]],
        lastName: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        
        // Datos profesionales
        materia: ['', Validators.required],
        experiencia: ['', Validators.required],
        
        // Seguridad
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
        
        // Términos
        acceptTerms: [false, Validators.requiredTrue]
      }, { validators: this.passwordMatchValidator });
    }
  }

  passwordMatchValidator(group: FormGroup): {[key: string]: boolean} | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  togglePasswordVisibility(field: 'password' | 'confirmPassword'): void {
    if (field === 'password') {
      this.hidePassword = !this.hidePassword;
    } else {
      this.hideConfirmPassword = !this.hideConfirmPassword;
    }
  }

  onSubmit(): void {
    if (this.registroForm.valid) {
      console.log('Registro exitoso:', this.registroForm.value);
      console.log('Rol:', this.userRole);
      
      // Simular registro exitoso
      const newUser = {
        id: Math.random().toString(36).substr(2, 9),
        name: `${this.registroForm.value.firstName} ${this.registroForm.value.lastName}`,
        email: this.registroForm.value.email,
        role: this.userRole,
        points: this.userRole === 'student' ? 0 : undefined
      };
      
      // Guardar en sessionStorage
      sessionStorage.setItem('isAuthenticated', 'true');
      sessionStorage.setItem('userRole', this.userRole);
      sessionStorage.setItem('currentUser', JSON.stringify(newUser));
      
      // Mostrar mensaje de éxito y redirigir
      alert('¡Registro exitoso! Bienvenido a MIKHUY');
      
      if (this.userRole === 'student') {
        this.router.navigate(['/landing-alumnos']);
      } else {
        this.router.navigate(['/landing-profesores']);
      }
    } else {
      // Marcar todos los campos como tocados para mostrar errores
      Object.keys(this.registroForm.controls).forEach(key => {
        this.registroForm.get(key)?.markAsTouched();
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/login'], { queryParams: { role: this.userRole } });
  }

  goToLogin(): void {
    this.router.navigate(['/login'], { queryParams: { role: this.userRole } });
  }

  onAvatarSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.avatarFile = file;
      
      // Leer la imagen para mostrar preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedAvatar = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeAvatar(): void {
    this.selectedAvatar = null;
    this.avatarFile = null;
  }
}