import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateCovoiturageComponent } from './create-covoiturage.component';
import { CovoiturageService } from '../../../services/covoiturage.service';
import { UserService } from '../../../services/user.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

describe('CreateCovoiturageComponent', () => {
  let component: CreateCovoiturageComponent;
  let fixture: ComponentFixture<CreateCovoiturageComponent>;
  let mockCovoiturageService: jasmine.SpyObj<CovoiturageService>;
  let mockUserService: jasmine.SpyObj<UserService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockCovoiturageService = jasmine.createSpyObj('CovoiturageService', ['create']);
    mockUserService = jasmine.createSpyObj('UserService', ['getVehicles']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [CreateCovoiturageComponent, CommonModule, FormsModule],
      providers: [
        { provide: CovoiturageService, useValue: mockCovoiturageService },
        { provide: UserService, useValue: mockUserService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateCovoiturageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load vehicles on init', () => {
    const mockVehicles = [
      {
        voitureId: 1,
        marqueLibelle: 'Renault',
        modele: 'Clio',
        immatriculation: 'AB-123-CD'
      },
      {
        voitureId: 2,
        marqueLibelle: 'Peugeot',
        modele: '208',
        immatriculation: 'EF-456-GH'
      }
    ];

    mockUserService.getVehicles.and.returnValue(of(mockVehicles));

    component.ngOnInit();

    expect(mockUserService.getVehicles).toHaveBeenCalled();
    expect(component.vehicles).toEqual(mockVehicles);
  });

  it('should show error message when no vehicles available', () => {
    mockUserService.getVehicles.and.returnValue(of([]));

    component.ngOnInit();

    expect(component.error).toBe('Vous devez d\'abord ajouter un véhicule dans votre profil.');
  });

  it('should handle vehicle loading error', () => {
    const consoleSpy = spyOn(console, 'error');
    mockUserService.getVehicles.and.returnValue(throwError(() => new Error('Network error')));

    component.ngOnInit();

    expect(consoleSpy).toHaveBeenCalled();
  });

  it('should initialize trip with default values', () => {
    expect(component.trip.nbPlace).toBe(3);
    expect(component.trip.prixPersonne).toBe(20);
    expect(component.trip.villeDepart).toBe('');
    expect(component.trip.voitureId).toBe('');
  });

  it('should create trip successfully', (done) => {
    mockCovoiturageService.create.and.returnValue(of({}));
    mockUserService.getVehicles.and.returnValue(of([]));

    component.trip = {
      villeDepart: 'Paris',
      lieuDepart: 'Gare du Nord',
      villeArrivee: 'Lyon',
      lieuArrivee: 'Part-Dieu',
      dateDepart: '2024-12-20',
      heureDepart: '10:00',
      dateArrivee: '2024-12-20',
      heureArrivee: '14:00',
      nbPlace: 3,
      prixPersonne: 25,
      voitureId: '1',
      dureeEstimeeMinutes: 240
    };

    component.createTrip();

    expect(component.loading).toBe(true);
    expect(mockCovoiturageService.create).toHaveBeenCalledWith(component.trip);

    setTimeout(() => {
      expect(component.success).toBe('Covoiturage créé avec succès ! Redirection...');
      expect(component.error).toBe('');
      expect(component.loading).toBe(false);
      done();
    }, 0);
  });

  it('should handle create trip error', (done) => {
    const errorMessage = 'Dates invalides';
    mockCovoiturageService.create.and.returnValue(
      throwError(() => ({ error: { message: errorMessage } }))
    );
    mockUserService.getVehicles.and.returnValue(of([]));

    component.createTrip();

    setTimeout(() => {
      expect(component.error).toBe(errorMessage);
      expect(component.success).toBe('');
      expect(component.loading).toBe(false);
      done();
    }, 0);
  });

  it('should handle create trip error without message', (done) => {
    mockCovoiturageService.create.and.returnValue(
      throwError(() => ({}))
    );
    mockUserService.getVehicles.and.returnValue(of([]));

    component.createTrip();

    setTimeout(() => {
      expect(component.error).toBe('Erreur lors de la création');
      expect(component.loading).toBe(false);
      done();
    }, 0);
  });

  it('should navigate to profile after successful creation', (done) => {
    mockCovoiturageService.create.and.returnValue(of({}));
    mockUserService.getVehicles.and.returnValue(of([]));

    component.createTrip();

    // Wait for the 2000ms timeout in the component
    setTimeout(() => {
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/profile']);
      done();
    }, 2100);
  });

  it('should clear error and success messages when creating trip', () => {
    component.error = 'Previous error';
    component.success = 'Previous success';
    mockCovoiturageService.create.and.returnValue(of({}));
    mockUserService.getVehicles.and.returnValue(of([]));

    component.createTrip();

    expect(component.error).toBe('');
    expect(component.success).toBe('');
  });

  it('should render form with all required fields', () => {
    mockUserService.getVehicles.and.returnValue(of([]));
    fixture.detectChanges();

    const compiled = fixture.nativeElement;

    expect(compiled.querySelector('input[name="villeDepart"]')).toBeTruthy();
    expect(compiled.querySelector('input[name="lieuDepart"]')).toBeTruthy();
    expect(compiled.querySelector('input[name="villeArrivee"]')).toBeTruthy();
    expect(compiled.querySelector('input[name="lieuArrivee"]')).toBeTruthy();
    expect(compiled.querySelector('input[name="dateDepart"]')).toBeTruthy();
    expect(compiled.querySelector('input[name="heureDepart"]')).toBeTruthy();
    expect(compiled.querySelector('input[name="dateArrivee"]')).toBeTruthy();
    expect(compiled.querySelector('input[name="heureArrivee"]')).toBeTruthy();
    expect(compiled.querySelector('input[name="nbPlace"]')).toBeTruthy();
    expect(compiled.querySelector('input[name="prixPersonne"]')).toBeTruthy();
    expect(compiled.querySelector('select[name="voitureId"]')).toBeTruthy();
    expect(compiled.querySelector('button[type="submit"]')).toBeTruthy();
  });

  it('should disable submit button when loading', () => {
    mockUserService.getVehicles.and.returnValue(of([]));
    component.loading = true;
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(button.disabled).toBe(true);
  });

  it('should display error message when present', () => {
    mockUserService.getVehicles.and.returnValue(of([]));
    component.error = 'Test error message';
    fixture.detectChanges();

    const errorDiv = fixture.nativeElement.querySelector('.alert-danger');
    expect(errorDiv).toBeTruthy();
    expect(errorDiv.textContent).toContain('Test error message');
  });

  it('should display success message when present', () => {
    mockUserService.getVehicles.and.returnValue(of([]));
    component.success = 'Test success message';
    fixture.detectChanges();

    const successDiv = fixture.nativeElement.querySelector('.alert-success');
    expect(successDiv).toBeTruthy();
    expect(successDiv.textContent).toContain('Test success message');
  });

  it('should populate vehicle dropdown with loaded vehicles', () => {
    const mockVehicles = [
      {
        voitureId: 1,
        marqueLibelle: 'Renault',
        modele: 'Clio',
        immatriculation: 'AB-123-CD'
      }
    ];

    mockUserService.getVehicles.and.returnValue(of(mockVehicles));
    fixture.detectChanges();
    component.ngOnInit();
    fixture.detectChanges();

    const options = fixture.nativeElement.querySelectorAll('select[name="voitureId"] option');
    // +1 for the default "Sélectionner un véhicule" option
    expect(options.length).toBe(mockVehicles.length + 1);
  });
});
