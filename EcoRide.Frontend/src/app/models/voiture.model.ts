export interface Voiture {
  voitureId: number;
  modele: string;
  immatriculation: string;
  energie: string;
  couleur: string;
  datePremiereImmatriculation?: Date;
  marqueId: number;
  marqueLibelle: string;
  nombrePlaces: number;
}

export interface CreateVoiture {
  modele: string;
  immatriculation: string;
  energie: string;
  couleur: string;
  datePremiereImmatriculation?: Date;
  marqueId: number;
  nombrePlaces: number;
}

export interface Marque {
  marqueId: number;
  libelle: string;
}
