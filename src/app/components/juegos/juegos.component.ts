import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { Router } from '@angular/router';

interface Game {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  categoria: string;
  maxNiveles: number;
  nivelActual: number;
  puntosGanados: number;
}

@Component({
  selector: 'app-juegos',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDialogModule,
    MatProgressBarModule,
    MatBadgeModule,
    MatMenuModule
  ],
  templateUrl: './juegos.component.html',
  styleUrls: ['./juegos.component.css']
})
export class JuegosComponent implements OnInit {
  
  notificationCount = 0;
  studentPoints = 1250;
  
  juegos: Game[] = [
    {
      id: 'nutrimental',
      title: 'Desafío Nutrimental',
      subtitle: 'Test de conocimientos nutricionales',
      description: 'Evalúa tu conocimiento sobre nutrición, grupos alimenticios y hábitos saludables. Responde preguntas de opción múltiple mientras aprendes.',
      image: 'assets/images/desafio.png',
      categoria: 'Conocimiento',
      maxNiveles: 10,
      nivelActual: 1,
      puntosGanados: 450
    },
    {
      id: 'reto-7dias',
      title: 'Reto 7 Días',
      subtitle: 'Registro diario breve',
      description: 'Registra tus comidas diarias durante 7 días. Evalúa tu relación con la comida y patrones alimenticios para generar datos psicológico-nutricionales.',
      image: 'assets/images/reto7.png',
      categoria: 'Registro',
      maxNiveles: 10,
      nivelActual: 3,
      puntosGanados: 820
    },
    {
      id: 'coach-expres',
      title: 'Coach Exprés',
      subtitle: 'Test corto tipo "ETAPA DE CAMBIO"',
      description: 'Test psicológico basado en el modelo transteórico del cambio. Identifica tu etapa actual frente a hábitos saludables.',
      image: 'assets/images/coach.png',
      categoria: 'Psicológico',
      maxNiveles: 10,
      nivelActual: 5,
      puntosGanados: 1200
    }
  ];

  constructor(
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // Cargar progreso desde sessionStorage
    const savedProgress = sessionStorage.getItem('gamesProgress');
    if (savedProgress) {
      const progress = JSON.parse(savedProgress);
      this.juegos.forEach(juego => {
        if (progress[juego.id]) {
          juego.nivelActual = progress[juego.id].nivelActual;
          juego.puntosGanados = progress[juego.id].puntosGanados;
        }
      });
    }
  }

  verPosiciones(juego: Game): void {
    console.log('Ver posiciones de:', juego.title);
    // Aquí se abriría un modal con la tabla de posiciones
    alert('Próximamente: Tabla de posiciones');
  }

  jugar(juego: Game): void {
    // Abrir modal del juego
    const dialogRef = this.dialog.open(GamePlayDialog, {
      width: '90vw',
      maxWidth: '1200px',
      height: '85vh',
      data: juego,
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Actualizar progreso
        const juegoIndex = this.juegos.findIndex(j => j.id === juego.id);
        if (juegoIndex !== -1) {
          this.juegos[juegoIndex].nivelActual = result.nivelActual;
          this.juegos[juegoIndex].puntosGanados = result.puntosGanados;
          
          // Guardar en sessionStorage
          this.saveProgress();
        }
      }
    });
  }

  saveProgress(): void {
    const progress: any = {};
    this.juegos.forEach(juego => {
      progress[juego.id] = {
        nivelActual: juego.nivelActual,
        puntosGanados: juego.puntosGanados
      };
    });
    sessionStorage.setItem('gamesProgress', JSON.stringify(progress));
  }

  goBack(): void {
    this.router.navigate(['/landing-alumnos']);
  }

  getProgressPercent(juego: Game): number {
    return (juego.nivelActual / juego.maxNiveles) * 100;
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = 'assets/images/placeholder-game.jpg';
  }

  navigateToBenefits(): void {
    this.router.navigate(['/beneficios']);
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
}

