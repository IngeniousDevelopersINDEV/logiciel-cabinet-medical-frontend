export type StatutConsultation = 'PLANIFIEE' | 'EN_COURS' | 'TERMINEE' | 'ANNULEE';

export interface Consultation {
  id: number;
  patientId: number;
  patientNom?: string;
  medecinId: number;
  medecinNom?: string;
  dateConsultation: string;
  motif: string;
  symptomes?: string;
  diagnostic?: string;
  traitement?: string;
  notes?: string;
  statut: StatutConsultation;
  tensionArterielle?: string;
  temperature?: number;
  pouls?: number;
  poids?: number;
  taille?: number;
  dateCreation?: string;
  dateModification?: string;
}

export interface ConsultationFilter {
  patientId?: number;
  medecinId?: number;
  statut?: StatutConsultation;
  dateDebut?: string;
  dateFin?: string;
  page?: number;
  size?: number;
}
