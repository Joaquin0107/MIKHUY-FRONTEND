import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { JuegosService, JuegoResponse } from '../../services/juego.service';
import { SesionJuegoService } from '../../services/sesion-juego.service';

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
    MatMenuModule,
  ],
  templateUrl: './juegos.component.html',
  styleUrls: ['./juegos.component.css'],
})
export class JuegosComponent implements OnInit {
  juegos: JuegoResponse[] = [];
  studentPoints: number = 0;
  notificationCount: number = 0;
  loading: boolean = false;

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private authService: AuthService,
    private juegosService: JuegosService,
    private sesionService: SesionJuegoService
  ) {}

  ngOnInit(): void {
    if (!this.authService.getToken()) {
      console.warn('No hay token, redirigiendo a login');
      this.router.navigate(['/login']);
      return;
    }
    this.loadJuegos();
    this.loadStudentInfo();
  }

  loadJuegos(): void {
    this.loading = true;
    this.juegosService.getMisJuegos().subscribe({
      next: (response) => {
        if (response.success) {
          this.juegos = response.data.map(juego => ({
            ...juego,
            // Mapear campos para que funcionen con tu HTML
            title: juego.nombre,
            subtitle: juego.categoria,
            description: juego.descripcion,
            image: juego.image || this.getDefaultImage(juego.categoria)
          }));
          console.log('Juegos cargados:', this.juegos);
        } else {
          console.error('Error en respuesta:', response.message);
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando juegos:', err);
        this.loading = false;
        if (err.status === 401) {
          alert('Sesión expirada. Por favor inicia sesión nuevamente.');
          this.logout();
        }
      },
    });
  }

  loadStudentInfo(): void {
    const storedPoints = localStorage.getItem('studentPoints');
    this.studentPoints = storedPoints ? parseInt(storedPoints) : 0;
  }

  getDefaultImage(categoria: string): string {
    const imageMap: { [key: string]: string } = {
      'Nutrición': 'assets/images/nutricion.jpg',
      'Ejercicio': 'assets/images/ejercicio.jpg',
      'Bienestar': 'assets/images/bienestar.jpg',
    };
    return imageMap[categoria] || 'assets/images/reto7.png';
  }

  getProgressPercent(juego: JuegoResponse): number {
    if (!juego.maxNiveles) return 0;
    const nivel = juego.nivelActual || 0;
    return (nivel / juego.maxNiveles) * 100;
  }

  jugar(juego: JuegoResponse): void {
    const nivelAJugar = juego.nivelActual || 1;
    
    const dialogRef = this.dialog.open(GamePlayDialog, {
      width: '90vw',
      maxWidth: '1200px',
      height: '85vh',
      data: {
        juego: juego,
        nivelAJugar: nivelAJugar
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.completed) {
        this.loadJuegos();
        this.loadStudentInfo();
      }
    });
  }

  verPosiciones(juego: JuegoResponse): void {
    this.router.navigate(['/ranking', juego.id]);
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

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  onImageError(event: any): void {
    event.target.src = 'assets/images/placeholder-game.jpg';
  }

  logout(): void {
    this.authService.logout();
    sessionStorage.clear();
    localStorage.removeItem('authToken');
    this.router.navigate(['/login']);
  }
}

// ========================================
// DIALOG PRINCIPAL DEL JUEGO
// ========================================
@Component({
  selector: 'game-play-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDialogModule,
    MatProgressBarModule,
    MatRadioModule,
    FormsModule
  ],
  template: `
    <div class="game-dialog">
      <!-- HEADER -->
      <div class="game-header">
        <h2>{{ gameData.juego.nombre }}</h2>
        <button mat-icon-button (click)="abandonar()" class="close-btn">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- PANTALLA INICIAL -->
      <div class="game-info" *ngIf="!gameStarted">
        <mat-card>
          <mat-card-content>
            <p class="game-description">{{ gameData.juego.descripcion }}</p>
            <div class="level-info">
              <p><strong>Nivel a jugar:</strong> {{ nivelActual }}</p>
              <p><strong>Puntos actuales:</strong> {{ puntosActuales }}</p>
              <p><strong>Puntos por nivel:</strong> {{ gameData.juego.puntosPorNivel }}</p>
            </div>
          </mat-card-content>
          <mat-card-actions>
            <button mat-raised-button color="primary" (click)="iniciarJuego()">
              <mat-icon>play_arrow</mat-icon>
              Comenzar
            </button>
          </mat-card-actions>
        </mat-card>
      </div>

      <!-- ÁREA DE JUEGO -->
      <div class="game-content" *ngIf="gameStarted && !gameEnded">
        <div class="game-controls">
          <div class="timer">
            <mat-icon>timer</mat-icon>
            <span>{{ tiempoFormateado }}</span>
          </div>
          <div class="score">
            <mat-icon>stars</mat-icon>
            <span>{{ puntosGanadosEnSesion }} pts</span>
          </div>
        </div>

        <!-- DESAFÍO NUTRIMENTAL -->
        <div *ngIf="esNutrimental()" class="nutrimental-game">
          <mat-card class="question-card">
            <mat-card-header>
              <mat-card-title>
                Pregunta {{ preguntaActual + 1 }} de {{ totalPreguntas }}
              </mat-card-title>
              <mat-card-subtitle>{{ preguntaNutrimental?.tema }}</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <h3 class="question-text">{{ preguntaNutrimental?.pregunta }}</h3>
              
              <mat-radio-group [(ngModel)]="respuestaSeleccionada" class="options-group">
                <mat-radio-button 
                  *ngFor="let opcion of preguntaNutrimental?.opciones; let i = index"
                  [value]="i"
                  [disabled]="respuestaEnviada"
                  class="option-button">
                  {{ opcion }}
                </mat-radio-button>
              </mat-radio-group>

              <div *ngIf="respuestaEnviada" class="feedback" [class.correct]="esRespuestaCorrecta" [class.incorrect]="!esRespuestaCorrecta">
                <mat-icon>{{ esRespuestaCorrecta ? 'check_circle' : 'cancel' }}</mat-icon>
                <p>{{ esRespuestaCorrecta ? '¡Correcto!' : 'Incorrecto' }}</p>
                <p class="explanation">{{ preguntaNutrimental?.explicacion }}</p>
              </div>
            </mat-card-content>
            <mat-card-actions>
              <button 
                mat-raised-button 
                color="primary" 
                (click)="enviarRespuestaNutrimental()"
                [disabled]="respuestaSeleccionada === null || respuestaEnviada">
                Responder
              </button>
              <button 
                *ngIf="respuestaEnviada"
                mat-raised-button 
                color="accent" 
                (click)="siguientePregunta()">
                Siguiente
              </button>
            </mat-card-actions>
          </mat-card>
        </div>

        <!-- RETO 7 DÍAS -->
        <div *ngIf="esReto7Dias()" class="reto7dias-game">
          <mat-card class="diary-card">
            <mat-card-header>
              <mat-card-title>
                Día {{ diaActual }} - {{ momentoDiaActual }}
              </mat-card-title>
              <mat-card-subtitle>
                Registro {{ registrosGuardados + 1 }} de {{ totalRegistros }}
              </mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <h3>Registra tus alimentos consumidos:</h3>
              
              <div class="food-groups">
                <div class="food-item">
                  <label>🍎 Frutas:</label>
                  <input type="number" [(ngModel)]="alimentosFrutas" min="0" max="10">
                </div>
                <div class="food-item">
                  <label>🥗 Verduras:</label>
                  <input type="number" [(ngModel)]="alimentosVerduras" min="0" max="10">
                </div>
                <div class="food-item">
                  <label>🍗 Proteínas:</label>
                  <input type="number" [(ngModel)]="alimentosProteinas" min="0" max="10">
                </div>
                <div class="food-item">
                  <label>🍞 Carbohidratos:</label>
                  <input type="number" [(ngModel)]="alimentosCarbohidratos" min="0" max="10">
                </div>
                <div class="food-item">
                  <label>🥛 Lácteos:</label>
                  <input type="number" [(ngModel)]="alimentosLacteos" min="0" max="10">
                </div>
                <div class="food-item">
                  <label>🍰 Dulces:</label>
                  <input type="number" [(ngModel)]="alimentosDulces" min="0" max="10">
                </div>
              </div>

              <div class="emotions">
                <h4>¿Cómo te sientes?</h4>
                <mat-radio-group [(ngModel)]="emocionSeleccionada">
                  <mat-radio-button value="feliz">😊 Feliz</mat-radio-button>
                  <mat-radio-button value="normal">😐 Normal</mat-radio-button>
                  <mat-radio-button value="triste">😢 Triste</mat-radio-button>
                  <mat-radio-button value="estresado">😰 Estresado</mat-radio-button>
                  <mat-radio-button value="ansioso">😟 Ansioso</mat-radio-button>
                </mat-radio-group>
              </div>

              <div class="notes">
                <label>Notas adicionales:</label>
                <textarea [(ngModel)]="notasReto" rows="3" placeholder="Escribe tus observaciones..."></textarea>
              </div>

              <div class="calories-estimate" *ngIf="calcularCalorias() > 0">
                <p><strong>Calorías estimadas:</strong> {{ calcularCalorias() }} kcal</p>
              </div>
            </mat-card-content>
            <mat-card-actions>
              <button 
                mat-raised-button 
                color="primary" 
                (click)="guardarRegistroReto()">
                Guardar Registro
              </button>
            </mat-card-actions>
          </mat-card>
        </div>

        <!-- COACH EXPRÉS -->
        <div *ngIf="esCoachExpres()" class="coach-game">
          <mat-card class="coach-card">
            <mat-card-header>
              <mat-card-title>
                Pregunta {{ preguntaCoachActual + 1 }} de {{ totalPreguntasCoach }}
              </mat-card-title>
              <mat-card-subtitle>{{ preguntaCoach?.etapa }}</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <h3 class="question-text">{{ preguntaCoach?.pregunta }}</h3>
              
              <div class="scale-group">
                <mat-radio-group [(ngModel)]="respuestaCoach" class="scale-options">
                  <mat-radio-button 
                    *ngFor="let valor of [1, 2, 3, 4, 5]"
                    [value]="valor"
                    class="scale-option">
                    {{ valor }}
                  </mat-radio-button>
                </mat-radio-group>
                <div class="scale-labels">
                  <span>Totalmente en desacuerdo</span>
                  <span>Totalmente de acuerdo</span>
                </div>
              </div>
            </mat-card-content>
            <mat-card-actions>
              <button 
                mat-raised-button 
                color="primary" 
                (click)="enviarRespuestaCoach()"
                [disabled]="respuestaCoach === null">
                {{ preguntaCoachActual < totalPreguntasCoach - 1 ? 'Siguiente' : 'Finalizar' }}
              </button>
            </mat-card-actions>
          </mat-card>
        </div>
      </div>

      <!-- RESUMEN FINAL -->
      <div class="game-summary" *ngIf="gameEnded">
        <mat-card class="summary-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon class="success-icon">check_circle</mat-icon>
              ¡Nivel Completado!
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="summary-stats">
              <div class="stat">
                <mat-icon>timer</mat-icon>
                <div>
                  <span class="label">Tiempo</span>
                  <span class="value">{{ tiempoFormateado }}</span>
                </div>
              </div>
              <div class="stat">
                <mat-icon>stars</mat-icon>
                <div>
                  <span class="label">Puntos Ganados</span>
                  <span class="value">{{ puntosGanadosEnSesion }}</span>
                </div>
              </div>
              <div class="stat" *ngIf="!esUltimoNivel()">
                <mat-icon>emoji_events</mat-icon>
                <div>
                  <span class="label">Nuevo Nivel</span>
                  <span class="value">{{ nivelActual + 1 }}</span>
                </div>
              </div>
            </div>
          </mat-card-content>
          <mat-card-actions>
            <button mat-raised-button color="primary" (click)="continuar()">
              Continuar
            </button>
          </mat-card-actions>
        </mat-card>
      </div>

      <!-- LOADING OVERLAY -->
      <div class="loading-overlay" *ngIf="loading">
        <mat-icon class="spinner">refresh</mat-icon>
        <p>{{ loadingMessage }}</p>
      </div>
    </div>
  `,
  styles: [`
    .game-dialog {
      min-height: 70vh;
      display: flex;
      flex-direction: column;
    }
    .game-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid #ddd;
      background: #f5f5f5;
    }
    .game-info, .game-content, .game-summary {
      flex: 1;
      padding: 24px;
      overflow-y: auto;
    }
    .level-info p {
      margin: 8px 0;
    }
    .game-controls {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20px;
      padding: 16px;
      background: #f5f5f5;
      border-radius: 8px;
    }
    .timer, .score {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 18px;
      font-weight: 500;
    }
    
    /* Nutrimental Styles */
    .question-card {
      max-width: 800px;
      margin: 0 auto;
    }
    .question-text {
      font-size: 20px;
      margin: 20px 0;
      color: #333;
    }
    .options-group {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin: 20px 0;
    }
    .option-button {
      padding: 12px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      transition: all 0.3s;
    }
    .option-button:hover:not([disabled]) {
      background: #f5f5f5;
      border-color: #1976d2;
    }
    .feedback {
      margin-top: 20px;
      padding: 16px;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }
    .feedback.correct {
      background: #e8f5e9;
      border: 2px solid #4caf50;
    }
    .feedback.incorrect {
      background: #ffebee;
      border: 2px solid #f44336;
    }
    .feedback mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
    }
    .explanation {
      text-align: center;
      color: #666;
      font-style: italic;
    }
    
    /* Reto 7 Días Styles */
    .diary-card {
      max-width: 800px;
      margin: 0 auto;
    }
    .food-groups {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin: 20px 0;
    }
    .food-item {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .food-item label {
      font-weight: 500;
      font-size: 16px;
    }
    .food-item input {
      padding: 8px;
      border: 2px solid #e0e0e0;
      border-radius: 4px;
      font-size: 16px;
    }
    .emotions {
      margin: 24px 0;
    }
    .emotions h4 {
      margin-bottom: 12px;
    }
    .emotions mat-radio-group {
      display: flex;
      gap: 12px;
      margin-top: 12px;
      flex-wrap: wrap;
    }
    .notes {
      margin-top: 24px;
    }
    .notes label {
      font-weight: 500;
      display: block;
      margin-bottom: 8px;
    }
    .notes textarea {
      width: 100%;
      padding: 12px;
      border: 2px solid #e0e0e0;
      border-radius: 4px;
      font-family: inherit;
      resize: vertical;
    }
    .calories-estimate {
      margin-top: 16px;
      padding: 12px;
      background: #e3f2fd;
      border-radius: 4px;
      text-align: center;
    }
    
    /* Coach Styles */
    .coach-card {
      max-width: 800px;
      margin: 0 auto;
    }
    .scale-group {
      margin: 30px 0;
    }
    .scale-options {
      display: flex;
      justify-content: space-between;
      margin: 20px 0;
    }
    .scale-option {
      flex: 1;
      text-align: center;
    }
    .scale-labels {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: #666;
      margin-top: 8px;
    }
    
    /* Summary Styles */
    .summary-card {
      max-width: 500px;
      margin: 0 auto;
    }
    .success-icon {
      color: #4caf50;
      font-size: 48px;
      width: 48px;
      height: 48px;
    }
    .summary-stats {
      display: flex;
      flex-direction: column;
      gap: 20px;
      margin: 24px 0;
    }
    .stat {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 12px;
      background: #f5f5f5;
      border-radius: 8px;
    }
    .stat mat-icon {
      color: #1976d2;
      font-size: 32px;
      width: 32px;
      height: 32px;
    }
    .stat .label {
      display: block;
      font-size: 12px;
      color: #666;
    }
    .stat .value {
      display: block;
      font-size: 20px;
      font-weight: 600;
    }
    
    /* Loading */
    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.9);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
      z-index: 1000;
    }
    .spinner {
      animation: spin 1s linear infinite;
      font-size: 48px;
      width: 48px;
      height: 48px;
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `]
})
export class GamePlayDialog implements OnInit, OnDestroy {
  gameData: any;
  nivelActual: number;
  puntosActuales: number;
  puntosGanadosEnSesion: number = 0;
  
