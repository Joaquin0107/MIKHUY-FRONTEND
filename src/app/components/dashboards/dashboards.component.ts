import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

interface Student {
  id: string;
  nombre: string;
  apellido: string;
  edad: number;
  grado: string;
  seccion: string;
  talla: string;
  peso: string;
  avatar?: string;
}

@Component({
  selector: 'app-dashboards',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatBadgeModule,
    MatMenuModule,
    MatListModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule
  ],
  templateUrl: './dashboards.component.html',
  styleUrls: ['./dashboards.component.css']
})
export class DashboardsComponent implements OnInit {
  
  notificationCount = 5;
  searchQuery = '';
  selectedStudent: Student | null = null;

  // Lista de estudiantes
  students: Student[] = [
    {
      id: '1',
      nombre: 'María',
      apellido: 'García López',
      edad: 12,
      grado: '5to',
      seccion: 'A',
      talla: 'X',
      peso: 'X',
      avatar: 'assets/images/avatar-maria.jpg'
    },
    {
      id: '2',
      nombre: 'Carlos',
      apellido: 'Mendoza Silva',
      edad: 13,
      grado: '5to',
      seccion: 'A',
      talla: 'X',
      peso: 'X'
    },
    {
      id: '3',
      nombre: 'Ana',
      apellido: 'Rodríguez Torres',
      edad: 12,
      grado: '5to',
      seccion: 'B',
      talla: 'X',
      peso: 'X'
    },
    {
      id: '4',
      nombre: 'Luis',
      apellido: 'Torres Ramírez',
      edad: 14,
      grado: '6to',
      seccion: 'A',
      talla: 'X',
      peso: 'X'
    },
    {
      id: '5',
      nombre: 'Sofia',
      apellido: 'Vargas Flores',
      edad: 13,
      grado: '6to',
      seccion: 'B',
      talla: 'X',
      peso: 'X'
    }
  ];

  filteredStudents: Student[] = [];

  constructor(
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.filteredStudents = [...this.students];
    // Seleccionar primer estudiante por defecto
    if (this.students.length > 0) {
      this.selectStudent(this.students[0]);
    }
  }

  searchStudents(): void {
    if (!this.searchQuery.trim()) {
      this.filteredStudents = [...this.students];
    } else {
      this.filteredStudents = this.students.filter(s => 
        `${s.nombre} ${s.apellido}`.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        s.grado.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
  }

  selectStudent(student: Student): void {
    this.selectedStudent = student;
  }

  descargarReporte(): void {
    if (!this.selectedStudent) return;
    
    console.log('Descargando reporte de:', this.selectedStudent.nombre);
    alert(`Generando reporte PDF de ${this.selectedStudent.nombre} ${this.selectedStudent.apellido}...`);
    
    // En producción, aquí se generaría el PDF
    // Simulación de descarga
    setTimeout(() => {
      alert('Reporte descargado exitosamente');
    }, 1000);
  }

  enviarCorreo(): void {
    if (!this.selectedStudent) return;

    const dialogRef = this.dialog.open(EmailDialog, {
      width: '500px',
      data: { student: this.selectedStudent }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Enviando correo a:', result);
        alert(`Correo enviado exitosamente a ${result.email}`);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/landing-profesores']);
  }

  openProfile(): void {
    this.router.navigate(['/perfil']);
  }

  logout(): void {
    sessionStorage.clear();
    console.log('Logout');
    this.router.navigate(['/']);
  }

  getAvatarUrl(student: Student): string {
    return student.avatar || 'assets/images/default-avatar.png';
  }

  onAvatarError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.style.display = 'none';
  }
}

// ============================================
// Email Dialog Component
// ============================================
import { Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'email-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule
  ],
  template: `
    <div class="email-dialog">
      <h2 mat-dialog-title>
        <mat-icon>email</mat-icon>
        Enviar Reporte por Correo
      </h2>
      
      <mat-dialog-content>
        <p class="student-info">
          Reporte de: <strong>{{data.student.nombre}} {{data.student.apellido}}</strong>
        </p>
        
        <form [formGroup]="emailForm">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Correo del destinatario</mat-label>
            <input matInput 
                   type="email" 
                   placeholder="padre@ejemplo.com"
                   formControlName="email">
            <mat-icon matPrefix>email</mat-icon>
            <mat-error *ngIf="emailForm.get('email')?.hasError('required')">
              El correo es requerido
            </mat-error>
            <mat-error *ngIf="emailForm.get('email')?.hasError('email')">
              Ingresa un correo válido
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Asunto</mat-label>
            <input matInput 
                   formControlName="subject">
            <mat-icon matPrefix>subject</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Mensaje (opcional)</mat-label>
            <textarea matInput 
                      rows="4"
                      formControlName="message"
                      placeholder="Agregue un mensaje personalizado..."></textarea>
          </mat-form-field>
        </form>

        <div class="attach-info">
          <mat-icon>attach_file</mat-icon>
          <span>Se adjuntará el reporte en PDF</span>
        </div>
      </mat-dialog-content>
      
      <mat-dialog-actions align="end">
        <button mat-button (click)="cancelar()">Cancelar</button>
        <button mat-raised-button 
                color="primary"
                [disabled]="!emailForm.valid"
                (click)="enviar()">
          <mat-icon>send</mat-icon>
          Enviar
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .email-dialog {
      font-family: 'Poppins', sans-serif;
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

    .student-info {
      color: #666;
      margin-bottom: 1.5rem;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .full-width {
      width: 100%;
      margin-bottom: 1rem;
    }

    .attach-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem;
      background: #e3f2fd;
      border-radius: 8px;
      font-size: 0.9rem;
      color: #666;
    }

    .attach-info mat-icon {
      color: #48A3F3;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    mat-dialog-content {
      padding: 1rem 0;
      overflow: visible;
    }

    mat-dialog-actions {
      padding: 1rem 0 0;
    }

    mat-dialog-actions button mat-icon {
      margin-right: 0.5rem;
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
  `]
})
export class EmailDialog implements OnInit {
  emailForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EmailDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      subject: [`Reporte Nutricional - ${this.data.student.nombre} ${this.data.student.apellido}`, Validators.required],
      message: ['']
    });
  }

  enviar(): void {
    if (this.emailForm.valid) {
      this.dialogRef.close(this.emailForm.value);
    }
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}