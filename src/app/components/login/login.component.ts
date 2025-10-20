import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialogModule, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
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
    MatSlideToggleModule,
    MatDialogModule
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
    private route: ActivatedRoute,
    private dialog: MatDialog
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
      
      // MODO DESARROLLO - Sin backend
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
    // Abrir diálogo para recuperar contraseña
    const dialogRef = this.dialog.open(ForgotPasswordDialog, {
      width: '450px',
      data: { role: this.userRole }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Email para recuperación:', result);
        alert(`Se ha enviado un correo de recuperación a ${result}`);
      }
    });
  }

  goToRegister(): void {
    this.router.navigate(['/registro'], { queryParams: { role: this.userRole } });
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
    MatIconModule
  ],
  template: `
    <div class="dialog-container">
      <h2 mat-dialog-title>
        <mat-icon>lock_reset</mat-icon>
        Recuperar Contraseña
      </h2>
      
      <mat-dialog-content>
        <p class="dialog-description">
          Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
        </p>
        
        <form [formGroup]="recoveryForm">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Correo Electrónico</mat-label>
            <input matInput 
                   type="email" 
                   placeholder="ejemplo@correo.com"
                   formControlName="email"
                   autocomplete="email">
            <mat-icon matPrefix>email</mat-icon>
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
        <button mat-raised-button 
                [mat-dialog-close]="recoveryForm.value.email"
                [disabled]="!recoveryForm.valid"
                class="send-btn">
          <mat-icon>send</mat-icon>
          Enviar
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-container {
      font-family: 'Poppins', sans-serif;
      max-width: 400px;
      padding: 24px;
    }

    h2 {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #48A3F3;
      font-weight: 600;
      margin: 0;
    }

    h2 mat-icon {
      color: #48A3F3;
    }

    .dialog-description {
      color: #666;
      line-height: 1.6;
      margin-bottom: 1.5rem;
    }

    .full-width {
      width: 100%;
    }

    .send-btn {
      background: linear-gradient(135deg, #48A3F3 0%, #5bb3ff 100%) !important;
      color: white !important;
      font-weight: 600 !important;
    }

    .send-btn mat-icon {
      margin-right: 0.5rem;
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .send-btn:hover:not([disabled]) {
      box-shadow: 0 4px 12px rgba(72, 163, 243, 0.3);
    }

    mat-dialog-content {
      padding: 1rem 0;
    }

    mat-dialog-actions {
      padding: 1rem 0 0;
    }
  `]
})
export class ForgotPasswordDialog implements OnInit {
  recoveryForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.recoveryForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }
}