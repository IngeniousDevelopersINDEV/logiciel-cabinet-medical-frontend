import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { Prescription, PrescriptionFilter } from '../../models/prescription.model';
import { PagedResponse } from '../../models/patient.model';

/**
 * Service prescriptions - CRUD complet
 */
@Injectable()
export class PrescriptionService {
  private readonly endpoint = 'prescriptions';

  constructor(private api: ApiService) {}

  getAll(filter?: PrescriptionFilter): Observable<PagedResponse<Prescription>> {
    return this.api.get<PagedResponse<Prescription>>(this.endpoint, filter);
  }

  getById(id: number): Observable<Prescription> {
    return this.api.get<Prescription>(`${this.endpoint}/${id}`);
  }

  create(prescription: Partial<Prescription>): Observable<Prescription> {
    return this.api.post<Prescription>(this.endpoint, prescription);
  }

  update(id: number, prescription: Partial<Prescription>): Observable<Prescription> {
    return this.api.put<Prescription>(`${this.endpoint}/${id}`, prescription);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }

  getByPatient(patientId: number): Observable<Prescription[]> {
    return this.api.get<Prescription[]>(`${this.endpoint}/patient/${patientId}`);
  }
}
