import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';

interface Beneficio {
  id: string;
  nombre: string;
  puntos: number;
  imagen: string;
  descripcion: string;
  categoria: string;
  stock?: number;
}

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
    MatDialogModule
  ],
  templateUrl: './beneficios.component.html',
  styleUrls: ['./beneficios.component.css']
})
export class BeneficiosComponent implements OnInit {
  
  notificationCount = 0;
  studentPoints = 1250;
  searchQuery = '';

  beneficios: Beneficio[] = [
    {
      id: 'manzana',
      nombre: 'Manzana',
      puntos: 15,
      imagen: 'assets/images/beneficio-manzana.jpg',
      descripcion: 'Esta fruta es beneficiosa porque es una buena fuente de fibra, lo que ayuda a la digestión y a mantener la sensación de saciedad. También contiene vitaminas y antioxidantes que fortalecen el sistema inmunológico y reducen el riesgo de enfermedades.',
      categoria: 'Fruta',
      stock: 10
    },
    {
      id: 'agua',
      nombre: 'Agua',
      puntos: 20,
      imagen: 'assets/images/beneficio-agua.jpg',
      descripcion: 'El agua es esencial para mantener el cuerpo hidratado, regular la temperatura corporal y transportar nutrientes. Beber suficiente agua ayuda a mejorar la concentración y el rendimiento físico.',
      categoria: 'Bebida',
      stock: 20
    },
    {
      id: 'manzana-agua',
      nombre: 'Manzana + Agua',
      puntos: 25,
      imagen: 'assets/images/beneficio-combo1.jpg',
      descripcion: 'Combo perfecto para mantenerte hidratado y con energía. La manzana aporta fibra y vitaminas, mientras el agua te mantiene hidratado durante todo el día.',
      categoria: 'Combo',
      stock: 15
    },
    {
      id: 'manzana-uva-refresco',
      nombre: 'Manzana + Uva + Refresco',
      puntos: 45,
      imagen: 'assets/images/beneficio-combo2.jpg',
      descripcion: 'Combo completo que combina frutas frescas con una bebida refrescante. Ideal para el recreo.',
      categoria: 'Combo',
      stock: 8
    },
    {
      id: 'mango-frutas-agua',
      nombre: 'Mango + Frutos + Agua',
      puntos: 35,
      imagen: 'assets/images/beneficio-combo3.jpg',
      descripcion: 'Mix tropical con mango, frutos secos y agua. Rico en vitaminas, minerales y antioxidantes.',
      categoria: 'Combo',
      stock: 12
    },
    {
      id: 'ensalada-frutas',
      nombre: 'Ensalada de Frutas',
      puntos: 80,
      imagen: 'assets/images/beneficio-ensalada-frutas.jpg',
      descripcion: 'Deliciosa mezcla de frutas frescas de temporada. Rica en vitaminas, fibra y antioxidantes.',
      categoria: 'Ensalada',
      stock: 6
    },
    {
      id: 'ensalada-fresca',
      nombre: 'Ensalada Fresca',
      puntos: 85,
      imagen: 'assets/images/beneficio-ensalada-verde.jpg',
      descripcion: 'Ensalada verde con vegetales frescos, tomate y aderezo ligero. Perfecta para un almuerzo saludable.',
      categoria: 'Ensalada',
      stock: 5
    },
    {
      id: 'chaufa-quinoa',
      nombre: 'Chaufa de Quinoa',
      puntos: 115,
      imagen: 'assets/images/beneficio-chaufa.jpg',
      descripcion: 'Arroz chaufa preparado con quinoa, vegetales y proteína. Alto en proteínas y bajo en grasas.',
      categoria: 'Plato Principal',
      stock: 4
    },
    {
      id: 'almuerzo-mix',
      nombre: 'Almuerzo mix',
      puntos: 150,
      imagen: 'assets/images/beneficio-almuerzo.jpg',
      descripcion: 'Plato completo con proteína, carbohidratos complejos y vegetales. Balanceado nutricionalmente.',
      categoria: 'Plato Principal',
      stock: 3
    },
    {
      id: 'menu-completo',
      nombre: 'Menú Completo',
      puntos: 200,
      imagen: 'assets/images/beneficio-menu.jpg',
      descripcion: 'Menú completo con entrada, plato principal, ensalada y bebida. La mejor opción para un almuerzo nutritivo.',
      categoria: 'Menú',
      stock: 2
    }
  ];

  filteredBeneficios: Beneficio[] = [];

  constructor(
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.filteredBeneficios = [...this.beneficios];
    this.loadPoints();
  }

  loadPoints(): void {
    const savedPoints = sessionStorage.getItem('studentPoints');
    if (savedPoints) {
      this.studentPoints = parseInt(savedPoints);
    }
  }

