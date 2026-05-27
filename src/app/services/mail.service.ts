import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment.prod';

@Injectable({
  providedIn: 'root',
})
export class MailService {

  private API = `${environment.apiUrl}/api/email`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken') ?? '';
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  private getHeadersForFormData(): HttpHeaders {
    const token = localStorage.getItem('authToken') ?? '';
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
    });
  }

  sendEmail(data: { to: string; subject: string; message: string }): Observable<any> {
    return this.http.post(`${this.API}/send`, data, {
      headers: this.getHeaders()
      // sin withCredentials
    }).pipe(
      tap(res => console.log('✔️ Enviado:', res)),
      catchError(err => {
        console.error('❌ Error:', err);
        return throwError(() => err);
      })
    );
  }

  sendEmailWithPdf(formData: FormData): Observable<any> {
    return this.http.post(`${this.API}/send-with-pdf`, formData, {
      headers: this.getHeadersForFormData()
      // sin withCredentials
    }).pipe(
      tap(res => console.log('✔️ Enviado PDF:', res)),
      catchError(err => {
        console.error('❌ Error PDF:', err);
        return throwError(() => err);
      })
    );
  }
}
