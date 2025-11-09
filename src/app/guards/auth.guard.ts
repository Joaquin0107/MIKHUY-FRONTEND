import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const token = this.authService.getToken?.() || localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

    // ✅ Solo bloquea si realmente NO hay token
    if (!token) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }

    // ⚙️ Si hay token, el usuario se considera logueado
    const user = this.authService.getCurrentUser?.();
    const expectedRole = route.data['role'] as string;

    // Verifica rol solo si el usuario existe y hay restricción de rol
    if (expectedRole && user && user.rol !== expectedRole) {
      alert('No tienes permisos para acceder a esta página.');
      this.router.navigate(['/home']);
      return false;
    }

    return true;
  }
}