  gameStarted: boolean = false;
  gameEnded: boolean = false;
  loading: boolean = false;
  loadingMessage: string = '';

  sesionId: string | null = null;
  tiempoInicio: number = 0;
  tiempoTranscurrido: number = 0;
  intervalo: any;

  // Variables para Nutrimental
  preguntasNutrimental: any[] = [
    {
      numero: 1,
      pregunta: '¿Cuál es la vitamina que ayuda a la visión?',
      opciones: ['Vitamina A', 'Vitamina C', 'Vitamina D', 'Vitamina E'],
      respuestaCorrecta: 0,
      tema: 'Vitaminas',
      explicacion: 'La vitamina A es esencial para mantener una buena visión, especialmente en condiciones de poca luz.'
    },
    {
      numero: 2,
      pregunta: '¿Qué nutriente es la principal fuente de energía del cuerpo?',
      opciones: ['Proteínas', 'Carbohidratos', 'Grasas', 'Vitaminas'],
      respuestaCorrecta: 1,
      tema: 'Macronutrientes',
      explicacion: 'Los carbohidratos son la principal fuente de energía para el cuerpo y el cerebro.'
    },
    {
      numero: 3,
      pregunta: '¿Cuántos vasos de agua se recomienda beber al día?',
      opciones: ['2-3 vasos', '4-5 vasos', '6-8 vasos', '10-12 vasos'],
      respuestaCorrecta: 2,
      tema: 'Hidratación',
      explicacion: 'Se recomienda beber entre 6-8 vasos de agua al día para mantenerse bien hidratado.'
    },
    {
      numero: 4,
      pregunta: '¿Qué mineral es importante para los huesos y dientes?',
      opciones: ['Hierro', 'Calcio', 'Zinc', 'Magnesio'],
      respuestaCorrecta: 1,
      tema: 'Minerales',
      explicacion: 'El calcio es fundamental para mantener huesos y dientes fuertes.'
    },
    {
      numero: 5,
      pregunta: '¿Cuál es una buena fuente de proteínas?',
      opciones: ['Pan', 'Pollo', 'Lechuga', 'Manzana'],
      respuestaCorrecta: 1,
      tema: 'Proteínas',
      explicacion: 'El pollo es una excelente fuente de proteína magra, esencial para el crecimiento y reparación de tejidos.'
    }
  ];
  preguntaActual: number = 0;
  totalPreguntas: number = 5;
  preguntaNutrimental: any = null;
  respuestaSeleccionada: number | null = null;
  respuestaEnviada: boolean = false;
  esRespuestaCorrecta: boolean = false;
  tiempoInicioRespuesta: number = 0;

