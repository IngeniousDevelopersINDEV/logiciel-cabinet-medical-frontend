import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';

export interface DashboardStats {
  totalPatients: number;
  consultationsAujourdhui: number;
  rendezVousAujourdhui: number;
  prescriptionsActives: number;
  consultationsSemaine: number;
  nouveauxPatientsMois: number;
}

export interface ConsultationRecente {
  id: number;
  patientNom: string;
  medecinNom: string;
  dateConsultation: string;
  statut: string;
  motif: string;
}

@Injectable()
export class DashboardService {
  constructor(private api: ApiService) {}

  getStats(): Observable<DashboardStats> {
    return this.api.get<DashboardStats>('dashboard/stats');
  }

  getConsultationsRecentes(): Observable<ConsultationRecente[]> {
    return this.api.get<ConsultationRecente[]>('dashboard/consultations-recentes');
  }

  getRendezVousAujourdhui(): Observable<any[]> {
    return this.api.get<any[]>('dashboard/rendez-vous-aujourd-hui');
  }

  getStatistiquesConsultations(): Observable<any> {
    return this.api.get<any>('dashboard/statistiques-consultations');
  }
}