  searchBeneficios(): void {
    if (!this.searchQuery.trim()) {
      this.filteredBeneficios = [...this.beneficios];
    } else {
      this.filteredBeneficios = this.beneficios.filter(b => 
        b.nombre.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        b.categoria.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
  }

  canjearBeneficio(beneficio: Beneficio): void {
    if (this.studentPoints >= beneficio.puntos) {
      const dialogRef = this.dialog.open(CanjeDialog, {
        width: '450px',
        data: { beneficio, puntosDisponibles: this.studentPoints }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          // Descontar puntos
          this.studentPoints -= beneficio.puntos * result.cantidad;
          sessionStorage.setItem('studentPoints', this.studentPoints.toString());
          
          // Actualizar stock
          const index = this.beneficios.findIndex(b => b.id === beneficio.id);
          if (index !== -1 && this.beneficios[index].stock) {
            this.beneficios[index].stock! -= result.cantidad;
          }

          alert(`¡Canje exitoso! Has canjeado ${result.cantidad} ${beneficio.nombre}. Quedan ${this.studentPoints} puntos.`);
        }
      });
    } else {
      alert(`No tienes suficientes puntos. Necesitas ${beneficio.puntos} pts y tienes ${this.studentPoints} pts.`);
    }
  }

  canCanjear(beneficio: Beneficio): boolean {
    return this.studentPoints >= beneficio.puntos && (beneficio.stock ?? 0) > 0;
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
    console.log('Logout');
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
    MatIconModule
  ],
  template: `
    <div class="canje-dialog">
      <div class="dialog-header">
        <h2>{{data.beneficio.nombre}}</h2>
        <span class="tag-badge">{{data.beneficio.categoria}}</span>
      </div>

      <div class="dialog-image">
        <img [src]="data.beneficio.imagen" [alt]="data.beneficio.nombre">
      </div>

      <div class="dialog-content">
        <div class="puntos-section">
          <span class="puntos-label">Costo</span>
          <span class="puntos-value">{{data.beneficio.puntos}} pts</span>
        </div>

        <form [formGroup]="canjeForm">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Cantidad</mat-label>
            <mat-select formControlName="cantidad">
              <mat-option *ngFor="let cant of cantidadesDisponibles" [value]="cant">
                {{cant}} unidad{{cant > 1 ? 'es' : ''}} ({{cant * data.beneficio.puntos}} pts)
              </mat-option>
            </mat-select>
          </mat-form-field>
        </form>

        <div class="descripcion-section">
          <h3>Dato</h3>
          <p>{{data.beneficio.descripcion}}</p>
        </div>

        <div class="resumen-canje">
          <div class="resumen-row">
            <span>Puntos actuales:</span>
            <strong>{{data.puntosDisponibles}} pts</strong>
          </div>
          <div class="resumen-row">
            <span>Total a descontar:</span>
            <strong class="descuento">-{{totalPuntos}} pts</strong>
          </div>
          <div class="resumen-row total">
            <span>Puntos restantes:</span>
            <strong>{{puntosRestantes}} pts</strong>
          </div>
        </div>
      </div>

      <div class="dialog-actions">
        <button mat-button (click)="cancelar()">Cancelar</button>
        <button mat-raised-button 
                class="canjear-btn"
                [disabled]="!canjeForm.valid || puntosRestantes < 0"
                (click)="confirmar()">
          <mat-icon>shopping_cart</mat-icon>
          Canjear
        </button>
      </div>
    </div>
  `,
  styles: [`
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
      background: #48A3F3;
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
      color: #FFD700;
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
      border-left: 4px solid #48A3F3;
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
      border-top: 2px solid #48A3F3;
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
      background: linear-gradient(135deg, #48A3F3 0%, #5bb3ff 100%) !important;
      color: white !important;
      font-weight: 600 !important;
    }

    .canjear-btn mat-icon {
      margin-right: 0.5rem;
    }

    .canjear-btn:hover:not([disabled]) {
      box-shadow: 0 4px 12px rgba(72, 163, 243, 0.3);
    }
  `]
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
    // Calcular cantidades disponibles según stock y puntos
    const maxPorStock = this.data.beneficio.stock || 1;
    const maxPorPuntos = Math.floor(this.data.puntosDisponibles / this.data.beneficio.puntos);
    const maxCantidad = Math.min(maxPorStock, maxPorPuntos, 5);

    this.cantidadesDisponibles = Array.from({length: maxCantidad}, (_, i) => i + 1);

    this.canjeForm = this.fb.group({
      cantidad: [1, Validators.required]
    });

    // Calcular totales cuando cambia la cantidad
    this.canjeForm.get('cantidad')?.valueChanges.subscribe(cantidad => {
      this.calcularTotales(cantidad);
    });

    // Cálculo inicial
    this.calcularTotales(1);
  }

  calcularTotales(cantidad: number): void {
    this.totalPuntos = this.data.beneficio.puntos * cantidad;
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