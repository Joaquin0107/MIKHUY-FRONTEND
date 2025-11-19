import { Component, OnInit } from '@angular/core';
import { ChatbotService, ChatMessage } from '../../services/chatbot.service';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-floating-chatbot',
  templateUrl: './floating-chatbot.component.html',
  styleUrls: ['./floating-chatbot.component.css'], 
  imports: [MatIconModule, FormsModule, CommonModule]
})
export class FloatingChatbotComponent implements OnInit {
  isOpen = false;
  isMinimized = false;
  mensajes: ChatMessage[] = [];
  preguntaActual = '';
  cargando = false;
  error = '';

  constructor(private chatbotService: ChatbotService) {}

  ngOnInit(): void {
    this.agregarMensajeBienvenida();
  }

  toggleChat(): void {
    if (this.isMinimized) {
      this.isMinimized = false;
    } else {
      this.isOpen = !this.isOpen;
    }
  }

  minimizeChat(): void {
    this.isMinimized = true;
  }

  closeChat(): void {
    this.isOpen = false;
    this.isMinimized = false;
  }

  agregarMensajeBienvenida(): void {
    this.mensajes.push({
      texto: '¡Hola! 👋 Soy tu asistente nutricional de MIKHUY. ¿En qué puedo ayudarte hoy? Puedo responder preguntas sobre alimentación saludable, nutrientes, dietas y más.',
      esUsuario: false,
      timestamp: new Date()
    });
  }

  enviarPregunta(): void {
    if (!this.preguntaActual.trim() || this.cargando) {
      return;
    }

    const pregunta = this.preguntaActual.trim();
    this.error = '';

    // Agregar mensaje del usuario
    this.mensajes.push({
      texto: pregunta,
      esUsuario: true,
      timestamp: new Date()
    });

    this.preguntaActual = '';
    this.cargando = true;

    // Enviar consulta a la API
    this.chatbotService.enviarConsulta(pregunta).subscribe({
      next: (respuesta) => {
        this.mensajes.push({
          texto: respuesta,
          esUsuario: false,
          timestamp: new Date()
        });
        this.cargando = false;
        this.scrollAlFinal();
      },
      error: (error) => {
        this.error = 'Ocurrió un error. Por favor, intenta nuevamente.';
        this.mensajes.push({
          texto: 'Lo siento, ocurrió un error al procesar tu consulta. Por favor, intenta nuevamente en unos momentos.',
          esUsuario: false,
          timestamp: new Date()
        });
        this.cargando = false;
        this.scrollAlFinal();
      }
    });
  }

  manejarEnter(evento: KeyboardEvent): void {
    if (evento.key === 'Enter' && !evento.shiftKey) {
      evento.preventDefault();
      this.enviarPregunta();
    }
  }

  scrollAlFinal(): void {
    setTimeout(() => {
      const elemento = document.querySelector('.chat-mensajes');
      if (elemento) {
        elemento.scrollTop = elemento.scrollHeight;
      }
    }, 100);
  }

  limpiarChat(): void {
    this.mensajes = [];
    this.agregarMensajeBienvenida();
  }

  // Sugerencias rápidas
  usarSugerencia(sugerencia: string): void {
    this.preguntaActual = sugerencia;
    this.enviarPregunta();
  }
}