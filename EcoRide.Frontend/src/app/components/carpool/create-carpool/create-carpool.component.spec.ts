import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { CreateCarpoolComponent } from './create-carpool.component';

describe('CreateCarpoolComponent', () => {
  let component: CreateCarpoolComponent;
  let fixture: ComponentFixture<CreateCarpoolComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CreateCarpoolComponent,
        HttpClientTestingModule,
        RouterTestingModule,
        TranslateModule.forRoot()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateCarpoolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
