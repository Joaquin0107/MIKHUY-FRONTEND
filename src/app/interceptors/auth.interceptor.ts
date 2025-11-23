import { Injectable } from '@angular/core';
import { 
  HttpInterceptor, 
  HttpRequest, 
  HttpHandler, 
  HttpEvent 
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  
  private excludedUrls = [
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/public'
  ];
  
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log('🔐 [AUTH INTERCEPTOR] Petición interceptada:', req.url);
    
    const shouldExclude = this.excludedUrls.some(url => req.url.includes(url));
    
    if (shouldExclude) {
      console.log('🚫 [AUTH INTERCEPTOR] URL excluida, no se agregará token:', req.url);
      return next.handle(req);
    }
    
    const token = localStorage.getItem('authToken') || 
                  sessionStorage.getItem('authToken');
    
    if (token) {
      console.log('✅ [AUTH INTERCEPTOR] Token encontrado:', token.substring(0, 20) + '...');
      
      const clonedReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('✅ [AUTH INTERCEPTOR] Header Authorization agregado');
      
      return next.handle(clonedReq);
    } else {
      console.warn('⚠️ [AUTH INTERCEPTOR] NO hay token disponible');
      return next.handle(req);
    }
  }
}