  // Variables para Reto 7 Días
  diaActual: number = 1;
  momentoDiaActual: string = 'Desayuno';
  alimentosFrutas: number = 0;
  alimentosVerduras: number = 0;
  alimentosProteinas: number = 0;
  alimentosCarbohidratos: number = 0;
  alimentosLacteos: number = 0;
  alimentosDulces: number = 0;
  emocionSeleccionada: string = '';
  notasReto: string = '';
  registrosGuardados: number = 0;
  totalRegistros: number = 21; // 7 días × 3 momentos

  // Variables para Coach Exprés
  preguntasCoach: any[] = [
    {
      numero: 1,
      pregunta: '¿Qué tan importante es para ti mejorar tu alimentación?',
      etapa: 'Pre-contemplación'
    },
    {
      numero: 2,
      pregunta: '¿Consideras que tu alimentación actual necesita cambios?',
      etapa: 'Contemplación'
    },
    {
      numero: 3,
      pregunta: '¿Estás listo para hacer cambios en tu dieta esta semana?',
      etapa: 'Preparación'
    },
    {
      numero: 4,
      pregunta: '¿Has intentado mejorar tus hábitos alimenticios recientemente?',
      etapa: 'Acción'
    },
    {
      numero: 5,
      pregunta: '¿Te sientes capaz de mantener una alimentación saludable a largo plazo?',
      etapa: 'Mantenimiento'
    },
    {
      numero: 6,
      pregunta: '¿Cuentas con apoyo familiar para mejorar tu alimentación?',
      etapa: 'Apoyo Social'
    },
    {
      numero: 7,
      pregunta: '¿Conoces los beneficios de una alimentación balanceada para tu salud?',
      etapa: 'Conocimiento'
    },
    {
      numero: 8,
      pregunta: '¿Estás motivado para alcanzar tus metas nutricionales?',
      etapa: 'Motivación'
    }
  ];
  preguntaCoachActual: number = 0;
  totalPreguntasCoach: number = 8;
  preguntaCoach: any = null;
  respuestaCoach: number | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<GamePlayDialog>,
    private sesionService: SesionJuegoService
  ) {
    this.gameData = data;
    this.nivelActual = data.nivelAJugar;
    this.puntosActuales = data.juego.puntosGanados || 0;
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    if (this.intervalo) {
      clearInterval(this.intervalo);
    }
  }

  get tiempoFormateado(): string {
    const minutos = Math.floor(this.tiempoTranscurrido / 60);
    const segundos = this.tiempoTranscurrido % 60;
    return `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
  }

  esNutrimental(): boolean {
    return this.gameData.juego.nombre.toLowerCase().includes('nutrimental') ||
           this.gameData.juego.nombre.toLowerCase().includes('desafío');
  }

  esReto7Dias(): boolean {
    return this.gameData.juego.nombre.toLowerCase().includes('reto') ||
           this.gameData.juego.nombre.toLowerCase().includes('7 días') ||
           this.gameData.juego.nombre.toLowerCase().includes('7dias');
  }

  esCoachExpres(): boolean {
    return this.gameData.juego.nombre.toLowerCase().includes('coach');
  }

  esUltimoNivel(): boolean {
    return this.nivelActual >= this.gameData.juego.maxNiveles;
  }

  iniciarJuego(): void {
    this.loading = true;
    this.loadingMessage = 'Iniciando sesión...';

    this.sesionService.iniciarSesion({
      juegoId: this.gameData.juego.id,
      nivel: this.nivelActual
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.sesionId = response.data.id;
          this.gameStarted = true;
          this.iniciarCronometro();
          
          // Cargar primera pregunta según el tipo de juego
          if (this.esNutrimental()) {
            this.cargarPreguntaNutrimental();
          } else if (this.esCoachExpres()) {
            this.cargarPreguntaCoach();
          }
          
          console.log('Sesión iniciada:', response.data);
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error iniciando sesión:', err);
        alert('Error al iniciar el juego. Intenta nuevamente.');
        this.loading = false;
      }
    });
  }

  iniciarCronometro(): void {
    this.tiempoInicio = Date.now();
    this.intervalo = setInterval(() => {
      this.tiempoTranscurrido = Math.floor((Date.now() - this.tiempoInicio) / 1000);
    }, 1000);
  }

  // ==================== NUTRIMENTAL ====================
  cargarPreguntaNutrimental(): void {
    if (this.preguntaActual < this.totalPreguntas) {
      this.preguntaNutrimental = this.preguntasNutrimental[this.preguntaActual];
      this.respuestaSeleccionada = null;
      this.respuestaEnviada = false;
      this.tiempoInicioRespuesta = this.tiempoTranscurrido;
    } else {
      // Terminó todas las preguntas
      this.finalizarJuego(true);
    }
  }

  enviarRespuestaNutrimental(): void {
    if (this.respuestaSeleccionada === null) return;

    this.respuestaEnviada = true;
    this.esRespuestaCorrecta = this.respuestaSeleccionada === this.preguntaNutrimental.respuestaCorrecta;
    
    const tiempoRespuesta = this.tiempoTranscurrido - this.tiempoInicioRespuesta;

    // Guardar respuesta en el backend
    this.sesionService.guardarRespuestaNutrimental({
      sesionId: this.sesionId!,
      preguntaNumero: this.preguntaNutrimental.numero,
      preguntaTema: this.preguntaNutrimental.tema,
      respuestaCorrecta: this.esRespuestaCorrecta,
      tiempoRespuesta: tiempoRespuesta
    }).subscribe({
      next: () => {
        console.log('Respuesta guardada');
        if (this.esRespuestaCorrecta) {
          this.puntosGanadosEnSesion += 10;
        }
      },
      error: (err) => console.error('Error guardando respuesta:', err)
    });
  }

  siguientePregunta(): void {
    this.preguntaActual++;
    this.cargarPreguntaNutrimental();
  }

  // ==================== RETO 7 DÍAS ====================
  guardarRegistroReto(): void {
    if (!this.sesionId) return;

    this.loading = true;
    this.loadingMessage = 'Guardando registro...';

    const caloriasEstimadas = this.calcularCalorias();

    this.sesionService.guardarRegistroReto7Dias({
      sesionId: this.sesionId,
      diaNumero: this.diaActual,
      momentoDia: this.momentoDiaActual as any,
      alimentosFrutas: this.alimentosFrutas,
      alimentosVerduras: this.alimentosVerduras,
      alimentosProteinas: this.alimentosProteinas,
      alimentosCarbohidratos: this.alimentosCarbohidratos,
      alimentosLacteos: this.alimentosLacteos,
      alimentosDulces: this.alimentosDulces,
      emocion: this.emocionSeleccionada ? this.emocionSeleccionada as any : undefined,
      caloriasEstimadas: caloriasEstimadas,
      notas: this.notasReto || undefined
    }).subscribe({
      next: () => {
        console.log('Registro guardado');
        this.registrosGuardados++;
        this.puntosGanadosEnSesion += 5;
        
        // Avanzar al siguiente momento o día
        this.avanzarRetoSiguiente();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error guardando registro:', err);
        alert('Error al guardar el registro');
        this.loading = false;
      }
    });
  }

  calcularCalorias(): number {
    return (
      (this.alimentosFrutas * 60) +
      (this.alimentosVerduras * 25) +
      (this.alimentosProteinas * 150) +
      (this.alimentosCarbohidratos * 100) +
      (this.alimentosLacteos * 120) +
      (this.alimentosDulces * 200)
    );
  }

  avanzarRetoSiguiente(): void {
    // Limpiar campos
    this.alimentosFrutas = 0;
    this.alimentosVerduras = 0;
    this.alimentosProteinas = 0;
    this.alimentosCarbohidratos = 0;
    this.alimentosLacteos = 0;
    this.alimentosDulces = 0;
    this.emocionSeleccionada = '';
    this.notasReto = '';

    // Avanzar momento del día
    if (this.momentoDiaActual === 'Desayuno') {
      this.momentoDiaActual = 'Almuerzo';
    } else if (this.momentoDiaActual === 'Almuerzo') {
      this.momentoDiaActual = 'Cena';
    } else {
      // Avanzar al siguiente día
      this.diaActual++;
      this.momentoDiaActual = 'Desayuno';
    }

    // Verificar si completó todos los registros
    if (this.registrosGuardados >= this.totalRegistros) {
      this.finalizarJuego(true);
    }
  }

  // ==================== COACH EXPRÉS ====================
  cargarPreguntaCoach(): void {
    if (this.preguntaCoachActual < this.totalPreguntasCoach) {
      this.preguntaCoach = this.preguntasCoach[this.preguntaCoachActual];
      this.respuestaCoach = null;
    }
  }

  enviarRespuestaCoach(): void {
    if (this.respuestaCoach === null || !this.sesionId) return;

    this.loading = true;
    this.loadingMessage = 'Guardando respuesta...';

    this.sesionService.guardarRespuestaCoach({
      sesionId: this.sesionId,
      preguntaNumero: this.preguntaCoach.numero,
      preguntaEtapa: this.preguntaCoach.etapa,
      respuestaValor: this.respuestaCoach
    }).subscribe({
      next: () => {
        console.log('Respuesta Coach guardada');
        this.puntosGanadosEnSesion += 5;
        this.preguntaCoachActual++;
        
        if (this.preguntaCoachActual < this.totalPreguntasCoach) {
          this.cargarPreguntaCoach();
        } else {
          this.finalizarJuego(true);
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error guardando respuesta Coach:', err);
        this.loading = false;
      }
    });
  }

  // ==================== FINALIZACIÓN ====================
  finalizarJuego(completado: boolean): void {
    if (!this.sesionId) return;

    if (this.intervalo) {
      clearInterval(this.intervalo);
    }

    this.loading = true;
    this.loadingMessage = 'Guardando progreso...';

    // Calcular puntos según tipo de juego y completitud
    if (completado) {
      this.puntosGanadosEnSesion += this.gameData.juego.puntosPorNivel;
    }

    this.sesionService.finalizarSesion({
      sesionId: this.sesionId,
      puntosObtenidos: this.puntosGanadosEnSesion,
      tiempoJugado: this.tiempoTranscurrido,
      completado: completado
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.gameEnded = true;
          console.log('Sesión finalizada:', response.data);
          
          // Actualizar puntos del estudiante en localStorage
          const puntosActuales = parseInt(localStorage.getItem('studentPoints') || '0');
          localStorage.setItem('studentPoints', (puntosActuales + this.puntosGanadosEnSesion).toString());
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error finalizando sesión:', err);
        this.loading = false;
      }
    });
  }

  continuar(): void {
    this.dialogRef.close({ completed: true });
  }

  abandonar(): void {
    if (this.gameStarted && !this.gameEnded) {
      const confirmar = confirm('¿Estás seguro de que quieres abandonar? Se perderá tu progreso.');
      if (!confirmar) return;
      
      if (this.sesionId) {
        this.finalizarJuego(false);
      }
    }
    
    if (this.intervalo) {
      clearInterval(this.intervalo);
    }
    
    this.dialogRef.close({ completed: false });
  }
}