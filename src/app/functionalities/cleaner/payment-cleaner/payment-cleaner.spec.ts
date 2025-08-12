import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentCleaner } from './payment-cleaner';

describe('PaymentCleaner', () => {
  let component: PaymentCleaner;
  let fixture: ComponentFixture<PaymentCleaner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentCleaner]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentCleaner);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
