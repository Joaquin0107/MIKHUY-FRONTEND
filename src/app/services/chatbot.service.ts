import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, map, retry } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface ChatMessage {
  texto: string;
  esUsuario: boolean;
  timestamp: Date;
}

export interface ChatResponse {
  respuesta: string;
  timestamp: string;
  modelo?: string;
}

export interface ErrorResponse {
  error: string;
  mensaje: string;
  timestamp?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
    
  private apiUrl = `${environment.apiUrl}/api/chatbot`;  // ⬅️ REEMPLAZADO
  
  // Subject para mantener el historial del chat (opcional)
  private chatHistory$ = new BehaviorSubject<ChatMessage[]>([]);
  
  constructor(private http: HttpClient) {
    this.initializeChatHistory();
  }

  /**
   * Inicializa el historial del chat con el mensaje de bienvenida
   */
  private initializeChatHistory(): void {
    const welcomeMessage: ChatMessage = {
      texto: '¡Hola! 👋 Soy tu asistente nutricional de MIKHUY. ¿En qué puedo ayudarte hoy?',
      esUsuario: false,
      timestamp: new Date()
    };
    this.chatHistory$.next([welcomeMessage]);
  }

  /**
   * Envía una consulta al chatbot
   * @param pregunta - La pregunta del usuario
   * @returns Observable con la respuesta del chatbot
   */
  enviarConsulta(pregunta: string): Observable<string> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const body = { pregunta: pregunta.trim() };

    return this.http.post<ChatResponse>(
      `${this.apiUrl}/consulta`,
      body,
      { headers }
    ).pipe(
      retry(1), // Reintenta una vez si falla
      map(response => {
        // Agregar al historial
        this.addToHistory(pregunta, true);
        this.addToHistory(response.respuesta, false);
        return response.respuesta;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Verifica el estado de salud del API
   * @returns Observable con el estado del servicio
   */
  verificarSalud(): Observable<any> {
    return this.http.get(`${this.apiUrl}/health`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Obtiene los modelos disponibles (opcional)
   * @returns Observable con la lista de modelos
   */
  obtenerModelosDisponibles(): Observable<any> {
    return this.http.get(`${this.apiUrl}/modelos`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Agrega un mensaje al historial
   * @param texto - Texto del mensaje
   * @param esUsuario - Indica si el mensaje es del usuario
   */
  private addToHistory(texto: string, esUsuario: boolean): void {
    const currentHistory = this.chatHistory$.value;
    const newMessage: ChatMessage = {
      texto,
      esUsuario,
      timestamp: new Date()
    };
    this.chatHistory$.next([...currentHistory, newMessage]);
  }

  /**
   * Obtiene el historial del chat como Observable
   * @returns Observable del historial
   */
  getChatHistory(): Observable<ChatMessage[]> {
    return this.chatHistory$.asObservable();
  }

  /**
   * Limpia el historial del chat
   */
  limpiarHistorial(): void {
    this.initializeChatHistory();
  }

  /**
   * Obtiene el historial actual
   * @returns Array de mensajes
   */
  getHistorialActual(): ChatMessage[] {
    return this.chatHistory$.value;
  }

  /**
   * Manejo centralizado de errores
   * @param error - Error HTTP
   * @returns Observable con el error
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ocurrió un error al procesar tu consulta.';

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      console.error('Error del cliente:', error.error.message);
      errorMessage = 'Error de conexión. Verifica tu internet.';
    } else {
      // Error del lado del servidor
      console.error(
        `Error del servidor. Código: ${error.status}, ` +
        `Mensaje: ${error.message}`
      );

      switch (error.status) {
        case 0:
          errorMessage = 'No se puede conectar con el servidor. Verifica que esté ejecutándose.';
          break;
        case 400:
          errorMessage = error.error?.mensaje || 'Solicitud inválida.';
          break;
        case 401:
          errorMessage = 'No autorizado. Verifica tu API key.';
          break;
        case 429:
          errorMessage = 'Demasiadas solicitudes. Espera un momento e intenta nuevamente.';
          break;
        case 500:
        case 503:
          errorMessage = 'Error en el servidor. Intenta nuevamente más tarde.';
          break;
        default:
          errorMessage = error.error?.mensaje || 'Error desconocido. Intenta nuevamente.';
      }
    }

    return throwError(() => new Error(errorMessage));
  }

  /**
   * Valida una pregunta antes de enviarla
   * @param pregunta - La pregunta a validar
   * @returns true si es válida, false si no
   */
  validarPregunta(pregunta: string): { valida: boolean; mensaje?: string } {
    if (!pregunta || pregunta.trim().length === 0) {
      return { valida: false, mensaje: 'La pregunta no puede estar vacía.' };
    }

    if (pregunta.length > 1000) {
      return { valida: false, mensaje: 'La pregunta es demasiado larga (máximo 1000 caracteres).' };
    }

    if (pregunta.trim().length < 3) {
      return { valida: false, mensaje: 'La pregunta es demasiado corta.' };
    }

    return { valida: true };
  }

  /**
   * Obtiene sugerencias de preguntas
   * @returns Array de preguntas sugeridas
   */
  obtenerSugerencias(): string[] {
    return [
      '¿Qué alimentos son ricos en proteínas?',
      '¿Cómo puedo crear una dieta balanceada?',
      '¿Cuáles son los beneficios de las frutas?',
      '¿Qué vitaminas necesito consumir diariamente?',
      '¿Cuánta agua debo beber al día?',
      '¿Qué son los carbohidratos complejos?',
      '¿Cómo puedo aumentar mi consumo de fibra?',
      '¿Qué alimentos ayudan a mejorar la concentración?'
    ];
  }

  /**
   * Formatea un mensaje para mostrar
   * @param mensaje - El mensaje a formatear
   * @returns Mensaje formateado
   */
  formatearMensaje(mensaje: string): string {
    // Aquí puedes agregar lógica para formatear el mensaje
    // Por ejemplo, convertir URLs en links, etc.
    return mensaje.trim();
  }

  /**
   * Exporta el historial del chat
   * @returns String con el historial en formato texto
   */
  exportarHistorial(): string {
    const historial = this.chatHistory$.value;
    let texto = 'HISTORIAL DE CHAT - MIKHUY\n';
    texto += '================================\n\n';

    historial.forEach((mensaje, index) => {
      const rol = mensaje.esUsuario ? 'Usuario' : 'Asistente';
      const fecha = mensaje.timestamp.toLocaleString('es-PE');
      texto += `[${fecha}] ${rol}:\n${mensaje.texto}\n\n`;
    });

    return texto;
  }

  /**
   * Descarga el historial del chat como archivo .txt
   */
  descargarHistorial(): void {
    const contenido = this.exportarHistorial();
    const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chat-mikhuy-${new Date().getTime()}.txt`;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}