// ============================================
// Game Play Dialog Component
// ============================================
import { Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'game-play-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDialogModule,
    MatProgressBarModule
  ],
  template: `
    <div class="game-dialog">
      <!-- Header -->
      <div class="game-header">
        <div class="game-info">
          <h2>{{gameData.title}}</h2>
          <span class="nivel-badge">Nivel {{nivelActual}}/{{gameData.maxNiveles}}</span>
        </div>
        <div class="game-stats">
          <div class="stat">
            <mat-icon>stars</mat-icon>
            <span>{{puntos}} pts</span>
          </div>
          <button mat-icon-button (click)="cerrar()">
            <mat-icon>close</mat-icon>
          </button>
        </div>
      </div>

      <!-- Level Selector -->
      <div class="level-selector">
        <button mat-icon-button 
                [disabled]="nivelActual === 1"
                (click)="cambiarNivel(nivelActual - 1)">
          <mat-icon>chevron_left</mat-icon>
        </button>
        
        <div class="levels-container">
          <button *ngFor="let nivel of niveles" 
                  mat-mini-fab
                  [class.completed]="nivel <= gameData.nivelActual"
                  [class.active]="nivel === nivelActual"
                  (click)="cambiarNivel(nivel)">
            {{nivel}}
          </button>
        </div>

        <button mat-icon-button 
                [disabled]="nivelActual === gameData.maxNiveles"
                (click)="cambiarNivel(nivelActual + 1)">
          <mat-icon>chevron_right</mat-icon>
        </button>
      </div>

      <!-- Game Content -->
      <div class="game-content">
        <mat-card class="question-card">
          <mat-card-content>
            <!-- Nutrimental Game -->
            <div *ngIf="gameData.id === 'nutrimental'" class="game-nutrimental">
              <h3>Pregunta {{preguntaActual}}/5</h3>
              <p class="pregunta">{{preguntaNutrimental.pregunta}}</p>
              <div class="opciones">
                <button *ngFor="let opcion of preguntaNutrimental.opciones; let i = index"
                        mat-raised-button
                        class="opcion-btn"
                        [class.correcta]="respuestaSeleccionada === i && i === preguntaNutrimental.correcta"
                        [class.incorrecta]="respuestaSeleccionada === i && i !== preguntaNutrimental.correcta"
                        [disabled]="respuestaSeleccionada !== null"
                        (click)="seleccionarRespuesta(i)">
                  {{opcion}}
                </button>
              </div>
              <div class="explicacion" *ngIf="respuestaSeleccionada !== null">
                <mat-icon>{{respuestaSeleccionada === preguntaNutrimental.correcta ? 'check_circle' : 'cancel'}}</mat-icon>
                <p>{{preguntaNutrimental.explicacion}}</p>
              </div>
            </div>

            <!-- Reto 7 Días Game -->
            <div *ngIf="gameData.id === 'reto-7dias'" class="game-reto7dias">
              <h3>Día {{diaActual}}/7 - {{momentoDelDia}}</h3>
              <p class="instruccion">Registra qué comiste en este momento del día:</p>
              
              <div class="registro-comida">
                <div class="alimento-item" *ngFor="let alimento of alimentosDisponibles">
                  <button mat-raised-button
                          [class.selected]="alimentosSeleccionados.includes(alimento.id)"
                          (click)="toggleAlimento(alimento.id)">
                    <mat-icon>{{alimento.icon}}</mat-icon>
                    {{alimento.nombre}}
                  </button>
                </div>
              </div>

              <div class="emociones-section">
                <p>¿Cómo te sentiste al comer?</p>
                <div class="emociones">
                  <button *ngFor="let emocion of emociones"
                          mat-mini-fab
                          [class.selected]="emocionSeleccionada === emocion.id"
                          (click)="seleccionarEmocion(emocion.id)">
                    {{emocion.emoji}}
                  </button>
                </div>
              </div>
            </div>

            <!-- Coach Exprés Game -->
            <div *ngIf="gameData.id === 'coach-expres'" class="game-coach">
              <h3>Evaluación {{preguntaActual}}/8</h3>
              <p class="pregunta-coach">{{preguntaCoach.pregunta}}</p>
              
              <div class="escala-likert">
                <div class="escala-labels">
                  <span>Totalmente en desacuerdo</span>
                  <span>Totalmente de acuerdo</span>
                </div>
                <div class="escala-opciones">
                  <button *ngFor="let valor of [1,2,3,4,5]"
                          mat-raised-button
                          [class.selected]="respuestaCoach === valor"
                          (click)="seleccionarRespuestaCoach(valor)">
                    {{valor}}
                  </button>
                </div>
              </div>

              <div class="etapa-info" *ngIf="respuestaCoach !== null">
                <mat-icon>psychology</mat-icon>
                <p>Esta pregunta evalúa: <strong>{{preguntaCoach.etapa}}</strong></p>
              </div>
            </div>
          </mat-card-content>

          <mat-card-actions>
            <button mat-button (click)="anteriorPregunta()" [disabled]="preguntaActual === 1">
              <mat-icon>arrow_back</mat-icon>
              Anterior
            </button>
            <div class="spacer"></div>
            <button mat-raised-button 
                    color="primary"
                    (click)="siguientePregunta()"
                    [disabled]="!puedeAvanzar()">
              {{preguntaActual === 5 || preguntaActual === 7 || preguntaActual === 8 ? 'Finalizar' : 'Siguiente'}}
              <mat-icon>arrow_forward</mat-icon>
            </button>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .game-dialog {
      display: flex;
      flex-direction: column;
      height: 100%;
      font-family: 'Poppins', sans-serif;
    }

    .game-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      background: linear-gradient(135deg, #48A3F3 0%, #5bb3ff 100%);
      color: white;
    }

    .game-info h2 {
      margin: 0 0 0.5rem;
      font-size: 1.5rem;
      font-weight: 700;
    }

    .nivel-badge {
      background: rgba(255, 255, 255, 0.3);
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.9rem;
      font-weight: 600;
    }

    .game-stats {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .stat {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(255, 255, 255, 0.2);
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-weight: 600;
    }

    .level-selector {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: #f8f9fa;
      border-bottom: 2px solid #e0e0e0;
    }

    .levels-container {
      display: flex;
      gap: 0.5rem;
      overflow-x: auto;
      flex: 1;
      padding: 0.5rem 0;
    }

    .levels-container button {
      min-width: 40px;
      background: white;
      color: #666;
      border: 2px solid #e0e0e0;
    }

    .levels-container button.completed {
      background: #7BC67E;
      color: white;
      border-color: #7BC67E;
    }

    .levels-container button.active {
      background: #48A3F3;
      color: white;
      border-color: #48A3F3;
      transform: scale(1.1);
    }

    .game-content {
      flex: 1;
      overflow-y: auto;
      padding: 2rem;
      background: #fafafa;
    }

    .question-card {
      max-width: 900px;
      margin: 0 auto;
    }

    .pregunta, .pregunta-coach {
      font-size: 1.3rem;
      font-weight: 600;
      color: #333;
      margin: 1rem 0 2rem;
      text-align: center;
    }

    .opciones, .alimento-item {
      display: grid;
      gap: 1rem;
      margin: 2rem 0;
    }

    .opcion-btn {
      padding: 1.5rem !important;
      text-align: left !important;
      font-size: 1rem !important;
      transition: all 0.3s !important;
    }

    .opcion-btn.correcta {
      background: #7BC67E !important;
      color: white !important;
    }

    .opcion-btn.incorrecta {
      background: #f44336 !important;
      color: white !important;
    }

    .explicacion {
      display: flex;
      gap: 1rem;
      align-items: flex-start;
      padding: 1rem;
      background: #e3f2fd;
      border-radius: 8px;
      margin-top: 1rem;
    }

    .explicacion mat-icon {
      color: #48A3F3;
    }

    .registro-comida {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 1rem;
      margin: 1.5rem 0;
    }

    .registro-comida button {
      height: 80px;
      flex-direction: column;
      gap: 0.5rem;
    }

    .registro-comida button.selected {
      background: #48A3F3 !important;
      color: white !important;
    }

    .emociones-section {
      margin-top: 2rem;
      text-align: center;
    }

    .emociones {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin-top: 1rem;
    }

    .emociones button {
      font-size: 2rem;
    }

    .emociones button.selected {
      background: #FFD700 !important;
      transform: scale(1.2);
    }

    .escala-likert {
      margin: 2rem 0;
    }

    .escala-labels {
      display: flex;
      justify-content: space-between;
      margin-bottom: 1rem;
      font-size: 0.9rem;
      color: #666;
    }

    .escala-opciones {
      display: flex;
      justify-content: center;
      gap: 1rem;
    }

    .escala-opciones button {
      min-width: 60px;
      height: 60px;
      font-size: 1.5rem;
      font-weight: 700;
    }

    .escala-opciones button.selected {
      background: #48A3F3 !important;
      color: white !important;
      transform: scale(1.1);
    }

    .etapa-info {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: #f3e5f5;
      border-radius: 8px;
      margin-top: 1rem;
    }

    .etapa-info mat-icon {
      color: #9C27B0;
    }

    mat-card-actions {
      display: flex;
      padding: 1rem;
      border-top: 1px solid #e0e0e0;
    }

    .spacer {
      flex: 1;
    }

    @media (max-width: 768px) {
      .game-header {
        flex-direction: column;
        gap: 1rem;
      }

      .escala-labels span {
        font-size: 0.75rem;
      }

      .escala-opciones button {
        min-width: 50px;
        height: 50px;
      }
    }
  `]
})
export class GamePlayDialog implements OnInit {
  gameData: Game;
  nivelActual: number = 1;
  niveles: number[] = [];
  puntos: number = 0;
  preguntaActual: number = 1;
  respuestaSeleccionada: number | null = null;
  
