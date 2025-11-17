import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRadioModule } from '@angular/material/radio';
import { SesionJuegoService } from '../../services/sesion-juego.service';
import { StudentService } from '../../services/student.service';

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
    FormsModule,
  ],
  templateUrl: './game-play-dialog.component.html',
  styleUrls: ['./game-play-dialog.component.css']
})
export class GamePlayDialog implements OnInit, OnDestroy {
  gameData: any;
  nivelActual: number;
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
      explicacion: 'La vitamina A es esencial para mantener una buena visión, especialmente en condiciones de poca luz.',
    },
    {
      numero: 2,
      pregunta: '¿Qué nutriente es la principal fuente de energía del cuerpo?',
      opciones: ['Proteínas', 'Carbohidratos', 'Grasas', 'Vitaminas'],
      respuestaCorrecta: 1,
      tema: 'Macronutrientes',
      explicacion: 'Los carbohidratos son la principal fuente de energía para el cuerpo y el cerebro.',
    },
    {
      numero: 3,
      pregunta: '¿Cuántos vasos de agua se recomienda beber al día?',
      opciones: ['2-3 vasos', '4-5 vasos', '6-8 vasos', '10-12 vasos'],
      respuestaCorrecta: 2,
      tema: 'Hidratación',
      explicacion: 'Se recomienda beber entre 6-8 vasos de agua al día para mantenerse bien hidratado.',
    },
    {
      numero: 4,
      pregunta: '¿Qué mineral es importante para los huesos y dientes?',
      opciones: ['Hierro', 'Calcio', 'Zinc', 'Magnesio'],
      respuestaCorrecta: 1,
      tema: 'Minerales',
      explicacion: 'El calcio es fundamental para mantener huesos y dientes fuertes.',
    },
    {
      numero: 5,
      pregunta: '¿Cuál es una buena fuente de proteínas?',
      opciones: ['Pan', 'Pollo', 'Lechuga', 'Manzana'],
      respuestaCorrecta: 1,
      tema: 'Proteínas',
      explicacion: 'El pollo es una excelente fuente de proteína magra, esencial para el crecimiento y reparación de tejidos.',
    },
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
  totalRegistros: number = 21;

  // Variables para Coach Exprés
  preguntasCoach: any[] = [
    { numero: 1, pregunta: '¿Qué tan importante es para ti mejorar tu alimentación?', etapa: 'Pre-contemplación' },
    { numero: 2, pregunta: '¿Consideras que tu alimentación actual necesita cambios?', etapa: 'Contemplación' },
    { numero: 3, pregunta: '¿Estás listo para hacer cambios en tu dieta esta semana?', etapa: 'Preparación' },
    { numero: 4, pregunta: '¿Has intentado mejorar tus hábitos alimenticios recientemente?', etapa: 'Acción' },
    { numero: 5, pregunta: '¿Te sientes capaz de mantener una alimentación saludable a largo plazo?', etapa: 'Mantenimiento' },
    { numero: 6, pregunta: '¿Cuentas con apoyo familiar para mejorar tu alimentación?', etapa: 'Apoyo Social' },
    { numero: 7, pregunta: '¿Conoces los beneficios de una alimentación balanceada para tu salud?', etapa: 'Conocimiento' },
    { numero: 8, pregunta: '¿Estás motivado para alcanzar tus metas nutricionales?', etapa: 'Motivación' },
  ];
  preguntaCoachActual: number = 0;
  totalPreguntasCoach: number = 8;
  preguntaCoach: any = null;
  respuestaCoach: number | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<GamePlayDialog>,
    private sesionService: SesionJuegoService,
    private studentService: StudentService
  ) {
    this.gameData = data;
    this.nivelActual = data.nivelAJugar;
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
      nivel: this.nivelActual,
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.sesionId = response.data.id;
          this.gameStarted = true;
          this.iniciarCronometro();

          if (this.esNutrimental()) {
            this.cargarPreguntaNutrimental();
          } else if (this.esCoachExpres()) {
            this.cargarPreguntaCoach();
          }
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error iniciando sesión:', err);
        alert('Error al iniciar el juego. Intenta nuevamente.');
        this.loading = false;
      },
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
      this.finalizarJuego(true);
    }
  }

  enviarRespuestaNutrimental(): void {
    if (this.respuestaSeleccionada === null) return;

    this.respuestaEnviada = true;
    this.esRespuestaCorrecta = this.respuestaSeleccionada === this.preguntaNutrimental.respuestaCorrecta;
    const tiempoRespuesta = this.tiempoTranscurrido - this.tiempoInicioRespuesta;

    this.sesionService.guardarRespuestaNutrimental({
      sesionId: this.sesionId!,
      preguntaNumero: this.preguntaNutrimental.numero,
      preguntaTema: this.preguntaNutrimental.tema,
      respuestaCorrecta: this.esRespuestaCorrecta,
      tiempoRespuesta: tiempoRespuesta,
    }).subscribe({
      next: () => {
        if (this.esRespuestaCorrecta) {
          this.puntosGanadosEnSesion += 10;
        }
      },
      error: (err) => console.error('Error guardando respuesta:', err),
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
      emocion: this.emocionSeleccionada ? (this.emocionSeleccionada as any) : undefined,
      caloriasEstimadas: caloriasEstimadas,
      notas: this.notasReto || undefined,
    }).subscribe({
      next: () => {
        this.registrosGuardados++;
        this.puntosGanadosEnSesion += 5;
        this.avanzarRetoSiguiente();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error guardando registro:', err);
        alert('Error al guardar el registro');
        this.loading = false;
      },
    });
  }

  calcularCalorias(): number {
    return this.alimentosFrutas * 60 + this.alimentosVerduras * 25 +
           this.alimentosProteinas * 150 + this.alimentosCarbohidratos * 100 +
           this.alimentosLacteos * 120 + this.alimentosDulces * 200;
  }

  avanzarRetoSiguiente(): void {
    this.alimentosFrutas = 0;
    this.alimentosVerduras = 0;
    this.alimentosProteinas = 0;
    this.alimentosCarbohidratos = 0;
    this.alimentosLacteos = 0;
    this.alimentosDulces = 0;
    this.emocionSeleccionada = '';
    this.notasReto = '';

    if (this.momentoDiaActual === 'Desayuno') {
      this.momentoDiaActual = 'Almuerzo';
    } else if (this.momentoDiaActual === 'Almuerzo') {
      this.momentoDiaActual = 'Cena';
    } else {
      this.diaActual++;
      this.momentoDiaActual = 'Desayuno';
    }

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
      respuestaValor: this.respuestaCoach,
    }).subscribe({
      next: () => {
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
      },
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

    if (completado) {
      this.puntosGanadosEnSesion += this.gameData.juego.puntosPorNivel;
    }

    this.sesionService.finalizarSesion({
      sesionId: this.sesionId,
      puntosObtenidos: this.puntosGanadosEnSesion,
      tiempoJugado: this.tiempoTranscurrido,
      completado: completado,
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.gameEnded = true;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error finalizando sesión:', err);
        this.loading = false;
      },
    });
  }

  continuar(): void {
    // Actualizar puntos en el servicio (sincroniza con todos los componentes)
    this.studentService.sumarPuntos(this.puntosGanadosEnSesion);
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