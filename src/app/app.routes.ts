import { BeneficiosComponent } from './components/beneficios/beneficios.component';
import { JuegosComponent } from './components/juegos/juegos.component';
import { RegistroComponent } from './components/registro/registro.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { LandingAlumnosComponent } from './components/landing-alumnos/landing-alumnos.component';
import { LandingProfesoresComponent } from './components/landing-profesores/landing-profesores.component';
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    component: HomeComponent,
    title: 'MIKHUY - Inicio',
  },
  {
    path: 'login',
    component: LoginComponent,
    title: 'MIKHUY - Iniciar Sesión',
  },
  {
    path: 'landing-alumnos',
    component: LandingAlumnosComponent,
    title: 'MIKHUY - Portal Alumnos',
  },
  {
    path: 'landing-profesores',
    component: LandingProfesoresComponent,
    title: 'MIKHUY - Portal Profesores',
  },
  {
    path: 'registro',
    component: RegistroComponent,
    title: 'MIKHUY - Registro',
  },
  {
    path: 'juegos',
    component: JuegosComponent,
    title: 'MIKHUY - Juegos',
  },
  {
    path: 'beneficios',
    component: BeneficiosComponent,
    title: 'MIKHUY - Beneficios',
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];
