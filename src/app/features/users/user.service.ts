import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { User } from '../../models/user.model';
import { PagedResponse } from '../../models/patient.model';

/**
 * Service utilisateurs - CRUD complet (admin)
 */
@Injectable()
export class UserService {
  private readonly endpoint = 'users';

  constructor(private api: ApiService) {}

  getAll(params?: any): Observable<PagedResponse<User>> {
    return this.api.get<PagedResponse<User>>(this.endpoint, params);
  }

  getById(id: number): Observable<User> {
    return this.api.get<User>(`${this.endpoint}/${id}`);
  }

  create(user: Partial<User> & { password?: string }): Observable<User> {
    return this.api.post<User>(this.endpoint, user);
  }

  update(id: number, user: Partial<User>): Observable<User> {
    return this.api.put<User>(`${this.endpoint}/${id}`, user);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }

  getMedecins(): Observable<User[]> {
    return this.api.get<User[]>(`${this.endpoint}/medecins`);
  }
}
