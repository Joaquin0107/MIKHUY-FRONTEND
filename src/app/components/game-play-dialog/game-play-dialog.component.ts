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

// ─────────────────────────────────────────────────────────────────────────────
// BANCO DE PREGUNTAS — DESAFÍO NUTRIMENTAL (10 niveles × N preguntas)
// En cada nivel se selecciona 1 pregunta al azar del pool del nivel.
// ─────────────────────────────────────────────────────────────────────────────
const BANCO_NUTRIMENTAL: Record<number, any[]> = {
  1: [
    {
      pregunta: '¿Cuál es la vitamina que ayuda a la visión?',
      opciones: ['Vitamina A', 'Vitamina C', 'Vitamina D', 'Vitamina E'],
      respuestaCorrecta: 0,
      tema: 'Vitaminas',
      explicacion: 'La vitamina A es esencial para mantener una buena visión, especialmente en condiciones de poca luz.',
    },
    {
      pregunta: '¿Cuántas comidas al día se recomiendan para una alimentación equilibrada?',
      opciones: ['1-2 comidas', '3 comidas principales', '5-6 comidas pequeñas', 'Cualquiera de las anteriores'],
      respuestaCorrecta: 2,
      tema: 'Hábitos alimenticios',
      explicacion: 'Distribuir 5-6 comidas pequeñas al día ayuda a mantener estables los niveles de glucosa en sangre.',
    },
    {
      pregunta: '¿Cuál alimento es rico en fibra dietética?',
      opciones: ['Carne de res', 'Arroz blanco', 'Lentejas', 'Leche entera'],
      respuestaCorrecta: 2,
      tema: 'Fibra',
      explicacion: 'Las lentejas son una excelente fuente de fibra, que favorece el tránsito intestinal y la saciedad.',
    },
  ],
  2: [
    {
      pregunta: '¿Qué nutriente es la principal fuente de energía del cuerpo?',
      opciones: ['Proteínas', 'Carbohidratos', 'Grasas', 'Vitaminas'],
      respuestaCorrecta: 1,
      tema: 'Macronutrientes',
      explicacion: 'Los carbohidratos son la principal fuente de energía para el cuerpo y el cerebro.',
    },
    {
      pregunta: '¿Cuál de estos es un carbohidrato complejo?',
      opciones: ['Azúcar de mesa', 'Miel', 'Avena integral', 'Refresco'],
      respuestaCorrecta: 2,
      tema: 'Carbohidratos',
      explicacion: 'La avena integral es un carbohidrato complejo que se digiere lentamente y provee energía sostenida.',
    },
    {
      pregunta: '¿Cuántos gramos de carbohidratos se recomiendan diariamente para un adulto promedio?',
      opciones: ['50-100 g', '130-230 g', '300-400 g', '500-600 g'],
      respuestaCorrecta: 1,
      tema: 'Carbohidratos',
      explicacion: 'La recomendación general es de 130-230 g de carbohidratos al día, según la actividad física.',
    },
  ],
  3: [
    {
      pregunta: '¿Cuántos vasos de agua se recomienda beber al día?',
      opciones: ['2-3 vasos', '4-5 vasos', '6-8 vasos', '10-12 vasos'],
      respuestaCorrecta: 2,
      tema: 'Hidratación',
      explicacion: 'Se recomienda beber entre 6-8 vasos de agua al día para mantenerse bien hidratado.',
    },
    {
      pregunta: '¿Cuál bebida hidrata mejor después del ejercicio?',
      opciones: ['Refresco', 'Jugo de naranja', 'Agua natural', 'Café'],
      respuestaCorrecta: 2,
      tema: 'Hidratación',
      explicacion: 'El agua natural es la mejor opción para rehidratarse, sin calorías ni azúcares añadidos.',
    },
    {
      pregunta: '¿Qué porcentaje del cuerpo humano está compuesto por agua?',
      opciones: ['30-40%', '50-60%', '60-70%', '80-90%'],
      respuestaCorrecta: 2,
      tema: 'Hidratación',
      explicacion: 'Aproximadamente el 60-70% del cuerpo humano es agua, por eso la hidratación es vital.',
    },
  ],
  4: [
    {
      pregunta: '¿Qué mineral es importante para los huesos y dientes?',
      opciones: ['Hierro', 'Calcio', 'Zinc', 'Magnesio'],
      respuestaCorrecta: 1,
      tema: 'Minerales',
      explicacion: 'El calcio es fundamental para mantener huesos y dientes fuertes.',
    },
    {
      pregunta: '¿Cuál alimento es la mejor fuente de calcio?',
      opciones: ['Espinacas', 'Leche', 'Naranja', 'Pollo'],
      respuestaCorrecta: 1,
      tema: 'Minerales',
      explicacion: 'La leche y sus derivados son las fuentes más ricas y biodisponibles de calcio.',
    },
    {
      pregunta: '¿Qué mineral previene la anemia?',
      opciones: ['Calcio', 'Potasio', 'Hierro', 'Fósforo'],
      respuestaCorrecta: 2,
      tema: 'Minerales',
      explicacion: 'El hierro es necesario para producir hemoglobina; su déficit causa anemia ferropénica.',
    },
  ],
  5: [
    {
      pregunta: '¿Cuál es una buena fuente de proteínas?',
      opciones: ['Pan', 'Pollo', 'Lechuga', 'Manzana'],
      respuestaCorrecta: 1,
      tema: 'Proteínas',
      explicacion: 'El pollo es una excelente fuente de proteína magra, esencial para el crecimiento y reparación de tejidos.',
    },
    {
      pregunta: '¿Qué función principal cumplen las proteínas en el cuerpo?',
      opciones: ['Dar energía rápida', 'Regular la temperatura', 'Construir y reparar tejidos', 'Transportar oxígeno'],
      respuestaCorrecta: 2,
      tema: 'Proteínas',
      explicacion: 'Las proteínas son los "ladrillos" del cuerpo: construyen músculo, piel, enzimas y anticuerpos.',
    },
    {
      pregunta: '¿Cuántos aminoácidos esenciales existen?',
      opciones: ['5', '9', '14', '20'],
      respuestaCorrecta: 1,
      tema: 'Proteínas',
      explicacion: 'Existen 9 aminoácidos esenciales que el cuerpo no puede sintetizar y deben obtenerse de la dieta.',
    },
  ],
  6: [
    {
      pregunta: '¿Cuál grasa es beneficiosa para el corazón?',
      opciones: ['Grasa trans', 'Grasa saturada', 'Grasa monoinsaturada', 'Manteca vegetal'],
      respuestaCorrecta: 2,
      tema: 'Grasas saludables',
      explicacion: 'Las grasas monoinsaturadas (aceite de oliva, aguacate) reducen el colesterol LDL y protegen el corazón.',
    },
    {
      pregunta: '¿En qué alimento se encuentran los ácidos grasos omega-3?',
      opciones: ['Mantequilla', 'Salmón', 'Tocino', 'Margarina'],
      respuestaCorrecta: 1,
      tema: 'Grasas saludables',
      explicacion: 'El salmón y otros pescados azules son ricos en omega-3, que reduce la inflamación y protege el cerebro.',
    },
    {
      pregunta: '¿Qué tipo de grasa debe evitarse por aumentar el riesgo cardiovascular?',
      opciones: ['Omega-3', 'Grasa monoinsaturada', 'Grasa trans', 'Grasa poliinsaturada'],
      respuestaCorrecta: 2,
      tema: 'Grasas saludables',
      explicacion: 'Las grasas trans (en ultraprocesados) elevan el colesterol malo y reducen el bueno.',
    },
  ],
  7: [
    {
      pregunta: '¿Cuántas porciones de frutas y verduras recomienda la OMS al día?',
      opciones: ['1-2', '3-4', '5 o más', '8 o más'],
      respuestaCorrecta: 2,
      tema: 'Grupos alimenticios',
      explicacion: 'La OMS recomienda consumir al menos 5 porciones de frutas y verduras diariamente.',
    },
    {
      pregunta: '¿Qué color de verduras indica alta presencia de betacarotenos?',
      opciones: ['Blanco', 'Morado', 'Naranja/amarillo', 'Verde oscuro'],
      respuestaCorrecta: 2,
      tema: 'Grupos alimenticios',
      explicacion: 'Las verduras naranja/amarillas (zanahoria, calabaza) son ricas en betacarotenos, precursores de vitamina A.',
    },
    {
      pregunta: '¿Qué grupo alimenticio debe ocupar la mayor parte del plato según "Mi Plato"?',
      opciones: ['Proteínas', 'Lácteos', 'Frutas y verduras', 'Cereales refinados'],
      respuestaCorrecta: 2,
      tema: 'Grupos alimenticios',
      explicacion: 'El modelo "Mi Plato" propone que frutas y verduras ocupen la mitad del plato en cada comida.',
    },
  ],
  8: [
    {
      pregunta: '¿Qué índice mide la velocidad con que un alimento eleva el azúcar en sangre?',
      opciones: ['Índice de masa corporal', 'Índice glucémico', 'Valor nutricional', 'Índice metabólico'],
      respuestaCorrecta: 1,
      tema: 'Glucemia',
      explicacion: 'El índice glucémico (IG) indica qué tan rápido sube la glucosa en sangre tras consumir un alimento.',
    },
    {
      pregunta: '¿Cuál alimento tiene índice glucémico bajo?',
      opciones: ['Pan blanco', 'Sandía', 'Lentejas', 'Papas fritas'],
      respuestaCorrecta: 2,
      tema: 'Glucemia',
      explicacion: 'Las lentejas tienen IG bajo (aprox. 29), lo que genera una subida lenta y sostenida de glucosa.',
    },
    {
      pregunta: '¿Qué hormona regula el azúcar en sangre?',
      opciones: ['Adrenalina', 'Insulina', 'Testosterona', 'Cortisol'],
      respuestaCorrecta: 1,
      tema: 'Glucemia',
      explicacion: 'La insulina, producida en el páncreas, permite que las células absorban la glucosa de la sangre.',
    },
  ],
  9: [
    {
      pregunta: '¿Qué alimento ultraprocesado conviene reducir para prevenir enfermedades crónicas?',
      opciones: ['Avena', 'Embutidos', 'Nueces', 'Yogur natural'],
      respuestaCorrecta: 1,
      tema: 'Alimentación saludable',
      explicacion: 'Los embutidos son ultraprocesados con alto contenido en sodio, grasas saturadas y conservadores dañinos.',
    },
    {
      pregunta: '¿Cuánto sodio diario recomienda la OMS como máximo?',
      opciones: ['500 mg', '1000 mg', '2000 mg', '5000 mg'],
      respuestaCorrecta: 2,
      tema: 'Alimentación saludable',
      explicacion: 'La OMS recomienda menos de 2000 mg de sodio al día para proteger la salud cardiovascular.',
    },
    {
      pregunta: '¿Cuál es la principal causa de obesidad a nivel mundial?',
      opciones: ['Genética exclusivamente', 'Desequilibrio entre calorías ingeridas y gastadas', 'Falta de vitaminas', 'Exceso de agua'],
      respuestaCorrecta: 1,
      tema: 'Alimentación saludable',
      explicacion: 'La obesidad se debe principalmente a consumir más calorías de las que el cuerpo gasta, junto a factores ambientales y genéticos.',
    },
  ],
  10: [
    {
      pregunta: '¿Cuál es el rol de los antioxidantes en la alimentación?',
      opciones: ['Aumentar calorías', 'Neutralizar radicales libres', 'Reducir proteínas', 'Elevar el colesterol'],
      respuestaCorrecta: 1,
      tema: 'Nutrición avanzada',
      explicacion: 'Los antioxidantes (vitaminas C, E, polifenoles) neutralizan radicales libres, reduciendo el estrés oxidativo y el riesgo de enfermedades crónicas.',
    },
    {
      pregunta: '¿Qué vitamina se sintetiza principalmente por exposición al sol?',
      opciones: ['Vitamina A', 'Vitamina B12', 'Vitamina C', 'Vitamina D'],
      respuestaCorrecta: 3,
      tema: 'Nutrición avanzada',
      explicacion: 'La vitamina D se produce en la piel al recibir radiación UVB solar; es clave para la absorción de calcio.',
    },
    {
      pregunta: '¿Qué es la microbiota intestinal?',
      opciones: ['Un tipo de vitamina', 'Los microbios benéficos del intestino', 'Una hormona digestiva', 'Un tipo de fibra'],
      respuestaCorrecta: 1,
      tema: 'Nutrición avanzada',
      explicacion: 'La microbiota intestinal es el conjunto de microorganismos que habitan el intestino y son esenciales para la digestión, inmunidad y salud mental.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// BANCO DE PREGUNTAS — COACH EXPRÉS (10 niveles × N preguntas de escala 1-5)
// ─────────────────────────────────────────────────────────────────────────────
const BANCO_COACH: Record<number, any[]> = {
  1: [
    { pregunta: '¿Qué tan importante es para ti mejorar tu alimentación?', etapa: 'Pre-contemplación' },
    { pregunta: '¿Piensas en cómo mejorar tus hábitos de alimentación?', etapa: 'Pre-contemplación' },
    { pregunta: '¿Crees que tu forma de comer actual podría mejorar?', etapa: 'Pre-contemplación' },
  ],
  2: [
    { pregunta: '¿Consideras que tu alimentación actual necesita cambios?', etapa: 'Contemplación' },
    { pregunta: '¿Has pensado seriamente en cambiar lo que comes?', etapa: 'Contemplación' },
    { pregunta: '¿Reconoces los beneficios de comer de forma más saludable?', etapa: 'Contemplación' },
  ],
  3: [
    { pregunta: '¿Estás listo para hacer cambios en tu dieta esta semana?', etapa: 'Preparación' },
    { pregunta: '¿Has planeado cómo vas a mejorar tu alimentación?', etapa: 'Preparación' },
    { pregunta: '¿Tienes metas claras sobre lo que quieres comer?', etapa: 'Preparación' },
  ],
  4: [
    { pregunta: '¿Has intentado mejorar tus hábitos alimenticios recientemente?', etapa: 'Acción' },
    { pregunta: '¿Has sustituido alimentos poco saludables esta semana?', etapa: 'Acción' },
    { pregunta: '¿Estás tomando medidas concretas para comer mejor?', etapa: 'Acción' },
  ],
  5: [
    { pregunta: '¿Te sientes capaz de mantener una alimentación saludable a largo plazo?', etapa: 'Mantenimiento' },
    { pregunta: '¿Tus nuevos hábitos de alimentación se han vuelto parte de tu rutina?', etapa: 'Mantenimiento' },
    { pregunta: '¿Puedes resistir la tentación de comer alimentos poco saludables?', etapa: 'Mantenimiento' },
  ],
  6: [
    { pregunta: '¿Cuentas con apoyo familiar para mejorar tu alimentación?', etapa: 'Apoyo Social' },
    { pregunta: '¿Tu círculo cercano te anima a comer de forma saludable?', etapa: 'Apoyo Social' },
    { pregunta: '¿Compartes comidas saludables con personas de tu entorno?', etapa: 'Apoyo Social' },
  ],
  7: [
    { pregunta: '¿Conoces los beneficios de una alimentación balanceada para tu salud?', etapa: 'Conocimiento' },
    { pregunta: '¿Sabes identificar alimentos ultraprocesados en el supermercado?', etapa: 'Conocimiento' },
    { pregunta: '¿Entiendes qué significa leer una etiqueta nutricional?', etapa: 'Conocimiento' },
  ],
  8: [
    { pregunta: '¿Estás motivado para alcanzar tus metas nutricionales?', etapa: 'Motivación' },
    { pregunta: '¿La idea de tener mejor salud te impulsa a comer bien?', etapa: 'Motivación' },
    { pregunta: '¿Te sientes entusiasmado con los cambios que has hecho en tu dieta?', etapa: 'Motivación' },
  ],
  9: [
    { pregunta: '¿Logras comer saludable incluso en situaciones de estrés?', etapa: 'Autoeficacia' },
    { pregunta: '¿Confías en tu capacidad para rechazar alimentos poco saludables?', etapa: 'Autoeficacia' },
    { pregunta: '¿Puedes mantener tus hábitos saludables cuando comes fuera de casa?', etapa: 'Autoeficacia' },
  ],
  10: [
    { pregunta: '¿Has logrado mantener tus metas de alimentación durante más de un mes?', etapa: 'Consolidación' },
    { pregunta: '¿Tu bienestar general ha mejorado gracias a tus cambios alimenticios?', etapa: 'Consolidación' },
    { pregunta: '¿Serías capaz de guiar a alguien más en mejorar su alimentación?', etapa: 'Consolidación' },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// BANCO — RETO 7 DÍAS (7 niveles = 7 días; cada nivel tiene un tema diferente)
// ─────────────────────────────────────────────────────────────────────────────
const TEMAS_RETO_7DIAS: Record<number, { titulo: string; descripcion: string; emoji: string }> = {
  1: { titulo: 'Desayuno del Campeón', descripcion: 'Registra tu desayuno de hoy. ¡Comienza el día con energía!', emoji: '🌅' },
  2: { titulo: 'Hidratación Activa', descripcion: 'Enfócate hoy en registrar cuánta agua y líquidos consumiste.', emoji: '💧' },
  3: { titulo: 'Proteínas en Acción', descripcion: 'Hoy presta especial atención a tus fuentes de proteína.', emoji: '💪' },
  4: { titulo: 'Día de Verduras', descripcion: 'Intenta incorporar más verduras. Registra cómo te fue.', emoji: '🥦' },
  5: { titulo: 'Equilibrio de Macros', descripcion: 'Registra todas tus comidas y analiza el balance de macronutrientes.', emoji: '⚖️' },
  6: { titulo: 'Sin Dulces Extra', descripcion: 'Día de consciencia: registra honestamente los dulces consumidos.', emoji: '🍎' },
  7: { titulo: 'Cierre del Reto', descripcion: '¡Último día! Registra tu alimentación y reflexiona sobre tu semana.', emoji: '🏆' },
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper: selección aleatoria sin repetir la última (simple shuffle)
// ─────────────────────────────────────────────────────────────────────────────
function elegirAleatoria<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

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
  styleUrls: ['./game-play-dialog.component.css'],
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

  // ── NUTRIMENTAL ──────────────────────────────────────────────────────────
  preguntaNutrimental: any = null;
  respuestaSeleccionada: number | null = null;
  respuestaEnviada: boolean = false;
  esRespuestaCorrecta: boolean = false;
  tiempoInicioRespuesta: number = 0;
  // 1 pregunta por sesión (random del nivel)

  // ── RETO 7 DÍAS ───────────────────────────────────────────────────────────
  // nivelActual = número de día (1-7)
  temaReto: { titulo: string; descripcion: string; emoji: string } | null = null;
  alimentosFrutas: number = 0;
  alimentosVerduras: number = 0;
  alimentosProteinas: number = 0;
  alimentosCarbohidratos: number = 0;
  alimentosLacteos: number = 0;
  alimentosDulces: number = 0;
  emocionSeleccionada: string = '';
  notasReto: string = '';

  // ── COACH EXPRÉS ──────────────────────────────────────────────────────────
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
    if (this.intervalo) clearInterval(this.intervalo);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  get tiempoFormateado(): string {
    const m = Math.floor(this.tiempoTranscurrido / 60);
    const s = this.tiempoTranscurrido % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  esNutrimental(): boolean {
    const n = this.gameData.juego.nombre.toLowerCase();
    return n.includes('nutrimental') || n.includes('desafío');
  }

  esReto7Dias(): boolean {
    const n = this.gameData.juego.nombre.toLowerCase();
    return n.includes('reto') || n.includes('7 días') || n.includes('7dias');
  }

  esCoachExpres(): boolean {
    return this.gameData.juego.nombre.toLowerCase().includes('coach');
  }

  esUltimoNivel(): boolean {
    return this.nivelActual >= this.gameData.juego.maxNiveles;
  }

  // ── Obtener pool del nivel (con fallback al nivel más cercano disponible) ──
  private poolNutrimental(): any[] {
    const nivel = Math.min(Math.max(this.nivelActual, 1), 10);
    return BANCO_NUTRIMENTAL[nivel] ?? BANCO_NUTRIMENTAL[1];
  }

  private poolCoach(): any[] {
    const nivel = Math.min(Math.max(this.nivelActual, 1), 10);
    return BANCO_COACH[nivel] ?? BANCO_COACH[1];
  }

  // ── Inicio ────────────────────────────────────────────────────────────────
  iniciarJuego(): void {
    this.loading = true;
    this.loadingMessage = 'Iniciando sesión...';

    this.sesionService
      .iniciarSesion({ juegoId: this.gameData.juego.id, nivel: this.nivelActual })
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.sesionId = response.data.id;
            this.gameStarted = true;
            this.iniciarCronometro();

            if (this.esNutrimental()) {
              // Elegir 1 pregunta aleatoria del nivel
              this.preguntaNutrimental = elegirAleatoria(this.poolNutrimental());
              this.respuestaSeleccionada = null;
              this.respuestaEnviada = false;
              this.tiempoInicioRespuesta = 0;
            } else if (this.esCoachExpres()) {
              // Elegir 1 pregunta aleatoria del nivel
              this.preguntaCoach = elegirAleatoria(this.poolCoach());
              this.respuestaCoach = null;
            } else if (this.esReto7Dias()) {
              // El tema del día viene del nivel
              const dia = Math.min(Math.max(this.nivelActual, 1), 7);
              this.temaReto = TEMAS_RETO_7DIAS[dia];
              this.resetearFormularioReto();
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

  // ── NUTRIMENTAL ───────────────────────────────────────────────────────────
  enviarRespuestaNutrimental(): void {
    if (this.respuestaSeleccionada === null) return;

    this.respuestaEnviada = true;
    this.esRespuestaCorrecta =
      this.respuestaSeleccionada === this.preguntaNutrimental.respuestaCorrecta;
    const tiempoRespuesta = this.tiempoTranscurrido - this.tiempoInicioRespuesta;

    this.sesionService
      .guardarRespuestaNutrimental({
        sesionId: this.sesionId!,
        preguntaNumero: 1,
        preguntaTema: this.preguntaNutrimental.tema,
        respuestaCorrecta: this.esRespuestaCorrecta,
        tiempoRespuesta,
      })
      .subscribe({
        next: () => {
          if (this.esRespuestaCorrecta) this.puntosGanadosEnSesion += 10;
        },
        error: (err) => console.error('Error guardando respuesta:', err),
      });
  }

  // Al finalizar la pregunta nutrimental se termina el nivel
  terminarNivelNutrimental(): void {
    this.finalizarJuego(true);
  }

  // ── RETO 7 DÍAS ───────────────────────────────────────────────────────────
  calcularCalorias(): number {
    return (
      this.alimentosFrutas * 60 +
      this.alimentosVerduras * 25 +
      this.alimentosProteinas * 150 +
      this.alimentosCarbohidratos * 100 +
      this.alimentosLacteos * 120 +
      this.alimentosDulces * 200
    );
  }

  private resetearFormularioReto(): void {
    this.alimentosFrutas = 0;
    this.alimentosVerduras = 0;
    this.alimentosProteinas = 0;
    this.alimentosCarbohidratos = 0;
    this.alimentosLacteos = 0;
    this.alimentosDulces = 0;
    this.emocionSeleccionada = '';
    this.notasReto = '';
  }

  guardarRegistroReto(): void {
    if (!this.sesionId) return;

    this.loading = true;
    this.loadingMessage = 'Guardando registro del día...';

    const dia = Math.min(Math.max(this.nivelActual, 1), 7);

    this.sesionService
      .guardarRegistroReto7Dias({
        sesionId: this.sesionId,
        diaNumero: dia,
        momentoDia: 'DiáCompleto' as any,
        alimentosFrutas: this.alimentosFrutas,
        alimentosVerduras: this.alimentosVerduras,
        alimentosProteinas: this.alimentosProteinas,
        alimentosCarbohidratos: this.alimentosCarbohidratos,
        alimentosLacteos: this.alimentosLacteos,
        alimentosDulces: this.alimentosDulces,
        emocion: this.emocionSeleccionada ? (this.emocionSeleccionada as any) : undefined,
        caloriasEstimadas: this.calcularCalorias(),
        notas: this.notasReto || undefined,
      })
      .subscribe({
        next: () => {
          this.puntosGanadosEnSesion += 15;
          this.loading = false;
          this.finalizarJuego(true);
        },
        error: (err) => {
          console.error('Error guardando registro:', err);
          alert('Error al guardar el registro');
          this.loading = false;
        },
      });
  }

  // ── COACH EXPRÉS ──────────────────────────────────────────────────────────
  enviarRespuestaCoach(): void {
    if (this.respuestaCoach === null || !this.sesionId) return;

    this.loading = true;
    this.loadingMessage = 'Guardando respuesta...';

    this.sesionService
      .guardarRespuestaCoach({
        sesionId: this.sesionId,
        preguntaNumero: 1,
        preguntaEtapa: this.preguntaCoach.etapa,
        respuestaValor: this.respuestaCoach,
      })
      .subscribe({
        next: () => {
          this.puntosGanadosEnSesion += 10;
          this.loading = false;
          this.finalizarJuego(true);
        },
        error: (err) => {
          console.error('Error guardando respuesta Coach:', err);
          this.loading = false;
        },
      });
  }

  // ── Finalizar ─────────────────────────────────────────────────────────────
  finalizarJuego(completado: boolean): void {
    if (!this.sesionId) return;
    if (this.intervalo) clearInterval(this.intervalo);

    this.loading = true;
    this.loadingMessage = 'Guardando progreso...';

    if (completado) this.puntosGanadosEnSesion += this.gameData.juego.puntosPorNivel;

    this.sesionService
      .finalizarSesion({
        sesionId: this.sesionId,
        puntosObtenidos: this.puntosGanadosEnSesion,
        tiempoJugado: this.tiempoTranscurrido,
        completado,
      })
      .subscribe({
        next: (response) => {
          if (response.success) this.gameEnded = true;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error finalizando sesión:', err);
          this.loading = false;
        },
      });
  }

  continuar(): void {
    this.studentService.sumarPuntos(this.puntosGanadosEnSesion);
    this.dialogRef.close({ completed: true });
  }

  abandonar(): void {
    if (this.gameStarted && !this.gameEnded) {
      const confirmar = confirm('¿Estás seguro de que quieres abandonar? Se perderá tu progreso.');
      if (!confirmar) return;
      if (this.sesionId) this.finalizarJuego(false);
    }
    if (this.intervalo) clearInterval(this.intervalo);
    this.dialogRef.close({ completed: false });
  }
}