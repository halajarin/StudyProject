export interface Vehicle {
  vehicleId: number;
  model: string;
  registrationNumber: string;
  energyType: string;
  color: string;
  firstRegistrationDate?: Date;
  brandId: number;
  brandLabel: string;
  seatCount: number;
}

export interface CreateVehicle {
  model: string;
  registrationNumber: string;
  energyType: string;
  color: string;
  firstRegistrationDate?: Date;
  brandId: number;
  seatCount: number;
}

export interface Brand {
  brandId: number;
  label: string;
}
