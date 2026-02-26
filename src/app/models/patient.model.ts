export type Sexe = 'M' | 'F' | 'AUTRE';
export type GroupeSanguin = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export interface Patient {
  id: number;
  nom: string;
  prenom: string;
  dateNaissance: string;
  sexe: Sexe;
  adresse?: string;
  telephone?: string;
  email?: string;
  numeroSecuriteSociale?: string;
  groupeSanguin?: GroupeSanguin;
  allergies?: string;
  antecedentsMedicaux?: string;
  medecinTraitantId?: number;
  dateCreation?: string;
  dateModification?: string;
  actif: boolean;
}

export interface PatientFilter {
  search?: string;
  medecinId?: number;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
