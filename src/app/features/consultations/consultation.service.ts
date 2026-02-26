import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { Consultation, ConsultationFilter } from '../../models/consultation.model';
import { PagedResponse } from '../../models/patient.model';

/**
 * Service consultations - CRUD complet
 */
@Injectable()
export class ConsultationService {
  private readonly endpoint = 'consultations';

  constructor(private api: ApiService) {}

  getAll(filter?: ConsultationFilter): Observable<PagedResponse<Consultation>> {
    return this.api.get<PagedResponse<Consultation>>(this.endpoint, filter);
  }

  getById(id: number): Observable<Consultation> {
    return this.api.get<Consultation>(`${this.endpoint}/${id}`);
  }

  create(consultation: Partial<Consultation>): Observable<Consultation> {
    return this.api.post<Consultation>(this.endpoint, consultation);
  }

  update(id: number, consultation: Partial<Consultation>): Observable<Consultation> {
    return this.api.put<Consultation>(`${this.endpoint}/${id}`, consultation);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }

  getByPatient(patientId: number): Observable<Consultation[]> {
    return this.api.get<Consultation[]>(`${this.endpoint}/patient/${patientId}`);
  }
}
