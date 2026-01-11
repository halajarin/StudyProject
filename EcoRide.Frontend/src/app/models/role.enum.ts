export enum UserRole {
  Passenger = 'Passenger',
  Driver = 'Driver',
  Employee = 'Employee',
  Administrator = 'Administrator'
}

export const RoleId = {
  Passenger: 1,
  Driver: 2,
  Employee: 3,
  Administrator: 4
} as const;