  // Variables específicas por juego
  diaActual: number = 1;
  momentoDelDia: string = 'Desayuno';
  alimentosSeleccionados: string[] = [];
  emocionSeleccionada: string | null = null;
  respuestaCoach: number | null = null;

  // Datos de ejemplo para Nutrimental
  preguntaNutrimental = {
    pregunta: '¿Cuál de estos alimentos es una fuente principal de proteína?',
    opciones: ['Arroz', 'Pollo', 'Lechuga', 'Pan'],
    correcta: 1,
    explicacion: 'El pollo es una excelente fuente de proteína magra, esencial para el crecimiento y reparación muscular.'
  };

  // Datos para Reto 7 Días
  alimentosDisponibles = [
    { id: 'frutas', nombre: 'Frutas', icon: 'apple' },
    { id: 'verduras', nombre: 'Verduras', icon: 'grass' },
    { id: 'proteina', nombre: 'Proteína', icon: 'egg' },
    { id: 'carbohidratos', nombre: 'Carbohidratos', icon: 'rice_bowl' },
    { id: 'lacteos', nombre: 'Lácteos', icon: 'local_drink' },
    { id: 'dulces', nombre: 'Dulces', icon: 'cake' }
  ];

  emociones = [
    { id: 'feliz', emoji: '😊' },
    { id: 'normal', emoji: '😐' },
    { id: 'triste', emoji: '😢' },
    { id: 'estresado', emoji: '😰' },
    { id: 'ansioso', emoji: '😬' }
  ];

