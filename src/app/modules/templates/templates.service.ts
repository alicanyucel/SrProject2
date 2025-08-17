import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TemplateModel {
  id?: string;
  name: string;
  raporTipi: string;
  contextHtml: string;
  context: string;
  reports?: any[];
  content?: string | null;
}

@Injectable({ providedIn: 'root' })
export class TemplatesService {
  private apiUrl = 'https://localhost:7054/api/Templates';

  constructor(private http: HttpClient) {}

  getAll(): Observable<TemplateModel[]> {
    // GET yerine POST ile boş body gönder
    return this.http.post<TemplateModel[]>(`${this.apiUrl}/GetAll`, {});
  }

  create(template: TemplateModel): Observable<any> {
    return this.http.post(`${this.apiUrl}/Create`, template);
  }

  update(template: Partial<TemplateModel> & { id: string }): Observable<any> {
    // API POST: https://localhost:7054/api/Templates/Update, body: { id, name, raporTipi, contextHtml, content }
    const body = {
      id: template.id,
      name: template.name,
      raporTipi: template.raporTipi,
      contextHtml: template.contextHtml,
      content: template.content // content alanı da gönderilsin
    };
    return this.http.post(`${this.apiUrl}/Update`, body);
  }

  delete(id: string): Observable<any> {
    // API POST: https://localhost:7054/api/Templates/Delete, body: { id: guid }
    return this.http.post(`${this.apiUrl}/Delete`, { id });
  }
}
