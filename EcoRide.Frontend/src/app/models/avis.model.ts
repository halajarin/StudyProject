export interface Avis {
  avisId: number;
  commentaire: string;
  note: number;
  statut: string;
  dateCreation: Date;
  pseudoAuteur: string;
  pseudoCible: string;
}

export interface CreateAvis {
  commentaire: string;
  note: number;
  utilisateurCibleId: number;
  covoiturageId?: number;
}
