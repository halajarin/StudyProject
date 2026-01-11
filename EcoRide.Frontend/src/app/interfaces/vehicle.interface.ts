export interface CreateVehicleForm {
  model: string;
  registrationNumber: string;
  energyType: string;
  color: string;
  firstRegistrationDate?: Date;
  brandId: number;
  seatCount: number;
}

export interface VehicleDisplay {
  vehicleId: number;
  model: string;
  registrationNumber: string;
  energyType: string;
  color: string;
  firstRegistrationDate?: Date;
  seatCount: number;
  brandLabel: string;
}
