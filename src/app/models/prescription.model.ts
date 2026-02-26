export type StatutPrescription = 'ACTIVE' | 'TERMINEE' | 'ANNULEE' | 'EN_ATTENTE';

export interface Medicament {
  nom: string;
  dosage: string;
  frequence: string;
  duree: string;
  instructions?: string;
}

export interface Prescription {
  id: number;
  consultationId: number;
  patientId: number;
  patientNom?: string;
  medecinId: number;
  medecinNom?: string;
  datePrescription: string;
  dateExpiration?: string;
  medicaments: Medicament[];
  statut: StatutPrescription;
  notes?: string;
  dateCreation?: string;
  dateModification?: string;
}

export interface PrescriptionFilter {
  patientId?: number;
  medecinId?: number;
  statut?: StatutPrescription;
  dateDebut?: string;
  dateFin?: string;
  page?: number;
  size?: number;
}
