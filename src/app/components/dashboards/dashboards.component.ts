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
  gameData?: GameData;
}

interface GameData {
  // Datos del Desafío Nutrimental
  nutrimental: {
    nivelActual: number;
    puntosGanados: number;
    porcentajeAciertos: number;
    temasDebiles: string[];
    ultimoJuego: string;
  };

  // Datos del Reto 7 Días
  reto7Dias: {
    diasCompletados: number;
    alimentosPorGrupo: {
      frutas: number;
      verduras: number;
      proteinas: number;
      carbohidratos: number;
      lacteos: number;
      dulces: number;
    };
    emocionesAlComer: {
      feliz: number;
      normal: number;
      triste: number;
      estresado: number;
      ansioso: number;
    };
    caloriasDiarias: number[];
  };

  // Datos del Coach Exprés
  coachExpres: {
    etapaActual: string;
    puntajeMotivacion: number;
    respuestas: number[];
    disposicionCambio: number; // 1-5
  };

  // Datos nutricionales calculados
  macronutrientes: {
    proteinas: number;
    carbohidratos: number;
    grasas: number;
  };

  vitaminas: {
    vitaminaA: number;
    vitaminaC: number;
    calcio: number;
    hierro: number;
  };
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

  // Lista de estudiantes con datos de juegos
  students: Student[] = [
    {
      id: '1',
      nombre: 'María',
      apellido: 'García López',
      edad: 12,
      grado: '5to',
      seccion: 'A',
      talla: '1.52m',
      peso: '45kg',
      avatar: 'assets/images/avatar-maria.jpg',
      gameData: {
        nutrimental: {
          nivelActual: 5,
          puntosGanados: 450,
          porcentajeAciertos: 85,
          temasDebiles: ['Vitaminas', 'Minerales'],
          ultimoJuego: 'Hace 2 días'
        },
        reto7Dias: {
          diasCompletados: 7,
          alimentosPorGrupo: {
            frutas: 5,
            verduras: 5,
            proteinas: 4,
            carbohidratos: 6,
            lacteos: 3,
            dulces: 1
          },
          emocionesAlComer: {
            feliz: 12,
            normal: 8,
            triste: 1,
            estresado: 0,
            ansioso: 0
          },
          caloriasDiarias: [1180, 1220, 1150, 1280, 1100, 1240, 1190]
        },
        coachExpres: {
          etapaActual: 'Acción',
          puntajeMotivacion: 4.2,
          respuestas: [4, 5, 4, 4, 3, 5, 4, 4],
          disposicionCambio: 4
        },
        macronutrientes: {
          proteinas: 30,
          carbohidratos: 50,
          grasas: 20
        },
        vitaminas: {
          vitaminaA: 85,
          vitaminaC: 90,
          calcio: 75,
          hierro: 80
        }
      }
    },
    {
      id: '2',
      nombre: 'Carlos',
      apellido: 'Mendoza Silva',
      edad: 13,
      grado: '5to',
      seccion: 'A',
      talla: '1.58m',
      peso: '52kg',
      gameData: {
        nutrimental: {
          nivelActual: 3,
          puntosGanados: 280,
          porcentajeAciertos: 65,
          temasDebiles: ['Grupos Alimenticios', 'Porciones'],
          ultimoJuego: 'Hace 1 día'
        },
        reto7Dias: {
          diasCompletados: 5,
          alimentosPorGrupo: {
            frutas: 3,
            verduras: 2,
            proteinas: 5,
            carbohidratos: 8,
            lacteos: 2,
            dulces: 3
          },
          emocionesAlComer: {
            feliz: 8,
            normal: 6,
            triste: 2,
            estresado: 3,
            ansioso: 1
          },
          caloriasDiarias: [1350, 1480, 1290, 1520, 1400, 0, 0]
        },
        coachExpres: {
          etapaActual: 'Contemplación',
          puntajeMotivacion: 3.1,
          respuestas: [3, 3, 2, 4, 3, 3, 2, 3],
          disposicionCambio: 3
        },
        macronutrientes: {
          proteinas: 25,
          carbohidratos: 55,
          grasas: 20
        },
        vitaminas: {
          vitaminaA: 60,
          vitaminaC: 65,
          calcio: 70,
          hierro: 68
        }
      }
    },
    {
      id: '3',
      nombre: 'Ana',
      apellido: 'Rodríguez Torres',
      edad: 12,
      grado: '5to',
      seccion: 'B',
      talla: '1.50m',
      peso: '43kg',
      gameData: {
        nutrimental: {
          nivelActual: 7,
          puntosGanados: 620,
          porcentajeAciertos: 92,
          temasDebiles: [],
          ultimoJuego: 'Hace 3 horas'
        },
        reto7Dias: {
          diasCompletados: 7,
          alimentosPorGrupo: {
            frutas: 6,
            verduras: 6,
            proteinas: 5,
            carbohidratos: 5,
            lacteos: 4,
            dulces: 0
          },
          emocionesAlComer: {
            feliz: 15,
            normal: 6,
            triste: 0,
            estresado: 0,
            ansioso: 0
          },
          caloriasDiarias: [1200, 1180, 1220, 1190, 1210, 1200, 1205]
        },
        coachExpres: {
          etapaActual: 'Mantenimiento',
          puntajeMotivacion: 4.8,
          respuestas: [5, 5, 5, 4, 5, 5, 5, 4],
          disposicionCambio: 5
        },
        macronutrientes: {
          proteinas: 28,
          carbohidratos: 52,
          grasas: 20
        },
        vitaminas: {
          vitaminaA: 95,
          vitaminaC: 98,
          calcio: 92,
          hierro: 90
        }
      }
    },
    {
      id: '4',
      nombre: 'Luis',
      apellido: 'Torres Ramírez',
      edad: 14,
      grado: '6to',
      seccion: 'A',
      talla: '1.65m',
      peso: '58kg',
      gameData: {
        nutrimental: {
          nivelActual: 2,
          puntosGanados: 180,
          porcentajeAciertos: 55,
          temasDebiles: ['Nutrición', 'Calorías', 'Vitaminas'],
          ultimoJuego: 'Hace 5 días'
        },
        reto7Dias: {
          diasCompletados: 3,
          alimentosPorGrupo: {
            frutas: 2,
            verduras: 1,
            proteinas: 6,
            carbohidratos: 9,
            lacteos: 1,
            dulces: 4
          },
          emocionesAlComer: {
            feliz: 5,
            normal: 7,
            triste: 3,
            estresado: 4,
            ansioso: 2
          },
          caloriasDiarias: [1520, 1680, 1450, 0, 0, 0, 0]
        },
        coachExpres: {
          etapaActual: 'Pre-contemplación',
          puntajeMotivacion: 2.3,
          respuestas: [2, 2, 3, 2, 2, 3, 2, 2],
          disposicionCambio: 2
        },
        macronutrientes: {
          proteinas: 22,
          carbohidratos: 58,
          grasas: 20
        },
        vitaminas: {
          vitaminaA: 45,
          vitaminaC: 50,
          calcio: 55,
          hierro: 52
        }
      }
    },
    {
      id: '5',
      nombre: 'Sofia',
      apellido: 'Vargas Flores',
      edad: 13,
      grado: '6to',
      seccion: 'B',
      talla: '1.55m',
      peso: '48kg',
      gameData: {
        nutrimental: {
          nivelActual: 6,
          puntosGanados: 530,
          porcentajeAciertos: 88,
          temasDebiles: ['Porciones'],
          ultimoJuego: 'Hace 1 día'
        },
        reto7Dias: {
          diasCompletados: 7,
          alimentosPorGrupo: {
            frutas: 5,
            verduras: 4,
            proteinas: 4,
            carbohidratos: 6,
            lacteos: 3,
            dulces: 2
          },
          emocionesAlComer: {
            feliz: 11,
            normal: 9,
            triste: 1,
            estresado: 0,
            ansioso: 0
          },
          caloriasDiarias: [1210, 1190, 1230, 1200, 1250, 1180, 1220]
        },
        coachExpres: {
          etapaActual: 'Acción',
          puntajeMotivacion: 4.0,
          respuestas: [4, 4, 4, 4, 3, 4, 5, 4],
          disposicionCambio: 4
        },
        macronutrientes: {
          proteinas: 29,
          carbohidratos: 51,
          grasas: 20
        },
        vitaminas: {
          vitaminaA: 82,
          vitaminaC: 85,
          calcio: 80,
          hierro: 78
        }
      }
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
    if (!this.selectedStudent || !this.selectedStudent.gameData) return;

    const data = this.selectedStudent.gameData;
    const student = this.selectedStudent;

    console.log('Generando reporte con datos de juegos:', data);

    // Crear resumen del reporte
    const resumen = `
REPORTE NUTRICIONAL - ${student.nombre} ${student.apellido}
=========================================================

DATOS GENERALES:
- Edad: ${student.edad} años
- Grado: ${student.grado} - Sección ${student.seccion}
- Talla: ${student.talla} | Peso: ${student.peso}

RESULTADOS DE JUEGOS:
---------------------

1. DESAFÍO NUTRIMENTAL (Test de Conocimientos):
   - Nivel alcanzado: ${data.nutrimental.nivelActual}/10
   - Puntos ganados: ${data.nutrimental.puntosGanados}
   - Porcentaje de aciertos: ${data.nutrimental.porcentajeAciertos}%
   - Temas a reforzar: ${data.nutrimental.temasDebiles.join(', ') || 'Ninguno'}
   - Último juego: ${data.nutrimental.ultimoJuego}

2. RETO 7 DÍAS (Registro Alimenticio):
   - Días completados: ${data.reto7Dias.diasCompletados}/7
   - Consumo por grupo:
     * Frutas: ${data.reto7Dias.alimentosPorGrupo.frutas}
     * Verduras: ${data.reto7Dias.alimentosPorGrupo.verduras}
     * Proteínas: ${data.reto7Dias.alimentosPorGrupo.proteinas}
     * Carbohidratos: ${data.reto7Dias.alimentosPorGrupo.carbohidratos}
     * Lácteos: ${data.reto7Dias.alimentosPorGrupo.lacteos}
     * Dulces: ${data.reto7Dias.alimentosPorGrupo.dulces}
   - Promedio calorías: ${Math.round(data.reto7Dias.caloriasDiarias.reduce((a,b) => a+b, 0) / data.reto7Dias.diasCompletados)} kcal/día

3. COACH EXPRÉS (Evaluación Psicológica):
   - Etapa de cambio actual: ${data.coachExpres.etapaActual}
   - Puntuación motivación: ${data.coachExpres.puntajeMotivacion}/5
   - Disposición al cambio: ${data.coachExpres.disposicionCambio}/5

ANÁLISIS NUTRICIONAL:
--------------------
- Distribución de macronutrientes:
  * Proteínas: ${data.macronutrientes.proteinas}%
  * Carbohidratos: ${data.macronutrientes.carbohidratos}%
  * Grasas: ${data.macronutrientes.grasas}%

- Concentración de vitaminas/minerales:
  * Vitamina A: ${data.vitaminas.vitaminaA}%
  * Vitamina C: ${data.vitaminas.vitaminaC}%
  * Calcio: ${data.vitaminas.calcio}%
  * Hierro: ${data.vitaminas.hierro}%

RECOMENDACIONES:
---------------
${this.generarRecomendaciones(data)}
    `;

    alert(`Generando reporte PDF de ${student.nombre} ${student.apellido}...\n\n${resumen}`);

    // En producción, aquí se generaría el PDF con una librería como jsPDF
    setTimeout(() => {
      alert('Reporte descargado exitosamente');
    }, 1000);
  }

  generarRecomendaciones(data: GameData): string {
    const recomendaciones: string[] = [];

    // Basado en Desafío Nutrimental
    if (data.nutrimental.porcentajeAciertos < 70) {
      recomendaciones.push('- Reforzar conocimientos nutricionales básicos');
    }
    if (data.nutrimental.temasDebiles.length > 0) {
      recomendaciones.push(`- Estudiar más sobre: ${data.nutrimental.temasDebiles.join(', ')}`);
    }

    // Basado en Reto 7 Días
    if (data.reto7Dias.alimentosPorGrupo.frutas < 3) {
      recomendaciones.push('- Aumentar consumo de frutas (mínimo 3 porciones/día)');
    }
    if (data.reto7Dias.alimentosPorGrupo.verduras < 3) {
      recomendaciones.push('- Incrementar consumo de verduras');
    }
    if (data.reto7Dias.alimentosPorGrupo.dulces > 2) {
      recomendaciones.push('- Reducir consumo de dulces y azúcares añadidos');
    }

    // Basado en Coach Exprés
    if (data.coachExpres.etapaActual === 'Pre-contemplación') {
      recomendaciones.push('- Trabajar en la concientización sobre hábitos saludables');
    }
    if (data.coachExpres.disposicionCambio < 3) {
      recomendaciones.push('- Motivar y acompañar en el proceso de cambio');
    }

    // Basado en macronutrientes
    if (data.macronutrientes.proteinas < 25) {
      recomendaciones.push('- Aumentar consumo de proteínas');
    }
    if (data.macronutrientes.carbohidratos > 55) {
      recomendaciones.push('- Balancear consumo de carbohidratos');
    }

    return recomendaciones.length > 0 ? recomendaciones.join('\n') : '- El estudiante mantiene buenos hábitos alimenticios. Continuar con el seguimiento.';
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
    return student.avatar || 'assets/images/maria   .png';
  }

  onAvatarError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.style.display = 'none';
  }

  // Calcular segmentos del gráfico de dona
  getCircleSegment(percentage: number): number {
    return (percentage / 100) * 377; // 377 es la circunferencia aproximada
  }

  // Obtener datos para tabla de frutas y verduras
  getFrutasVerdurasData(): any[] {
    if (!this.selectedStudent?.gameData) return [];

    const data = this.selectedStudent.gameData.reto7Dias.alimentosPorGrupo;
    return [
      { value: data.frutas, color: 'green' },
      { value: data.verduras, color: 'green' },
      { value: data.lacteos, color: 'yellow' },
      { value: data.dulces, color: 'red' }
    ];
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
