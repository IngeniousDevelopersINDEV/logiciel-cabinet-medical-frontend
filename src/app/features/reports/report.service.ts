import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';

/**
 * Service rapports - Génération et export de rapports
 */
@Injectable()
export class ReportService {
  constructor(private api: ApiService) {}

  getMedicalReport(patientId: number): Observable<any> {
    return this.api.get<any>(`reports/medical/${patientId}`);
  }

  getStatistics(params?: any): Observable<any> {
    return this.api.get<any>('reports/statistics', params);
  }

  getConsultationStats(period: string): Observable<any> {
    return this.api.get<any>(`reports/consultations`, { period });
  }

  getPatientStats(): Observable<any> {
    return this.api.get<any>('reports/patients');
  }

  getRevenueStats(period: string): Observable<any> {
    return this.api.get<any>(`reports/revenue`, { period });
  }
}
