import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MailService {
  private API = 'http://localhost:8080/api/email';

  constructor(private http: HttpClient) {}

  /**
   * Enviar email simple
   */
  sendEmail(data: {
    to: string;
    subject: string;
    message: string;
  }): Observable<any> {
    return this.http.post(`${this.API}/send`, data);
  }

  /**
   * Enviar email con PDF adjunto
   * @param formData - FormData con los campos: to, subject, message, pdf
   */
  sendEmailWithPdf(formData: FormData): Observable<any> {
    return this.http.post(`${this.API}/send-with-pdf`, formData);
  }
}