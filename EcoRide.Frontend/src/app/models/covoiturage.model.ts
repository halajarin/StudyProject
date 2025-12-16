export interface Covoiturage {
  covoiturageId: number;
  dateDepart: Date;
  heureDepart: string;
  lieuDepart: string;
  villeDepart: string;
  dateArrivee: Date;
  heureArrivee: string;
  lieuArrivee: string;
  villeArrivee: string;
  statut: string;
  nbPlace: number;
  nbPlaceRestante: number;
  prixPersonne: number;
  dureeEstimeeMinutes?: number;
  estEcologique: boolean;
  pseudoChauffeur: string;
  photoChauffeur?: Uint8Array;
  noteMoyenneChauffeur: number;
  modeleVoiture: string;
  marqueVoiture: string;
  energieVoiture: string;
  couleurVoiture: string;
}

export interface SearchCovoiturage {
  villeDepart: string;
  villeArrivee: string;
  dateDepart: Date;
  estEcologique?: boolean;
  prixMax?: number;
  dureeMaxMinutes?: number;
  noteMinimale?: number;
}

export interface CreateCovoiturage {
  dateDepart: Date;
  heureDepart: string;
  lieuDepart: string;
  villeDepart: string;
  dateArrivee: Date;
  heureArrivee: string;
  lieuArrivee: string;
  villeArrivee: string;
  nbPlace: number;
  prixPersonne: number;
  voitureId: number;
  dureeEstimeeMinutes?: number;
}
