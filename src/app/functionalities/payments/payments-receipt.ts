import{Component, OnInit} from '@angular/core';
import { AuthService } from '../../shared/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

// This component handles the payment receipt functionality
@Component({
  selector: 'app-payments-receipt',
  templateUrl: './payments-receipt.html',
  //styleUrls: ['./payments-receipt.scss']
})
export class PaymentsReceiptComponent implements OnInit {
    userEmail: string | null = null;
    receiptSent: boolean = false;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    const user = this.authService.getUser();
    if (user) {
      this.userEmail = user.email;
      this.sendReceipt();
    }
  }

  sendReceipt() {
    if (this.userEmail) {
      // Simulate sending a receipt
      console.log(`Payment receipt sent to: ${this.userEmail}`);
      this.receiptSent = true;
    }
  }

}
