export interface Reto7DiasRegistro {
  id: string;
  sesion_id: string;
  dia_numero: number;
  momento_dia: 'Desayuno' | 'Almuerzo' | 'Cena';
  alimentos_frutas?: number;
  alimentos_verduras?: number;
  alimentos_proteinas?: number;
  alimentos_carbohidratos?: number;
  alimentos_lacteos?: number;
  alimentos_dulces?: number;
  emocion?: 'feliz' | 'normal' | 'triste' | 'estresado' | 'ansioso';
  calorias_estimadas?: number;
  notas?: string;
  fecha_registro?: string;
}
