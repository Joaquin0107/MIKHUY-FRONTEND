import { DashboardsComponent } from './components/dashboards/dashboards.component';
import { BeneficiosComponent } from './components/beneficios/beneficios.component';
import { JuegosComponent } from './components/juegos/juegos.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { LandingAlumnosComponent } from './components/landing-alumnos/landing-alumnos.component';
import { LandingProfesoresComponent } from './components/landing-profesores/landing-profesores.component';
import { PerfilComponent } from './components/perfil/perfil.component';
import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent, title: 'MIKHUY - Inicio' },
  { path: 'login', component: LoginComponent, title: 'MIKHUY - Iniciar Sesión' },

  // 🔒 Rutas protegidas por rol
  { 
    path: 'landing-alumnos', 
    component: LandingAlumnosComponent, 
    canActivate: [AuthGuard],
    data: { role: 'student' },
    title: 'MIKHUY - Portal Alumnos' 
  },
  { 
    path: 'landing-profesores', 
    component: LandingProfesoresComponent, 
    canActivate: [AuthGuard],
    data: { role: 'teacher' },
    title: 'MIKHUY - Portal Profesores' 
  },

  // 🔒 Rutas protegidas generales
  { path: 'juegos', component: JuegosComponent, canActivate: [AuthGuard], data:{role:'student'}, title: 'MIKHUY - Juegos' },
  { path: 'beneficios', component: BeneficiosComponent, canActivate: [AuthGuard], title: 'MIKHUY - Beneficios' },
  { path: 'perfil', component: PerfilComponent, canActivate: [AuthGuard], title: 'MIKHUY - Mi Perfil' },
  { path: 'dashboards', component: DashboardsComponent, canActivate: [AuthGuard], title: 'MIKHUY - Dashboards' },

  { path: '**', redirectTo: 'home' },
];