  // Datos para Coach Exprés
  preguntaCoach = {
    pregunta: 'Estoy considerando seriamente cambiar mis hábitos alimenticios en los próximos 6 meses',
    etapa: 'Contemplación'
  };

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Game,
    private dialogRef: MatDialogRef<GamePlayDialog>
  ) {
    this.gameData = data;
    this.nivelActual = data.nivelActual;
    this.puntos = data.puntosGanados;
  }

  ngOnInit(): void {
    // Generar array de niveles
    this.niveles = Array.from({length: this.gameData.maxNiveles}, (_, i) => i + 1);
  }

  cambiarNivel(nivel: number): void {
    if (nivel >= 1 && nivel <= this.gameData.maxNiveles) {
      this.nivelActual = nivel;
      this.resetearPregunta();
    }
  }

  resetearPregunta(): void {
    this.preguntaActual = 1;
    this.respuestaSeleccionada = null;
    this.respuestaCoach = null;
    this.alimentosSeleccionados = [];
    this.emocionSeleccionada = null;
  }

  seleccionarRespuesta(index: number): void {
    this.respuestaSeleccionada = index;
    if (index === this.preguntaNutrimental.correcta) {
      this.puntos += 50;
    }
  }

  toggleAlimento(id: string): void {
    const index = this.alimentosSeleccionados.indexOf(id);
    if (index > -1) {
      this.alimentosSeleccionados.splice(index, 1);
    } else {
      this.alimentosSeleccionados.push(id);
    }
  }

  seleccionarEmocion(id: string): void {
    this.emocionSeleccionada = id;
  }

  seleccionarRespuestaCoach(valor: number): void {
    this.respuestaCoach = valor;
  }

  puedeAvanzar(): boolean {
    if (this.gameData.id === 'nutrimental') {
      return this.respuestaSeleccionada !== null;
    } else if (this.gameData.id === 'reto-7dias') {
      return this.alimentosSeleccionados.length > 0 && this.emocionSeleccionada !== null;
    } else if (this.gameData.id === 'coach-expres') {
      return this.respuestaCoach !== null;
    }
    return false;
  }

  anteriorPregunta(): void {
    if (this.preguntaActual > 1) {
      this.preguntaActual--;
      this.respuestaSeleccionada = null;
      this.respuestaCoach = null;
    }
  }

  siguientePregunta(): void {
    const maxPreguntas = this.gameData.id === 'nutrimental' ? 5 : 
                        this.gameData.id === 'reto-7dias' ? 7 : 8;
    
    if (this.preguntaActual < maxPreguntas) {
      this.preguntaActual++;
      this.respuestaSeleccionada = null;
      this.respuestaCoach = null;
      this.alimentosSeleccionados = [];
      this.emocionSeleccionada = null;
    } else {
      // Finalizar nivel
      this.finalizarNivel();
    }
  }

  finalizarNivel(): void {
    // Guardar progreso
    const result = {
      nivelActual: this.nivelActual < this.gameData.maxNiveles ? this.nivelActual + 1 : this.nivelActual,
      puntosGanados: this.puntos
    };
    
    alert(`¡Nivel completado! Ganaste ${this.puntos} puntos`);
    this.dialogRef.close(result);
  }

  cerrar(): void {
    this.dialogRef.close();
  }
}