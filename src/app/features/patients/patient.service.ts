import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { Patient, PatientFilter, PagedResponse } from '../../models/patient.model';

/**
 * Service patients - CRUD complet pour la gestion des patients
 */
@Injectable()
export class PatientService {
  private readonly endpoint = 'patients';

  constructor(private api: ApiService) {}

  getAll(filter?: PatientFilter): Observable<PagedResponse<Patient>> {
    return this.api.get<PagedResponse<Patient>>(this.endpoint, filter);
  }

  getById(id: number): Observable<Patient> {
    return this.api.get<Patient>(`${this.endpoint}/${id}`);
  }

  create(patient: Partial<Patient>): Observable<Patient> {
    return this.api.post<Patient>(this.endpoint, patient);
  }

  update(id: number, patient: Partial<Patient>): Observable<Patient> {
    return this.api.put<Patient>(`${this.endpoint}/${id}`, patient);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }

  search(query: string): Observable<Patient[]> {
    return this.api.get<Patient[]>(`${this.endpoint}/search`, { q: query });
  }
}
