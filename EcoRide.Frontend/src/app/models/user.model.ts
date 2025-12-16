export interface User {
  utilisateurId: number;
  pseudo: string;
  email: string;
  nom?: string;
  prenom?: string;
  telephone?: string;
  adresse?: string;
  dateNaissance?: Date;
  photo?: Uint8Array;
  credit: number;
  roles: string[];
  noteMoyenne: number;
  nombreAvis: number;
}

export interface RegisterRequest {
  pseudo: string;
  email: string;
  password: string;
  nom?: string;
  prenom?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  user: {
    utilisateurId: number;
    pseudo: string;
    email: string;
    credit: number;
  };
  token: string;
}
