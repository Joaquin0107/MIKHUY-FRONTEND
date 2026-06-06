import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';

type Estado = 'cargando' | 'exito' | 'expirado' | 'invalido' | 'reenviando' | 'reenviado';

@Component({
  selector: 'app-verify',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './verify.component.html',
  styleUrls: ['./verify.component.css'],
})
export class VerifyComponent implements OnInit {

  estado: Estado = 'cargando';
  token = '';
  nuevoToken = '';       // token generado al reenviar
  nuevaUrl = '';         // URL lista para copiar

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';

    if (!this.token) {
      this.estado = 'invalido';
      return;
    }

    this.authService.activarCuenta(this.token).subscribe({
      next: (res) => {
        if (res.success) {
          this.estado = 'exito';
        } else {
          this.estado = 'invalido';
        }
      },
      error: (err) => {
        // 410 GONE → token expirado
        // 400 BAD REQUEST → token inválido
        if (err.status === 410) {
          this.estado = 'expirado';
        } else {
          this.estado = 'invalido';
        }
      },
    });
  }

  reenviar(): void {
    this.estado = 'reenviando';

    this.authService.reenviarActivacion(this.token).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.nuevoToken = res.data;
          this.nuevaUrl = `https://mikhuy-front.web.app/verify?token=${res.data}`;
          this.estado = 'reenviado';
        } else {
          this.estado = 'invalido';
        }
      },
      error: () => {
        this.estado = 'invalido';
      },
    });
  }

  copiarUrl(): void {
    navigator.clipboard.writeText(this.nuevaUrl).then(() => {
      alert('¡URL copiada al portapapeles!');
    });
  }

  irAlLogin(): void {
    this.router.navigate(['/login'], { queryParams: { role: 'student' } });
  }
}