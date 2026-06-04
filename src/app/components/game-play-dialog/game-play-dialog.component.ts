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
// BANCO — DESAFÍO NUTRIMENTAL (10 niveles × 5 preguntas)
// Al iniciar se barajan y se presentan las 5 en orden aleatorio.
// ─────────────────────────────────────────────────────────────────────────────
const BANCO_NUTRIMENTAL: Record<number, any[]> = {
  1: [
    { pregunta: '¿Cuál es la vitamina que ayuda a la visión?', opciones: ['Vitamina A','Vitamina C','Vitamina D','Vitamina E'], respuestaCorrecta: 0, tema: 'Vitaminas', explicacion: 'La vitamina A es esencial para mantener una buena visión, especialmente en condiciones de poca luz.' },
    { pregunta: '¿Cuántas comidas al día se recomiendan para una alimentación equilibrada?', opciones: ['1-2 comidas','3 comidas principales','5-6 comidas pequeñas','Cualquiera'], respuestaCorrecta: 2, tema: 'Hábitos', explicacion: 'Distribuir 5-6 comidas pequeñas ayuda a mantener estables los niveles de glucosa en sangre.' },
    { pregunta: '¿Cuál alimento es rico en fibra dietética?', opciones: ['Carne de res','Arroz blanco','Lentejas','Leche entera'], respuestaCorrecta: 2, tema: 'Fibra', explicacion: 'Las lentejas son excelente fuente de fibra, que favorece el tránsito intestinal y la saciedad.' },
    { pregunta: '¿Qué función tiene la vitamina C?', opciones: ['Fortalece los huesos','Mejora la visión nocturna','Refuerza el sistema inmune','Regula el azúcar'], respuestaCorrecta: 2, tema: 'Vitaminas', explicacion: 'La vitamina C es clave para el sistema inmunológico y actúa como antioxidante.' },
    { pregunta: '¿Cuál es un alimento de origen animal?', opciones: ['Zanahoria','Manzana','Huevo','Arroz'], respuestaCorrecta: 2, tema: 'Grupos alimenticios', explicacion: 'El huevo es un alimento de origen animal, rico en proteínas y grasas saludables.' },
  ],
  2: [
    { pregunta: '¿Qué nutriente es la principal fuente de energía del cuerpo?', opciones: ['Proteínas','Carbohidratos','Grasas','Vitaminas'], respuestaCorrecta: 1, tema: 'Macronutrientes', explicacion: 'Los carbohidratos son la principal fuente de energía para el cuerpo y el cerebro.' },
    { pregunta: '¿Cuál de estos es un carbohidrato complejo?', opciones: ['Azúcar de mesa','Miel','Avena integral','Refresco'], respuestaCorrecta: 2, tema: 'Carbohidratos', explicacion: 'La avena integral es un carbohidrato complejo que se digiere lentamente y provee energía sostenida.' },
    { pregunta: '¿Cuántos gramos de carbohidratos se recomiendan diariamente?', opciones: ['50-100 g','130-230 g','300-400 g','500-600 g'], respuestaCorrecta: 1, tema: 'Carbohidratos', explicacion: 'La recomendación general es de 130-230 g de carbohidratos al día, según la actividad física.' },
    { pregunta: '¿Qué ocurre si consumes más carbohidratos de los que quemas?', opciones: ['Se convierten en músculo','Se eliminan por la orina','Se almacenan como grasa','Se transforman en vitaminas'], respuestaCorrecta: 2, tema: 'Carbohidratos', explicacion: 'El exceso de carbohidratos que no se usa como energía se convierte en grasa y se almacena.' },
    { pregunta: '¿Cuál de estos alimentos tiene el índice glucémico más bajo?', opciones: ['Pan blanco','Papas fritas','Quinoa','Bebidas azucaradas'], respuestaCorrecta: 2, tema: 'Carbohidratos', explicacion: 'La quinoa tiene un índice glucémico bajo (~53), lo que evita picos de glucosa en sangre.' },
  ],
  3: [
    { pregunta: '¿Cuántos vasos de agua se recomienda beber al día?', opciones: ['2-3 vasos','4-5 vasos','6-8 vasos','10-12 vasos'], respuestaCorrecta: 2, tema: 'Hidratación', explicacion: 'Se recomienda beber entre 6-8 vasos de agua al día para mantenerse bien hidratado.' },
    { pregunta: '¿Cuál bebida hidrata mejor después del ejercicio?', opciones: ['Refresco','Jugo de naranja','Agua natural','Café'], respuestaCorrecta: 2, tema: 'Hidratación', explicacion: 'El agua natural es la mejor opción para rehidratarse, sin calorías ni azúcares añadidos.' },
    { pregunta: '¿Qué porcentaje del cuerpo humano está compuesto por agua?', opciones: ['30-40%','50-60%','60-70%','80-90%'], respuestaCorrecta: 2, tema: 'Hidratación', explicacion: 'Aproximadamente el 60-70% del cuerpo humano es agua, por eso la hidratación es vital.' },
    { pregunta: '¿Qué síntoma indica deshidratación leve?', opciones: ['Dolor de espalda','Orina oscura','Fiebre alta','Náuseas'], respuestaCorrecta: 1, tema: 'Hidratación', explicacion: 'La orina de color amarillo oscuro es uno de los primeros indicadores de deshidratación.' },
    { pregunta: '¿Cuánta agua adicional necesitas por cada hora de ejercicio intenso?', opciones: ['100-200 ml','500-700 ml','1-2 litros','3-4 litros'], respuestaCorrecta: 1, tema: 'Hidratación', explicacion: 'Se recomienda consumir entre 500-700 ml de agua extra por cada hora de ejercicio intenso.' },
  ],
  4: [
    { pregunta: '¿Qué mineral es importante para los huesos y dientes?', opciones: ['Hierro','Calcio','Zinc','Magnesio'], respuestaCorrecta: 1, tema: 'Minerales', explicacion: 'El calcio es fundamental para mantener huesos y dientes fuertes.' },
    { pregunta: '¿Cuál alimento es la mejor fuente de calcio?', opciones: ['Espinacas','Leche','Naranja','Pollo'], respuestaCorrecta: 1, tema: 'Minerales', explicacion: 'La leche y sus derivados son las fuentes más ricas y biodisponibles de calcio.' },
    { pregunta: '¿Qué mineral previene la anemia?', opciones: ['Calcio','Potasio','Hierro','Fósforo'], respuestaCorrecta: 2, tema: 'Minerales', explicacion: 'El hierro es necesario para producir hemoglobina; su déficit causa anemia ferropénica.' },
    { pregunta: '¿En qué alimento abunda el magnesio?', opciones: ['Leche entera','Almendras','Pollo a la plancha','Arroz blanco'], respuestaCorrecta: 1, tema: 'Minerales', explicacion: 'Las almendras son ricas en magnesio, mineral que participa en más de 300 reacciones enzimáticas.' },
    { pregunta: '¿Qué mineral regula el ritmo cardíaco y la presión arterial?', opciones: ['Zinc','Sodio','Potasio','Cobre'], respuestaCorrecta: 2, tema: 'Minerales', explicacion: 'El potasio (presente en plátano, aguacate) es clave para la función cardíaca y el equilibrio de fluidos.' },
  ],
  5: [
    { pregunta: '¿Cuál es una buena fuente de proteínas?', opciones: ['Pan','Pollo','Lechuga','Manzana'], respuestaCorrecta: 1, tema: 'Proteínas', explicacion: 'El pollo es una excelente fuente de proteína magra, esencial para el crecimiento y reparación de tejidos.' },
    { pregunta: '¿Qué función principal cumplen las proteínas en el cuerpo?', opciones: ['Dar energía rápida','Regular la temperatura','Construir y reparar tejidos','Transportar oxígeno'], respuestaCorrecta: 2, tema: 'Proteínas', explicacion: 'Las proteínas son los "ladrillos" del cuerpo: construyen músculo, piel, enzimas y anticuerpos.' },
    { pregunta: '¿Cuántos aminoácidos esenciales existen?', opciones: ['5','9','14','20'], respuestaCorrecta: 1, tema: 'Proteínas', explicacion: 'Existen 9 aminoácidos esenciales que el cuerpo no puede sintetizar y deben obtenerse de la dieta.' },
    { pregunta: '¿Cuál es una proteína de origen vegetal completa?', opciones: ['Arroz blanco','Soya','Lechuga','Zanahoria'], respuestaCorrecta: 1, tema: 'Proteínas', explicacion: 'La soya es una de las pocas proteínas vegetales que contiene los 9 aminoácidos esenciales.' },
    { pregunta: '¿Cuántos gramos de proteína al día necesita un adulto sedentario por kg de peso?', opciones: ['0.2-0.4 g/kg','0.8-1.0 g/kg','2.0-2.5 g/kg','3.0-4.0 g/kg'], respuestaCorrecta: 1, tema: 'Proteínas', explicacion: 'La recomendación para adultos sedentarios es de 0.8-1.0 g de proteína por kg de peso corporal al día.' },
  ],
  6: [
    { pregunta: '¿Cuál grasa es beneficiosa para el corazón?', opciones: ['Grasa trans','Grasa saturada','Grasa monoinsaturada','Manteca vegetal'], respuestaCorrecta: 2, tema: 'Grasas', explicacion: 'Las grasas monoinsaturadas (aceite de oliva, aguacate) reducen el colesterol LDL y protegen el corazón.' },
    { pregunta: '¿En qué alimento se encuentran los ácidos grasos omega-3?', opciones: ['Mantequilla','Salmón','Tocino','Margarina'], respuestaCorrecta: 1, tema: 'Grasas', explicacion: 'El salmón y otros pescados azules son ricos en omega-3, que reduce la inflamación y protege el cerebro.' },
    { pregunta: '¿Qué tipo de grasa debe evitarse por aumentar el riesgo cardiovascular?', opciones: ['Omega-3','Grasa monoinsaturada','Grasa trans','Grasa poliinsaturada'], respuestaCorrecta: 2, tema: 'Grasas', explicacion: 'Las grasas trans (en ultraprocesados) elevan el colesterol malo y reducen el bueno.' },
    { pregunta: '¿Qué porcentaje de las calorías diarias deberían provenir de grasas?', opciones: ['5-10%','20-35%','45-55%','60-70%'], respuestaCorrecta: 1, tema: 'Grasas', explicacion: 'Las guías nutricionales recomiendan que el 20-35% de las calorías diarias provengan de grasas saludables.' },
    { pregunta: '¿Cuál aceite es más saludable para cocinar?', opciones: ['Aceite de palma','Aceite de coco','Aceite de oliva extra virgen','Margarina hidrogenada'], respuestaCorrecta: 2, tema: 'Grasas', explicacion: 'El aceite de oliva extra virgen es rico en grasas monoinsaturadas y antioxidantes beneficiosos.' },
  ],
  7: [
    { pregunta: '¿Cuántas porciones de frutas y verduras recomienda la OMS al día?', opciones: ['1-2','3-4','5 o más','8 o más'], respuestaCorrecta: 2, tema: 'Grupos alimenticios', explicacion: 'La OMS recomienda consumir al menos 5 porciones de frutas y verduras diariamente.' },
    { pregunta: '¿Qué color de verduras indica alta presencia de betacarotenos?', opciones: ['Blanco','Morado','Naranja/amarillo','Verde oscuro'], respuestaCorrecta: 2, tema: 'Grupos alimenticios', explicacion: 'Las verduras naranja/amarillas (zanahoria, calabaza) son ricas en betacarotenos, precursores de vitamina A.' },
    { pregunta: '¿Qué grupo alimenticio debe ocupar la mayor parte del plato?', opciones: ['Proteínas','Lácteos','Frutas y verduras','Cereales refinados'], respuestaCorrecta: 2, tema: 'Grupos alimenticios', explicacion: 'El modelo "Mi Plato" propone que frutas y verduras ocupen la mitad del plato en cada comida.' },
    { pregunta: '¿Cuál es la diferencia entre cereales integrales y refinados?', opciones: ['El sabor únicamente','El color del alimento','El contenido de fibra y nutrientes','El precio en el mercado'], respuestaCorrecta: 2, tema: 'Grupos alimenticios', explicacion: 'Los cereales integrales conservan el salvado y germen, aportando más fibra, vitaminas y minerales.' },
    { pregunta: '¿Cuál de estos alimentos pertenece al grupo de leguminosas?', opciones: ['Brócoli','Frijoles','Naranja','Queso'], respuestaCorrecta: 1, tema: 'Grupos alimenticios', explicacion: 'Los frijoles son leguminosas, ricas en proteína vegetal, fibra, hierro y zinc.' },
  ],
  8: [
    { pregunta: '¿Qué índice mide la velocidad con que un alimento eleva el azúcar en sangre?', opciones: ['Índice de masa corporal','Índice glucémico','Valor nutricional','Índice metabólico'], respuestaCorrecta: 1, tema: 'Glucemia', explicacion: 'El índice glucémico (IG) indica qué tan rápido sube la glucosa en sangre tras consumir un alimento.' },
    { pregunta: '¿Cuál alimento tiene índice glucémico bajo?', opciones: ['Pan blanco','Sandía','Lentejas','Papas fritas'], respuestaCorrecta: 2, tema: 'Glucemia', explicacion: 'Las lentejas tienen IG bajo (aprox. 29), lo que genera una subida lenta y sostenida de glucosa.' },
    { pregunta: '¿Qué hormona regula el azúcar en sangre?', opciones: ['Adrenalina','Insulina','Testosterona','Cortisol'], respuestaCorrecta: 1, tema: 'Glucemia', explicacion: 'La insulina, producida en el páncreas, permite que las células absorban la glucosa de la sangre.' },
    { pregunta: '¿Qué combinación reduce mejor el pico glucémico de una comida?', opciones: ['Carbohidrato + azúcar','Carbohidrato + grasa + fibra','Solo proteína','Agua + carbohidrato'], respuestaCorrecta: 1, tema: 'Glucemia', explicacion: 'Combinar carbohidratos con fibra, proteína y grasa saludable reduce la velocidad de absorción de la glucosa.' },
    { pregunta: '¿Cuál es el rango normal de glucosa en ayunas?', opciones: ['40-60 mg/dL','70-100 mg/dL','120-140 mg/dL','150-200 mg/dL'], respuestaCorrecta: 1, tema: 'Glucemia', explicacion: 'El rango normal de glucosa en ayunas es de 70-100 mg/dL; valores superiores pueden indicar prediabetes.' },
  ],
  9: [
    { pregunta: '¿Qué alimento ultraprocesado conviene reducir para prevenir enfermedades crónicas?', opciones: ['Avena','Embutidos','Nueces','Yogur natural'], respuestaCorrecta: 1, tema: 'Alimentación saludable', explicacion: 'Los embutidos son ultraprocesados con alto contenido en sodio, grasas saturadas y conservadores dañinos.' },
    { pregunta: '¿Cuánto sodio diario recomienda la OMS como máximo?', opciones: ['500 mg','1000 mg','2000 mg','5000 mg'], respuestaCorrecta: 2, tema: 'Alimentación saludable', explicacion: 'La OMS recomienda menos de 2000 mg de sodio al día para proteger la salud cardiovascular.' },
    { pregunta: '¿Cuál es la principal causa de obesidad a nivel mundial?', opciones: ['Genética exclusivamente','Desequilibrio entre calorías ingeridas y gastadas','Falta de vitaminas','Exceso de agua'], respuestaCorrecta: 1, tema: 'Alimentación saludable', explicacion: 'La obesidad se debe principalmente a consumir más calorías de las que el cuerpo gasta, junto a factores ambientales.' },
    { pregunta: '¿Qué significa la sigla NOVA en alimentación?', opciones: ['Un tipo de vitamina','Sistema de clasificación de alimentos según procesamiento','Marca de suplementos','Protocolo de ayuno'], respuestaCorrecta: 1, tema: 'Alimentación saludable', explicacion: 'NOVA clasifica los alimentos en 4 grupos según su grado de procesamiento industrial.' },
    { pregunta: '¿Cuál hábito favorece la absorción de hierro de origen vegetal?', opciones: ['Beber café con la comida','Consumir vitamina C junto al alimento','Cocinar con aceite de palma','Comer lácteos en cada comida'], respuestaCorrecta: 1, tema: 'Alimentación saludable', explicacion: 'La vitamina C (naranja, limón) tomada junto a fuentes de hierro vegetal mejora su absorción significativamente.' },
  ],
  10: [
    { pregunta: '¿Cuál es el rol de los antioxidantes en la alimentación?', opciones: ['Aumentar calorías','Neutralizar radicales libres','Reducir proteínas','Elevar el colesterol'], respuestaCorrecta: 1, tema: 'Nutrición avanzada', explicacion: 'Los antioxidantes (vitaminas C, E, polifenoles) neutralizan radicales libres, reduciendo el estrés oxidativo.' },
    { pregunta: '¿Qué vitamina se sintetiza principalmente por exposición al sol?', opciones: ['Vitamina A','Vitamina B12','Vitamina C','Vitamina D'], respuestaCorrecta: 3, tema: 'Nutrición avanzada', explicacion: 'La vitamina D se produce en la piel al recibir radiación UVB solar; es clave para la absorción de calcio.' },
    { pregunta: '¿Qué es la microbiota intestinal?', opciones: ['Un tipo de vitamina','Los microbios benéficos del intestino','Una hormona digestiva','Un tipo de fibra'], respuestaCorrecta: 1, tema: 'Nutrición avanzada', explicacion: 'La microbiota intestinal es el conjunto de microorganismos que habitan el intestino y son esenciales para la digestión e inmunidad.' },
    { pregunta: '¿Qué alimentos son prebióticos?', opciones: ['Yogur y kéfir','Ajo, cebolla y espárrago','Carne roja y huevo','Arroz y pasta'], respuestaCorrecta: 1, tema: 'Nutrición avanzada', explicacion: 'Los prebióticos (ajo, cebolla, espárrago) son fibras que alimentan a las bacterias benéficas del intestino.' },
    { pregunta: '¿Qué es la inflamación crónica de bajo grado en relación a la dieta?', opciones: ['Una reacción alérgica inmediata','Una respuesta inflamatoria persistente ligada a dietas ricas en ultraprocesados','Un proceso digestivo normal','La digestión de grasas'], respuestaCorrecta: 1, tema: 'Nutrición avanzada', explicacion: 'La inflamación crónica de bajo grado, favorecida por dietas ultraprocesadas, está asociada a diabetes, obesidad y enfermedades cardíacas.' },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// BANCO — COACH EXPRÉS (10 niveles × 8 preguntas de escala 1-5)
// Al iniciar se barajan y se presentan las 8 en orden aleatorio.
// ─────────────────────────────────────────────────────────────────────────────
const BANCO_COACH: Record<number, any[]> = {
  1: [
    { pregunta: '¿Qué tan importante es para ti mejorar tu alimentación?', etapa: 'Pre-contemplación' },
    { pregunta: '¿Piensas en cómo mejorar tus hábitos de alimentación?', etapa: 'Pre-contemplación' },
    { pregunta: '¿Crees que tu forma de comer actual podría mejorar?', etapa: 'Pre-contemplación' },
    { pregunta: '¿Has escuchado hablar sobre una alimentación balanceada?', etapa: 'Pre-contemplación' },
    { pregunta: '¿Te preocupa el impacto de tu dieta en tu salud futura?', etapa: 'Pre-contemplación' },
    { pregunta: '¿Consideras que la alimentación influye en tu bienestar diario?', etapa: 'Pre-contemplación' },
    { pregunta: '¿Has notado relación entre lo que comes y cómo te sientes?', etapa: 'Pre-contemplación' },
    { pregunta: '¿Estarías dispuesto a aprender más sobre nutrición saludable?', etapa: 'Pre-contemplación' },
  ],
  2: [
    { pregunta: '¿Consideras que tu alimentación actual necesita cambios?', etapa: 'Contemplación' },
    { pregunta: '¿Has pensado seriamente en cambiar lo que comes?', etapa: 'Contemplación' },
    { pregunta: '¿Reconoces los beneficios de comer de forma más saludable?', etapa: 'Contemplación' },
    { pregunta: '¿Te has informado sobre qué cambios harían tu dieta más nutritiva?', etapa: 'Contemplación' },
    { pregunta: '¿Has comparado tu alimentación actual con una dieta ideal?', etapa: 'Contemplación' },
    { pregunta: '¿Sientes que los cambios alimenticios podrían mejorar tu energía?', etapa: 'Contemplación' },
    { pregunta: '¿Has identificado qué hábitos alimenticios quieres cambiar?', etapa: 'Contemplación' },
    { pregunta: '¿Ves los cambios en tu dieta como algo alcanzable para ti?', etapa: 'Contemplación' },
  ],
  3: [
    { pregunta: '¿Estás listo para hacer cambios en tu dieta esta semana?', etapa: 'Preparación' },
    { pregunta: '¿Has planeado cómo vas a mejorar tu alimentación?', etapa: 'Preparación' },
    { pregunta: '¿Tienes metas claras sobre lo que quieres comer?', etapa: 'Preparación' },
    { pregunta: '¿Has investigado recetas o alimentos más saludables recientemente?', etapa: 'Preparación' },
    { pregunta: '¿Has organizado tu despensa para apoyar una alimentación saludable?', etapa: 'Preparación' },
    { pregunta: '¿Tienes un plan de comidas para la próxima semana?', etapa: 'Preparación' },
    { pregunta: '¿Has consultado con alguien (nutriólogo, médico) sobre tu dieta?', etapa: 'Preparación' },
    { pregunta: '¿Sientes que tienes todo lo necesario para empezar a comer mejor?', etapa: 'Preparación' },
  ],
  4: [
    { pregunta: '¿Has intentado mejorar tus hábitos alimenticios recientemente?', etapa: 'Acción' },
    { pregunta: '¿Has sustituido alimentos poco saludables esta semana?', etapa: 'Acción' },
    { pregunta: '¿Estás tomando medidas concretas para comer mejor?', etapa: 'Acción' },
    { pregunta: '¿Has comenzado a incluir más frutas y verduras en tu dieta?', etapa: 'Acción' },
    { pregunta: '¿Has reducido el consumo de azúcar o alimentos procesados?', etapa: 'Acción' },
    { pregunta: '¿Estás leyendo las etiquetas nutricionales al comprar alimentos?', etapa: 'Acción' },
    { pregunta: '¿Has preparado más comidas en casa para controlar tu alimentación?', etapa: 'Acción' },
    { pregunta: '¿Estás registrando lo que comes para mejorar tus hábitos?', etapa: 'Acción' },
  ],
  5: [
    { pregunta: '¿Te sientes capaz de mantener una alimentación saludable a largo plazo?', etapa: 'Mantenimiento' },
    { pregunta: '¿Tus nuevos hábitos de alimentación se han vuelto parte de tu rutina?', etapa: 'Mantenimiento' },
    { pregunta: '¿Puedes resistir la tentación de comer alimentos poco saludables?', etapa: 'Mantenimiento' },
    { pregunta: '¿Sigues cumpliendo tus metas de alimentación después de varios días?', etapa: 'Mantenimiento' },
    { pregunta: '¿Encuentras fácil mantener tus cambios alimenticios en tu día a día?', etapa: 'Mantenimiento' },
    { pregunta: '¿Has recaído en malos hábitos y logrado retomar tu plan?', etapa: 'Mantenimiento' },
    { pregunta: '¿Tu entorno te facilita mantener una alimentación saludable?', etapa: 'Mantenimiento' },
    { pregunta: '¿Celebras tus logros relacionados con una mejor alimentación?', etapa: 'Mantenimiento' },
  ],
  6: [
    { pregunta: '¿Cuentas con apoyo familiar para mejorar tu alimentación?', etapa: 'Apoyo Social' },
    { pregunta: '¿Tu círculo cercano te anima a comer de forma saludable?', etapa: 'Apoyo Social' },
    { pregunta: '¿Compartes comidas saludables con personas de tu entorno?', etapa: 'Apoyo Social' },
    { pregunta: '¿Tienes amigos o familiares con hábitos alimenticios saludables?', etapa: 'Apoyo Social' },
    { pregunta: '¿Tu entorno laboral facilita o dificulta comer saludablemente?', etapa: 'Apoyo Social' },
    { pregunta: '¿Alguien cercano te ha motivado a mejorar tu alimentación?', etapa: 'Apoyo Social' },
    { pregunta: '¿Participas en grupos o comunidades sobre alimentación saludable?', etapa: 'Apoyo Social' },
    { pregunta: '¿Te resulta difícil comer sano cuando comes con otras personas?', etapa: 'Apoyo Social' },
  ],
  7: [
    { pregunta: '¿Conoces los beneficios de una alimentación balanceada para tu salud?', etapa: 'Conocimiento' },
    { pregunta: '¿Sabes identificar alimentos ultraprocesados en el supermercado?', etapa: 'Conocimiento' },
    { pregunta: '¿Entiendes qué significa leer una etiqueta nutricional?', etapa: 'Conocimiento' },
    { pregunta: '¿Conoces la diferencia entre macronutrientes y micronutrientes?', etapa: 'Conocimiento' },
    { pregunta: '¿Sabes cuántas porciones de cada grupo alimenticio debes consumir?', etapa: 'Conocimiento' },
    { pregunta: '¿Conoces los riesgos de una dieta alta en sodio y azúcares?', etapa: 'Conocimiento' },
    { pregunta: '¿Puedes distinguir entre una grasa saludable y una dañina?', etapa: 'Conocimiento' },
    { pregunta: '¿Sabes qué alimentos son ricos en fibra y por qué son importantes?', etapa: 'Conocimiento' },
  ],
  8: [
    { pregunta: '¿Estás motivado para alcanzar tus metas nutricionales?', etapa: 'Motivación' },
    { pregunta: '¿La idea de tener mejor salud te impulsa a comer bien?', etapa: 'Motivación' },
    { pregunta: '¿Te sientes entusiasmado con los cambios que has hecho en tu dieta?', etapa: 'Motivación' },
    { pregunta: '¿Visualizas cómo será tu salud si mantienes una buena alimentación?', etapa: 'Motivación' },
    { pregunta: '¿Tienes razones personales fuertes para mejorar tu alimentación?', etapa: 'Motivación' },
    { pregunta: '¿Te pones metas específicas relacionadas con tu nutrición?', etapa: 'Motivación' },
    { pregunta: '¿Te recompensas cuando logras tus metas de alimentación saludable?', etapa: 'Motivación' },
    { pregunta: '¿Sientes que mejorar tu dieta vale el esfuerzo que requiere?', etapa: 'Motivación' },
  ],
  9: [
    { pregunta: '¿Logras comer saludable incluso en situaciones de estrés?', etapa: 'Autoeficacia' },
    { pregunta: '¿Confías en tu capacidad para rechazar alimentos poco saludables?', etapa: 'Autoeficacia' },
    { pregunta: '¿Puedes mantener tus hábitos saludables cuando comes fuera de casa?', etapa: 'Autoeficacia' },
    { pregunta: '¿Eres capaz de planificar tus comidas con anticipación?', etapa: 'Autoeficacia' },
    { pregunta: '¿Puedes controlar tus porciones de comida sin esfuerzo excesivo?', etapa: 'Autoeficacia' },
    { pregunta: '¿Logras elegir opciones saludables en reuniones sociales?', etapa: 'Autoeficacia' },
    { pregunta: '¿Te recuperas fácilmente si un día no comes de forma saludable?', etapa: 'Autoeficacia' },
    { pregunta: '¿Sientes que tienes el control sobre tus decisiones alimenticias?', etapa: 'Autoeficacia' },
  ],
  10: [
    { pregunta: '¿Has logrado mantener tus metas de alimentación durante más de un mes?', etapa: 'Consolidación' },
    { pregunta: '¿Tu bienestar general ha mejorado gracias a tus cambios alimenticios?', etapa: 'Consolidación' },
    { pregunta: '¿Serías capaz de guiar a alguien más en mejorar su alimentación?', etapa: 'Consolidación' },
    { pregunta: '¿Sientes que una alimentación saludable es parte de tu identidad?', etapa: 'Consolidación' },
    { pregunta: '¿Mantienes tus hábitos saludables incluso en vacaciones o días festivos?', etapa: 'Consolidación' },
    { pregunta: '¿Notas diferencias físicas y emocionales desde que mejoró tu dieta?', etapa: 'Consolidación' },
    { pregunta: '¿Tu relación con la comida es más consciente y equilibrada ahora?', etapa: 'Consolidación' },
    { pregunta: '¿Consideras que puedes mantener estos hábitos de por vida?', etapa: 'Consolidación' },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// BANCO — RETO 7 DÍAS (7 niveles = 7 días con tema diferente)
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
// Helper: baraja un array (Fisher-Yates) y devuelve una copia
// ─────────────────────────────────────────────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
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

  // ── Instrucciones / pausa ─────────────────────────────────────────────────
  mostrandoInstrucciones: boolean = false;
  tiempoAcumuladoAlPausar: number = 0;   // segundos acumulados antes de pausar

  sesionId: string | null = null;
  tiempoInicio: number = 0;
  tiempoTranscurrido: number = 0;
  intervalo: any;

  // ── NUTRIMENTAL ── 5 preguntas barajadas por nivel ────────────────────────
  preguntasNivelNutrimental: any[] = [];   // pool barajado de 5
  preguntaActualNutrimental: number = 0;   // índice 0-4
  readonly TOTAL_PREGUNTAS_NUTRIMENTAL = 5;
  preguntaNutrimental: any = null;
  respuestaSeleccionada: number | null = null;
  respuestaEnviada: boolean = false;
  esRespuestaCorrecta: boolean = false;
  tiempoInicioRespuesta: number = 0;

  // ── RETO 7 DÍAS ───────────────────────────────────────────────────────────
  temaReto: { titulo: string; descripcion: string; emoji: string } | null = null;
  alimentosFrutas: number = 0;
  alimentosVerduras: number = 0;
  alimentosProteinas: number = 0;
  alimentosCarbohidratos: number = 0;
  alimentosLacteos: number = 0;
  alimentosDulces: number = 0;
  emocionSeleccionada: string = '';
  notasReto: string = '';

  // ── COACH EXPRÉS ── 8 preguntas barajadas por nivel ──────────────────────
  preguntasNivelCoach: any[] = [];         // pool barajado de 8
  preguntaCoachActual: number = 0;         // índice 0-7
  readonly TOTAL_PREGUNTAS_COACH = 8;
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
  ngOnDestroy(): void { if (this.intervalo) clearInterval(this.intervalo); }

  // ── Utilidades ────────────────────────────────────────────────────────────
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

  private nivelKey(max: number): number {
    return Math.min(Math.max(this.nivelActual, 1), max);
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
              const pool = BANCO_NUTRIMENTAL[this.nivelKey(10)] ?? BANCO_NUTRIMENTAL[1];
              this.preguntasNivelNutrimental = shuffle(pool).slice(0, this.TOTAL_PREGUNTAS_NUTRIMENTAL);
              this.preguntaActualNutrimental = 0;
              this.cargarPreguntaNutrimental();

            } else if (this.esCoachExpres()) {
              const pool = BANCO_COACH[this.nivelKey(10)] ?? BANCO_COACH[1];
              this.preguntasNivelCoach = shuffle(pool).slice(0, this.TOTAL_PREGUNTAS_COACH);
              this.preguntaCoachActual = 0;
              this.cargarPreguntaCoach();

            } else if (this.esReto7Dias()) {
              this.temaReto = TEMAS_RETO_7DIAS[this.nivelKey(7)];
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
    this.tiempoAcumuladoAlPausar = 0;
    this.tiempoInicio = Date.now();
    this.intervalo = setInterval(() => {
      this.tiempoTranscurrido = this.tiempoAcumuladoAlPausar +
        Math.floor((Date.now() - this.tiempoInicio) / 1000);
    }, 1000);
  }

  pausarCronometro(): void {
    if (this.intervalo) {
      clearInterval(this.intervalo);
      this.intervalo = null;
      this.tiempoAcumuladoAlPausar = this.tiempoTranscurrido;
    }
  }

  reanudarCronometro(): void {
    if (!this.intervalo) {
      this.tiempoInicio = Date.now();
      this.intervalo = setInterval(() => {
        this.tiempoTranscurrido = this.tiempoAcumuladoAlPausar +
          Math.floor((Date.now() - this.tiempoInicio) / 1000);
      }, 1000);
    }
  }

  abrirInstrucciones(): void {
    if (this.gameStarted && !this.gameEnded) this.pausarCronometro();
    this.mostrandoInstrucciones = true;
  }

  cerrarInstrucciones(): void {
    this.mostrandoInstrucciones = false;
    if (this.gameStarted && !this.gameEnded) this.reanudarCronometro();
  }

  instruccionesDelJuego(): { titulo: string; pasos: string[] } {
    if (this.esNutrimental()) {
      return {
        titulo: '¿Cómo jugar Desafío Nutrimental?',
        pasos: [
          '📋 Se te presentarán 5 preguntas de opción múltiple sobre nutrición.',
          '🎯 Selecciona la respuesta que consideres correcta y presiona "Responder".',
          '✅ Recibirás retroalimentación inmediata y una explicación de la respuesta.',
          '⭐ Ganas 10 puntos por cada respuesta correcta.',
          '⏱️ El tiempo cuenta, ¡trata de responder con precisión y rapidez!',
          '🔀 Las preguntas son aleatorias cada vez que juegas el mismo nivel.',
        ],
      };
    }
    if (this.esCoachExpres()) {
      return {
        titulo: '¿Cómo funciona Coach Exprés?',
        pasos: [
          '🧠 Responderás 8 preguntas basadas en el modelo transteórico del cambio.',
          '📊 Cada pregunta tiene una escala del 1 al 5: desde "Totalmente en desacuerdo" hasta "Totalmente de acuerdo".',
          '🎯 Responde con honestidad; no hay respuestas incorrectas.',
          '⭐ Ganas 5 puntos por cada pregunta completada.',
          '💡 Tus respuestas ayudan a identificar tu etapa de cambio en hábitos saludables.',
          '🔀 Las preguntas son aleatorias dentro de la etapa de cada nivel.',
        ],
      };
    }
    if (this.esReto7Dias()) {
      return {
        titulo: '¿Cómo funciona el Reto 7 Días?',
        pasos: [
          '📅 Cada nivel representa un día del reto (del día 1 al día 7).',
          '🍽️ Registra la cantidad de porciones de cada grupo alimenticio que consumiste hoy.',
          '😊 Indica cómo te sentiste durante el día.',
          '📝 Puedes añadir notas personales sobre tu experiencia.',
          '⭐ Ganas 15 puntos al completar el registro de cada día.',
          '📈 Al finalizar los 7 días habrás completado el reto y obtendrás todos tus puntos.',
        ],
      };
    }
    return { titulo: 'Instrucciones', pasos: ['Sigue las indicaciones en pantalla.'] };
  }

  // ── NUTRIMENTAL ───────────────────────────────────────────────────────────
  private cargarPreguntaNutrimental(): void {
    this.preguntaNutrimental = this.preguntasNivelNutrimental[this.preguntaActualNutrimental];
    this.respuestaSeleccionada = null;
    this.respuestaEnviada = false;
    this.tiempoInicioRespuesta = this.tiempoTranscurrido;
  }

  enviarRespuestaNutrimental(): void {
    if (this.respuestaSeleccionada === null) return;

    this.respuestaEnviada = true;
    this.esRespuestaCorrecta = this.respuestaSeleccionada === this.preguntaNutrimental.respuestaCorrecta;
    const tiempoRespuesta = this.tiempoTranscurrido - this.tiempoInicioRespuesta;

    this.sesionService.guardarRespuestaNutrimental({
      sesionId: this.sesionId!,
      preguntaNumero: this.preguntaActualNutrimental + 1,
      preguntaTema: this.preguntaNutrimental.tema,
      respuestaCorrecta: this.esRespuestaCorrecta,
      tiempoRespuesta,
    }).subscribe({
      next: () => { if (this.esRespuestaCorrecta) this.puntosGanadosEnSesion += 10; },
      error: (err) => console.error('Error guardando respuesta:', err),
    });
  }

  siguientePreguntaNutrimental(): void {
    this.preguntaActualNutrimental++;
    if (this.preguntaActualNutrimental < this.TOTAL_PREGUNTAS_NUTRIMENTAL) {
      this.cargarPreguntaNutrimental();
    } else {
      this.finalizarJuego(true);
    }
  }

  // ── RETO 7 DÍAS ───────────────────────────────────────────────────────────
  calcularCalorias(): number {
    return this.alimentosFrutas * 60 + this.alimentosVerduras * 25 +
           this.alimentosProteinas * 150 + this.alimentosCarbohidratos * 100 +
           this.alimentosLacteos * 120 + this.alimentosDulces * 200;
  }

  private resetearFormularioReto(): void {
    this.alimentosFrutas = 0; this.alimentosVerduras = 0;
    this.alimentosProteinas = 0; this.alimentosCarbohidratos = 0;
    this.alimentosLacteos = 0; this.alimentosDulces = 0;
    this.emocionSeleccionada = ''; this.notasReto = '';
  }

  // ── localStorage helpers ─────────────────────────────────────────────────
  /** Clave única por usuario + día del reto */
  private retoStorageKey(dia: number): string {
    const uid =
      this.gameData?.estudianteId ||
      this.gameData?.alumnoId ||
      this.gameData?.userId ||
      JSON.parse(localStorage.getItem('currentUser') || '{}')?.id ||
      'unknown';
    return `mikhuy_reto7_${uid}_dia${dia}`;
  }

  /** Guarda el registro del día en localStorage y retorna el objeto guardado */
  private guardarRetoEnLocalStorage(): any {
    const dia = this.nivelKey(7);
    const registro = {
      dia,
      fecha: new Date().toISOString().split('T')[0],
      alimentosFrutas:        this.alimentosFrutas,
      alimentosVerduras:      this.alimentosVerduras,
      alimentosProteinas:     this.alimentosProteinas,
      alimentosCarbohidratos: this.alimentosCarbohidratos,
      alimentosLacteos:       this.alimentosLacteos,
      alimentosDulces:        this.alimentosDulces,
      emocion:                this.emocionSeleccionada,
      caloriasEstimadas:      this.calcularCalorias(),
      notas:                  this.notasReto || '',
      guardadoOffline:        true,
      timestamp:              Date.now(),
    };
    try {
      localStorage.setItem(this.retoStorageKey(dia), JSON.stringify(registro));
    } catch (e) {
      console.warn('localStorage no disponible:', e);
    }
    return registro;
  }

  guardarRegistroReto(): void {
    if (!this.sesionId) return;
    this.loading = true;
    this.loadingMessage = 'Guardando registro del día...';

    this.sesionService.guardarRegistroReto7Dias({
      sesionId: this.sesionId,
      diaNumero: this.nivelKey(7),
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
    }).subscribe({
      next: () => {
        // Éxito en backend → también actualizamos localStorage como caché
        this.guardarRetoEnLocalStorage();
        this.puntosGanadosEnSesion += 15;
        this.loading = false;
        this.finalizarJuego(true);
      },
      error: (err) => {
        console.warn('Backend no disponible, guardando offline:', err);
        // Fallback: guardar en localStorage y continuar el juego
        this.guardarRetoEnLocalStorage();
        this.puntosGanadosEnSesion += 15;
        this.loading = false;
        this.finalizarJuego(true);
      },
    });
  }

  // ── COACH EXPRÉS ──────────────────────────────────────────────────────────
  private cargarPreguntaCoach(): void {
    this.preguntaCoach = this.preguntasNivelCoach[this.preguntaCoachActual];
    this.respuestaCoach = null;
  }

  enviarRespuestaCoach(): void {
    if (this.respuestaCoach === null || !this.sesionId) return;
    this.loading = true;
    this.loadingMessage = 'Guardando respuesta...';

    this.sesionService.guardarRespuestaCoach({
      sesionId: this.sesionId,
      preguntaNumero: this.preguntaCoachActual + 1,
      preguntaEtapa: this.preguntaCoach.etapa,
      respuestaValor: this.respuestaCoach,
    }).subscribe({
      next: () => {
        this.puntosGanadosEnSesion += 5;
        this.preguntaCoachActual++;

        if (this.preguntaCoachActual < this.TOTAL_PREGUNTAS_COACH) {
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

  // ── Finalizar ─────────────────────────────────────────────────────────────
  finalizarJuego(completado: boolean): void {
    if (!this.sesionId) return;
    if (this.intervalo) clearInterval(this.intervalo);
    this.loading = true;
    this.loadingMessage = 'Guardando progreso...';
    if (completado) this.puntosGanadosEnSesion += this.gameData.juego.puntosPorNivel;

    this.sesionService.finalizarSesion({
      sesionId: this.sesionId,
      puntosObtenidos: this.puntosGanadosEnSesion,
      tiempoJugado: this.tiempoTranscurrido,
      completado,
    }).subscribe({
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