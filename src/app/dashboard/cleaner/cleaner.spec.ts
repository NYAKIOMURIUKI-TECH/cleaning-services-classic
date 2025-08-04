import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Cleaner } from './cleaner';

describe('Cleaner', () => {
  let component: Cleaner;
  let fixture: ComponentFixture<Cleaner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cleaner]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Cleaner);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
