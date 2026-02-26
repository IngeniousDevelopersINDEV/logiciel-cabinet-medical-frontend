export type StatutRendezVous = 'PLANIFIE' | 'CONFIRME' | 'ANNULE' | 'TERMINE' | 'ABSENT';
export type TypeRendezVous = 'CONSULTATION' | 'SUIVI' | 'URGENCE' | 'BILAN' | 'AUTRE';

export interface RendezVous {
  id: number;
  patientId: number;
  patientNom?: string;
  medecinId: number;
  medecinNom?: string;
  dateHeure: string;
  duree: number;
  type: TypeRendezVous;
  statut: StatutRendezVous;
  motif?: string;
  notes?: string;
  salle?: string;
  dateCreation?: string;
  dateModification?: string;
}

export interface RendezVousFilter {
  patientId?: number;
  medecinId?: number;
  statut?: StatutRendezVous;
  dateDebut?: string;
  dateFin?: string;
  page?: number;
  size?: number;
}
