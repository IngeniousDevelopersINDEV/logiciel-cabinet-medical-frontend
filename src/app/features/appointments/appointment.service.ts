import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { RendezVous, RendezVousFilter } from '../../models/appointment.model';
import { PagedResponse } from '../../models/patient.model';

/**
 * Service rendez-vous - CRUD complet
 */
@Injectable()
export class AppointmentService {
  private readonly endpoint = 'appointments';

  constructor(private api: ApiService) {}

  getAll(filter?: RendezVousFilter): Observable<PagedResponse<RendezVous>> {
    return this.api.get<PagedResponse<RendezVous>>(this.endpoint, filter);
  }

  getById(id: number): Observable<RendezVous> {
    return this.api.get<RendezVous>(`${this.endpoint}/${id}`);
  }

  create(rdv: Partial<RendezVous>): Observable<RendezVous> {
    return this.api.post<RendezVous>(this.endpoint, rdv);
  }

  update(id: number, rdv: Partial<RendezVous>): Observable<RendezVous> {
    return this.api.put<RendezVous>(`${this.endpoint}/${id}`, rdv);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }

  getByDateRange(debut: string, fin: string): Observable<RendezVous[]> {
    return this.api.get<RendezVous[]>(`${this.endpoint}/calendar`, { debut, fin });
  }

  updateStatut(id: number, statut: string): Observable<RendezVous> {
    return this.api.patch<RendezVous>(`${this.endpoint}/${id}/statut`, { statut });
  }
}
