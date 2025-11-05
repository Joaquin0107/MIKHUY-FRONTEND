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
    });

    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false],
    });
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      alert('Por favor completa los campos correctamente.');
      return;
    }

    const loginData: LoginRequest = {
      email: this.loginForm.value.username,
      password: this.loginForm.value.password,
    };

    this.authService.login(loginData).subscribe({
      next: (res) => {
        if (res?.success && res.data?.token) {
          const rol = res.data.user?.rol;

          // 🔹 Guardar sesión en AuthService (ya lo hace internamente)
          this.authService.saveToken(res.data.token);
          this.authService.saveUser(res.data.user);

          // 🔹 Redirección según el rol
          if (rol === 'student') {
            this.router.navigate(['/landing-alumnos']);
            this.router.navigate(['/juegos']);
          } else if (rol === 'teacher') {
            this.router.navigate(['/landing-profesores']);
          } else {
            this.router.navigate(['/dashboards']);
          }
        } else {
          alert(res.message || 'Credenciales inválidas. Inténtalo nuevamente.');
        }
      },
      error: (err) => {
        console.error('Error en login:', err);
        alert('Error en el inicio de sesión. Verifica tus credenciales.');
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

  forgotPassword(): void {
    const dialogRef = this.dialog.open(ForgotPasswordDialog, {
      width: '450px',
      data: { role: this.userRole },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        alert(`Se ha enviado un correo de recuperación a ${result}`);
      }
    });
  }
}

@Component({
  selector: 'forgot-password-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
  ],
  template: `
    <div class="dialog-container">
      <h2 mat-dialog-title>
        <mat-icon>lock_reset</mat-icon> Recuperar Contraseña
      </h2>
      <mat-dialog-content>
        <p>
          Ingresa tu correo electrónico y te enviaremos un enlace para
          restablecer tu contraseña.
        </p>
        <form [formGroup]="recoveryForm">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Correo Electrónico</mat-label>
            <input
              matInput
              type="email"
              formControlName="email"
              autocomplete="email"
            />
            <mat-error *ngIf="recoveryForm.get('email')?.hasError('required')">
              El correo es requerido
            </mat-error>
            <mat-error *ngIf="recoveryForm.get('email')?.hasError('email')">
              Ingresa un correo válido
            </mat-error>
          </mat-form-field>
        </form>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close>Cancelar</button>
        <button
          mat-raised-button
          [mat-dialog-close]="recoveryForm.value.email"
          [disabled]="!recoveryForm.valid"
          class="send-btn"
        >
          <mat-icon>send</mat-icon> Enviar
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [
    `
      .dialog-container {
        font-family: 'Poppins', sans-serif;
        max-width: 400px;
        padding: 24px;
      }
      h2 {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #48a3f3;
        font-weight: 600;
        margin: 0;
      }
      .full-width {
        width: 100%;
      }
      .send-btn {
        background: linear-gradient(
          135deg,
          #48a3f3 0%,
          #5bb3ff 100%
        ) !important;
        color: white !important;
        font-weight: 600 !important;
      }
      .send-btn:hover:not([disabled]) {
        box-shadow: 0 4px 12px rgba(72, 163, 243, 0.3);
      }
    `,
  ],
})
export class ForgotPasswordDialog implements OnInit {
  recoveryForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.recoveryForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }
}
