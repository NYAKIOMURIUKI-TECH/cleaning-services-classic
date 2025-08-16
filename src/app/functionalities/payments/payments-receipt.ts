import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../shared/auth.service';
import { CommonModule } from '@angular/common'; // needed for *ngIf

@Component({
  selector: 'app-payments-receipt',
  standalone: true,          // standalone component
  imports: [CommonModule],   // import CommonModule for *ngIf
  templateUrl: './payments-receipt.html', // keep external template
})
export class PaymentsReceiptComponent implements OnInit {
  userEmail: string | null = null;
  receiptSent: boolean = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const user = this.authService.getUser();
    if (user) {
      this.userEmail = user.email;
      this.sendReceipt();
    }
  }

  sendReceipt() {
    if (this.userEmail) {
      console.log(`Payment receipt sent to: ${this.userEmail}`);
      this.receiptSent = true;
    }
  }
}
