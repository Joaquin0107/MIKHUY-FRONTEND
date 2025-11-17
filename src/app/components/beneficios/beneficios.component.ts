import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
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
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import {
  MatDialogModule,
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { BeneficioService } from '../../services/beneficio.service';
import { CanjeService } from '../../services/canje.service';
import { StudentService } from '../../services/student.service';
import { Beneficio, CanjeRequest } from '../../models/beneficio.model';
import { ApiResponse } from '../../services/student.service';

@Component({
  selector: 'app-beneficios',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatBadgeModule,
    MatMenuModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './beneficios.component.html',
  styleUrls: ['./beneficios.component.css'],
})
export class BeneficiosComponent implements OnInit, OnDestroy {
  notificationCount = 0;
  studentPoints = 0;
  searchQuery = '';
  isLoading = false;

  beneficios: Beneficio[] = [];
  filteredBeneficios: Beneficio[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private beneficioService: BeneficioService,
    private canjeService: CanjeService,
    private studentService: StudentService
  ) {}

  ngOnInit(): void {
    this.loadEstudianteData();
    this.loadBeneficios();
    this.subscribeToPoints();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Suscribirse a cambios en puntos
   */
  subscribeToPoints(): void {
    this.studentService.puntos$
      .pipe(takeUntil(this.destroy$))
      .subscribe((puntos) => {
        this.studentPoints = puntos;
      });
  }

  /**
   * Cargar datos del estudiante
   */
  loadEstudianteData(): void {
    this.studentService
      .getMisPuntos()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: ApiResponse<number>) => {
          this.studentService.actualizarPuntos(res.data ?? 0);
        },
        error: (err: any) => {
          console.error('Error actualizando puntos después del canje:', err);
        },
      });
  }

  /**
   * Cargar beneficios desde el backend
   */
  loadBeneficios(): void {
    this.isLoading = true;

    this.beneficioService
      .getDisponibles()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (beneficios) => {
          this.beneficios = beneficios;
          this.filteredBeneficios = [...beneficios];
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error cargando beneficios:', error);
          this.showMessage('Error al cargar beneficios', 'error');
          this.isLoading = false;
        },
      });
  }

  /**
   * Buscar beneficios por nombre o categoría
   */
  searchBeneficios(): void {
    if (!this.searchQuery.trim()) {
      this.filteredBeneficios = [...this.beneficios];
    } else {
      const query = this.searchQuery.toLowerCase();
      this.filteredBeneficios = this.beneficios.filter(
        (b) =>
          b.nombre.toLowerCase().includes(query) ||
          b.categoria.toLowerCase().includes(query)
      );
    }
  }

  /**
   * Abrir diálogo de canje
   */
  canjearBeneficio(beneficio: Beneficio): void {
    if (!this.canCanjear(beneficio)) {
      this.showMessage(
        `Necesitas ${beneficio.puntosRequeridos} pts. Tienes ${this.studentPoints} pts`,
        'warning'
      );
      return;
    }

    const dialogRef = this.dialog.open(CanjeDialog, {
      width: '450px',
      data: { beneficio, puntosDisponibles: this.studentPoints },
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        if (result) {
          this.procesarCanje(beneficio, result.cantidad);
        }
      });
  }

  /**
   * Procesar el canje en el backend
   */
  procesarCanje(beneficio: Beneficio, cantidad: number): void {
    const request: CanjeRequest = {
      beneficioId: beneficio.id,
      cantidad: cantidad,
    };

    this.isLoading = true;

    this.canjeService
      .realizarCanje(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (canje) => {
          this.showMessage(
            `¡Canje exitoso! Has canjeado ${cantidad} ${beneficio.nombre}`,
            'success'
          );

          // Recargar puntos y beneficios
          this.studentService
            .getMisPuntos()
            .pipe(takeUntil(this.destroy$))
            .subscribe();

          this.loadBeneficios();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error realizando canje:', error);
          const mensaje = error.error?.message || 'Error al realizar el canje';
          this.showMessage(mensaje, 'error');
          this.isLoading = false;
        },
      });
  }

  /**
   * Verificar si se puede canjear
   */
  canCanjear(beneficio: Beneficio): boolean {
    return (
      this.studentPoints >= beneficio.puntosRequeridos &&
      beneficio.stock > 0 &&
      beneficio.disponible
    );
  }

  /**
   * Mostrar mensaje con SnackBar
   */
  showMessage(message: string, type: 'success' | 'error' | 'warning'): void {
    const panelClass =
      type === 'success'
        ? 'snackbar-success'
        : type === 'error'
        ? 'snackbar-error'
        : 'snackbar-warning';

    this.snackBar.open(message, 'Cerrar', {
      duration: 4000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: [panelClass],
    });
  }

  goBack(): void {
    this.router.navigate(['/landing-alumnos']);
  }

  navigateToGames(): void {
    this.router.navigate(['/juegos']);
  }

  navigateToChatbot(): void {
    this.router.navigate(['/chatbot']);
  }

  openProfile(): void {
    this.router.navigate(['/perfil']);
  }

  logout(): void {
    sessionStorage.clear();
    this.router.navigate(['/']);
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = 'assets/images/placeholder-beneficio.jpg';
  }
}

