import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSlideToggleModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  hidePassword = true;
  userRole: string = 'student';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Obtener el rol de la URL
    this.route.queryParams.subscribe(params => {
      this.userRole = params['role'] || 'student';
    });

    // Inicializar formulario
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      console.log('Login data:', this.loginForm.value);
      console.log('User role:', this.userRole);
      
      // ⚠️ MODO DESARROLLO - Sin backend
      // Simular autenticación exitosa con datos de prueba
      const mockUser = {
        id: '1',
        name: this.userRole === 'student' ? 'Juan Pérez' : 'Prof. María García',
        email: this.loginForm.value.username,
        role: this.userRole,
        points: this.userRole === 'student' ? 1250 : undefined
      };
      
      // Guardar en memoria (sin llamada a backend)
      sessionStorage.setItem('userRole', this.userRole);
      sessionStorage.setItem('currentUser', JSON.stringify(mockUser));
      sessionStorage.setItem('isAuthenticated', 'true');
      
      // Simular delay de red (opcional)
      setTimeout(() => {
        // Redirigir según el rol
        if (this.userRole === 'student') {
          this.router.navigate(['/landing-alumnos']);
        } else if (this.userRole === 'teacher') {
          this.router.navigate(['/landing-profesores']);
        }
      }, 500);
    }
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  forgotPassword(): void {
    console.log('Forgot password clicked');
    // Lógica para recuperar contraseña
  }
}