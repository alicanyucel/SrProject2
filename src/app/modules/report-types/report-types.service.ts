import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ReportTypesService {
  private apiUrl = 'https://localhost:7054/api/Reports';

  constructor(private http: HttpClient) {}

  getReportTypes(modality: string, emergency: string): Observable<any[]> {
    let params = new HttpParams();
    if (modality) params = params.set('modality', modality);
    if (emergency) params = params.set('emergency', emergency);
    return this.http.get<any[]>(`${this.apiUrl}/List`, { params });
  }

  getAllReports(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/GetAllReports`);
  }

  getModalities(): Observable<string[]> {
    // API çağrısı yapılacak, örnek veri
    return this.http.get<string[]>(`${this.apiUrl}/Modalities`);
  }

  getTemplates(reportTypeId: string): Observable<any[]> {
    // API çağrısı yapılacak, örnek veri
    return this.http.get<any[]>(`${this.apiUrl}/Templates`, { params: new HttpParams().set('reportTypeId', reportTypeId) });
  }
}
