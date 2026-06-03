import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, MatIconModule, MatRippleModule, MatDialogModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  constructor(private router: Router, private dialog: MatDialog) {}

  navigateToLogin(role: 'student' | 'teacher' | 'admin'): void {
    this.router.navigate(['/login'], { queryParams: { role } });
  }

  openTerms(): void {
    this.dialog.open(TermsDialog, { width: '600px', maxHeight: '80vh' });
  }

  openPrivacy(): void {
    this.dialog.open(PrivacyDialog, { width: '600px', maxHeight: '80vh' });
  }
}

/* ==========================================================================
   1. COMPONENTE: TÉRMINOS Y CONDICIONES (CORREGIDO)
   ========================================================================== */
@Component({
  selector: 'terms-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title><mat-icon>gavel</mat-icon> Términos y Condiciones</h2>
    
    <mat-dialog-content class="policy-dialog">
      <p class="policy-intro">
        Al utilizar <strong>MIKHUY</strong>, aceptas los siguientes términos.
        Por favor léelos con atención.
      </p>
      <h3>1. Uso de la plataforma</h3>
      <p>MIKHUY es una plataforma educativa orientada al seguimiento nutricional
      de estudiantes de nivel secundaria. Su uso está reservado exclusivamente
      para instituciones educativas, docentes autorizados y padres o tutores
      legales de los alumnos registrados.</p>
      <h3>2. Datos de menores de edad</h3>
      <p>La plataforma recopila datos de estudiantes menores de edad, incluyendo
      información de salud como peso, talla e índice de masa corporal (IMC).
      El tratamiento de estos datos se realiza <strong>únicamente con fines
      educativos y de bienestar nutricional</strong>, bajo supervisión docente
      y con el consentimiento del padre, madre o tutor legal.</p>
      <h3>3. Responsabilidad del usuario</h3>
      <p>El usuario se compromete a utilizar la plataforma de manera responsable,
      mantener la confidencialidad de sus credenciales y no compartir información
      sensible de los alumnos con terceros no autorizados.</p>
      <h3>4. Modificaciones</h3>
      <p>Nos reservamos el derecho de actualizar estos términos en cualquier
      momento. Se notificará a los usuarios ante cambios importantes.</p>
    </mat-dialog-content>

    <mat-dialog-actions align="end" class="policy-actions">
      <button mat-raised-button mat-dialog-close class="close-btn">Entendido</button>
    </mat-dialog-actions>
  `,
  styles: [`
    :host { 
      font-family: 'Poppins', sans-serif; 
      display: flex; 
      flex-direction: column; 
      max-height: 80vh; 
      overflow: hidden; 
    }
    h2 { 
      display: flex; 
      align-items: center; 
      gap: 0.5rem; 
      color: #48a3f3; 
      font-weight: 600; 
      font-size: 1.1rem; 
      margin: 0; 
      padding: 24px 24px 12px; 
    }
    .policy-dialog { 
      padding: 0 24px 12px !important; 
      margin: 0;
      overflow-y: auto; 
    }
    .policy-actions { 
      padding: 16px 24px 24px; 
      margin: 0;
      display: flex; 
      justify-content: flex-end; 
      background-color: #ffffff; 
    }
    h3 { color: #333; font-size: 0.92rem; font-weight: 600; margin: 1.1rem 0 0.3rem; }
    p  { font-size: 0.88rem; color: #555; line-height: 1.6; margin: 0; }
    .policy-intro { background: #f0f7ff; border-left: 3px solid #48a3f3; padding: 0.6rem 0.8rem; border-radius: 4px; margin-bottom: 0.5rem; }
    .close-btn { 
      background: linear-gradient(135deg, #48a3f3, #5bb3ff) !important; 
      color: white !important; 
      font-weight: 600 !important; 
      border-radius: 24px !important; 
      padding: 0 28px !important; 
      height: 40px !important;
    }
  `]
})
export class TermsDialog {}

/* ==========================================================================
   2. COMPONENTE: POLÍTICA DE PRIVACIDAD (CORREGIDO)
   ========================================================================== */
@Component({
  selector: 'privacy-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title><mat-icon>shield</mat-icon> Política de Privacidad</h2>
    
    <mat-dialog-content class="policy-dialog">
      <p class="policy-intro">
        En <strong>MIKHUY</strong> nos comprometemos a proteger la información
        personal y de salud de todos los estudiantes registrados.
      </p>
      <h3>1. Información que recopilamos</h3>
      <p>Recopilamos datos personales básicos (nombre, correo institucional) y
      datos de salud sensibles como <strong>peso, talla, altura e IMC</strong>
      de estudiantes de nivel secundaria, ingresados por docentes autorizados.</p>
      <h3>2. Tratamiento de datos de menores</h3>
      <p>Dado que los usuarios incluyen menores de edad, aplicamos medidas
      reforzadas de protección. Los datos de salud son considerados
      <strong>datos sensibles</strong> y su acceso está restringido al personal
      docente autorizado y al padre, madre o tutor legal del estudiante.</p>
      <h3>3. Finalidad del uso de datos</h3>
      <p>Los datos recopilados se utilizan exclusivamente para el seguimiento
      nutricional y educativo del estudiante dentro del entorno escolar.
      No se comparten con terceros ni se utilizan con fines comerciales.</p>
      <h3>4. Seguridad</h3>
      <p>Implementamos medidas técnicas para proteger la información almacenada.
      El acceso a los datos requiere autenticación y está limitado por roles
      dentro de la plataforma.</p>
      <h3>5. Derechos del titular</h3>
      <p>Los padres, madres o tutores legales pueden solicitar el acceso,
      rectificación o eliminación de los datos de sus hijos contactando a la
      institución educativa responsable.</p>
    </mat-dialog-content>

    <mat-dialog-actions align="end" class="policy-actions">
      <button mat-raised-button mat-dialog-close class="close-btn">Entendido</button>
    </mat-dialog-actions>
  `,
  styles: [`
    :host { 
      font-family: 'Poppins', sans-serif; 
      display: flex; 
      flex-direction: column; 
      max-height: 80vh; 
      overflow: hidden; 
    }
    h2 { 
      display: flex; 
      align-items: center; 
      gap: 0.5rem; 
      color: #48a3f3; 
      font-weight: 600; 
      font-size: 1.1rem; 
      margin: 0; 
      padding: 24px 24px 12px; 
    }
    .policy-dialog { 
      padding: 0 24px 12px !important; 
      margin: 0;
      overflow-y: auto; 
    }
    .policy-actions { 
      padding: 16px 24px 24px; 
      margin: 0;
      display: flex; 
      justify-content: flex-end; 
      background-color: #ffffff; 
    }
    h3 { color: #333; font-size: 0.92rem; font-weight: 600; margin: 1.1rem 0 0.3rem; }
    p  { font-size: 0.88rem; color: #555; line-height: 1.6; margin: 0; }
    .policy-intro { background: #f0f7ff; border-left: 3px solid #48a3f3; padding: 0.6rem 0.8rem; border-radius: 4px; margin-bottom: 0.5rem; }
    .close-btn { 
      background: linear-gradient(135deg, #48a3f3, #5bb3ff) !important; 
      color: white !important; 
      font-weight: 600 !important; 
      border-radius: 24px !important; 
      padding: 0 28px !important; 
      height: 40px !important;
    }
  `]
})
export class PrivacyDialog {}