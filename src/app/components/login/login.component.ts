import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import {
  MatDialogModule,
  MatDialog,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../models/models';

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
    MatSlideToggleModule,
    MatDialogModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  hidePassword = true;
  userRole: string = 'student';
  loading = false;

  // ── Estado del backend ──────────────────────────────
  backendReady = false;
  backendWaking = true;
  showWakingMessage = false;
  private readonly BACKEND_URL = 'https://mikhuy-backend.onrender.com';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.userRole = params['role'] || 'student';
      console.log('👤 Rol esperado:', this.userRole);
    });

    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    // 🔥 Despierta el backend al cargar el login (silencioso)
    this.wakeUpBackend();
  }

  // ── Wake-up con reintentos ──────────────────────────
  private wakeUpBackend(): void {
    const maxAttempts = 10;
    let attempts = 0;

    const ping = () => {
      fetch(`${this.BACKEND_URL}/api/status`)
        .then((res) => {
          if (res.ok) {
            this.backendReady = true;
            this.backendWaking = false;
            console.log('✅ Backend listo');
          } else {
            retry();
          }
        })
        .catch(() => retry());
    };

    const retry = () => {
      attempts++;
      if (attempts < maxAttempts) {
        setTimeout(ping, 3000);
      } else {
        this.backendWaking = false;
        console.warn('⚠️ Backend no respondió tras varios intentos');
      }
    };

    ping();
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      alert('Por favor completa los campos correctamente.');
      return;
    }

    // Si el backend aún no está listo, muestra el mensaje y espera
    if (this.backendWaking) {
      this.showWakingMessage = true;
      return;
    }

    this.loading = true;
    this.showWakingMessage = false;

    const loginData: LoginRequest = {
      email: this.loginForm.value.username,
      password: this.loginForm.value.password,
    };

    console.log('🔐 Iniciando login para:', loginData.email);

    this.authService.login(loginData).subscribe({
      next: (res) => {
        console.log('📦 Respuesta del servidor:', res);

        if (res?.success && res.data?.token) {
          const rol = res.data.user?.rol;

          console.log('✅ Login exitoso');
          console.log('🎟️ Token recibido:', res.data.token ? '✓' : '✗');
          console.log('👤 Usuario:', res.data.user);
          console.log('🎭 Rol del usuario:', rol);

          if (rol !== this.userRole) {
            console.warn(`⚠️ Rol no coincide. Esperado: ${this.userRole}, Recibido: ${rol}`);
            alert(`Este usuario pertenece al rol "${rol}" y no puede ingresar desde el login de "${this.userRole}".`);
            this.loading = false;
            return;
          }

          this.authService.saveToken(res.data.token);
          console.log('💾 Token guardado');

          const tokenGuardado = localStorage.getItem('authToken');
          console.log('🔍 Verificación - Token en localStorage:', tokenGuardado ? '✓' : '✗');

          if (!tokenGuardado) {
            console.error('❌ ERROR: El token NO se guardó en localStorage');
            alert('Error al guardar la sesión. Intenta nuevamente.');
            this.loading = false;
            return;
          }

          this.authService.saveUser(res.data.user);
          console.log('💾 Usuario guardado');

          const usuarioGuardado = localStorage.getItem('currentUser');
          console.log('🔍 Verificación - Usuario en localStorage:', usuarioGuardado ? '✓' : '✗');

          this.loading = false;

          if (rol === 'student') {
            console.log('➡️ Redirigiendo a landing-alumnos');
            this.router.navigate(['/landing-alumnos']);
          } else if (rol === 'teacher') {
            console.log('➡️ Redirigiendo a landing-profesores');
            this.router.navigate(['/landing-profesores']);
          } else {
            console.log('➡️ Redirigiendo a dashboards');
            this.router.navigate(['/dashboards']);
          }
        } else {
          console.error('❌ Respuesta sin token o sin success:', res);
          alert(res.message || 'Credenciales inválidas. Inténtalo nuevamente.');
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('❌ Error en login:', err);
        console.error('Status:', err.status);
        console.error('Message:', err.error?.message);

        if (err.status === 401) {
          alert('Credenciales incorrectas. Verifica tu email y contraseña.');
        } else if (err.status === 0) {
          alert('No se pudo conectar con el servidor. Verifica tu conexión.');
        } else {
          alert('Error en el inicio de sesión. Verifica tus credenciales.');
        }
        this.loading = false;
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  goToRegister(): void {
    this.router.navigate(['/registro'], {
      queryParams: { role: this.userRole },
    });
  }
}

@Component({
  selector: 'access-denied-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="dialog-container">
      <h2 mat-dialog-title>
        <mat-icon color="warn">block</mat-icon> Acceso Denegado
      </h2>
      <mat-dialog-content>
        <p>{{ message }}</p>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close>Cerrar</button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-container {
      font-family: 'Poppins', sans-serif;
      padding: 24px;
      max-width: 400px;
    }
    h2 {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #d32f2f;
      font-weight: 600;
      margin: 0;
    }
    p {
      margin-top: 1rem;
      font-size: 0.95rem;
      color: #444;
    }
  `]
})
export class AccessDeniedDialog {
  constructor(@Inject(MAT_DIALOG_DATA) public message: string) {}
}