// ============================================
// Diálogo de Canje
// ============================================
@Component({
  selector: 'canje-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
  ],
  template: `
    <div class="canje-dialog">
      <div class="dialog-header">
        <h2>{{ data.beneficio.nombre }}</h2>
        <span class="tag-badge">{{ data.beneficio.categoria }}</span>
      </div>

      <div class="dialog-image">
        <img [src]="data.beneficio.imagenUrl" [alt]="data.beneficio.nombre" />
      </div>

      <div class="dialog-content">
        <div class="puntos-section">
          <span class="puntos-label">Costo</span>
          <span class="puntos-value"
            >{{ data.beneficio.puntosRequeridos }} pts</span
          >
        </div>

        <form [formGroup]="canjeForm">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Cantidad</mat-label>
            <mat-select formControlName="cantidad">
              <mat-option
                *ngFor="let cant of cantidadesDisponibles"
                [value]="cant"
              >
                {{ cant }} unidad{{ cant > 1 ? 'es' : '' }} ({{
                  cant * data.beneficio.puntosRequeridos
                }}
                pts)
              </mat-option>
            </mat-select>
          </mat-form-field>
        </form>

        <div class="descripcion-section">
          <h3>Dato</h3>
          <p>{{ data.beneficio.descripcion }}</p>
        </div>

        <div class="resumen-canje">
          <div class="resumen-row">
            <span>Puntos actuales:</span>
            <strong>{{ data.puntosDisponibles }} pts</strong>
          </div>
          <div class="resumen-row">
            <span>Total a descontar:</span>
            <strong class="descuento">-{{ totalPuntos }} pts</strong>
          </div>
          <div class="resumen-row total">
            <span>Puntos restantes:</span>
            <strong>{{ puntosRestantes }} pts</strong>
          </div>
        </div>
      </div>

      <div class="dialog-actions">
        <button mat-button (click)="cancelar()">Cancelar</button>
        <button
          mat-raised-button
          class="canjear-btn"
          [disabled]="!canjeForm.valid || puntosRestantes < 0"
          (click)="confirmar()"
        >
          <mat-icon>shopping_cart</mat-icon>
          Canjear
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .canje-dialog {
        font-family: 'Poppins', sans-serif;
      }

      .dialog-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        border-bottom: 1px solid #e0e0e0;
      }

      .dialog-header h2 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 700;
        color: #333;
      }

      .tag-badge {
        background: #48a3f3;
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 20px;
        font-size: 0.85rem;
        font-weight: 600;
      }

      .dialog-image {
        width: 100%;
        height: 200px;
        overflow: hidden;
        background: #f5f5f5;
      }

      .dialog-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .dialog-content {
        padding: 1.5rem;
      }

      .puntos-section {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        background: #f8f9fa;
        border-radius: 8px;
        margin-bottom: 1.5rem;
      }

      .puntos-label {
        font-size: 0.9rem;
        color: #666;
      }

      .puntos-value {
        font-size: 1.5rem;
        font-weight: 700;
        color: #ffd700;
      }

      .full-width {
        width: 100%;
        margin-bottom: 1rem;
      }

      .descripcion-section {
        margin-top: 1.5rem;
      }

      .descripcion-section h3 {
        font-size: 1rem;
        font-weight: 600;
        color: #333;
        margin-bottom: 0.5rem;
      }

      .descripcion-section p {
        font-size: 0.9rem;
        color: #666;
        line-height: 1.6;
        text-align: justify;
      }

      .resumen-canje {
        margin-top: 1.5rem;
        padding: 1rem;
        background: #f0f7ff;
        border-radius: 8px;
        border-left: 4px solid #48a3f3;
      }

      .resumen-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
        font-size: 0.95rem;
      }

      .resumen-row.total {
        margin-top: 0.5rem;
        padding-top: 0.5rem;
        border-top: 2px solid #48a3f3;
        font-size: 1.1rem;
      }

      .descuento {
        color: #f44336;
      }

      .dialog-actions {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        padding: 1rem 1.5rem;
        border-top: 1px solid #e0e0e0;
      }

      .canjear-btn {
        background: linear-gradient(
          135deg,
          #48a3f3 0%,
          #5bb3ff 100%
        ) !important;
        color: white !important;
        font-weight: 600 !important;
      }

      .canjear-btn mat-icon {
        margin-right: 0.5rem;
      }

      .canjear-btn:hover:not([disabled]) {
        box-shadow: 0 4px 12px rgba(72, 163, 243, 0.3);
      }
    `,
  ],
})
export class CanjeDialog implements OnInit {
  canjeForm!: FormGroup;
  cantidadesDisponibles: number[] = [];
  totalPuntos: number = 0;
  puntosRestantes: number = 0;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CanjeDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    const maxPorStock = this.data.beneficio.stock || 1;
    const maxPorPuntos = Math.floor(
      this.data.puntosDisponibles / this.data.beneficio.puntosRequeridos
    );
    const maxCantidad = Math.min(maxPorStock, maxPorPuntos, 5);

    this.cantidadesDisponibles = Array.from(
      { length: maxCantidad },
      (_, i) => i + 1
    );

    this.canjeForm = this.fb.group({
      cantidad: [1, Validators.required],
    });

    this.canjeForm.get('cantidad')?.valueChanges.subscribe((cantidad) => {
      this.calcularTotales(cantidad);
    });

    this.calcularTotales(1);
  }

  calcularTotales(cantidad: number): void {
    this.totalPuntos = this.data.beneficio.puntosRequeridos * cantidad;
    this.puntosRestantes = this.data.puntosDisponibles - this.totalPuntos;
  }

  confirmar(): void {
    if (this.canjeForm.valid) {
      this.dialogRef.close(this.canjeForm.value);
    }
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}
