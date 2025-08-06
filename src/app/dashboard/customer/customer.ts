import { Component, OnInit} from '@angular/core';
import { CustomerService } from '../../services/customer.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-customer',
  imports: [FormsModule, CommonModule, HttpClientModule, RouterModule],
  templateUrl: './customer.html',
  styleUrl: './customer.scss'
})
export class Customer implements OnInit {
  services: any[] = [];
  myBookings: any[] = [];
  bookingForm= {
    serviceId: '',
    date: '',
    time: '',
    location:'',
    note:''
  };
  customerId: number = 1; // Example customer ID, replace with actual logic
  constructor(private customerService: CustomerService, private routerModule: RouterModule) {}
  ngOnInit(): void {
      this.customerService.getServices().subscribe(data =>this.services = data);
      this.customerService.getMyBookings(this.customerId).subscribe(data => this.myBookings = data);
  }

bookService() {
    const bookingData = {
      customerId: this.customerId,
      ...this.bookingForm
    };

    this.customerService.bookService(bookingData).subscribe({
      next: res => {
        alert('Booking sent!');
        this.ngOnInit(); // Refresh list
      },
      error: err => alert('Booking failed')
    });
  }

//   logout() {
//   localStorage.removeItem('token'); // if you're using token auth
//   this.routerModule.navigate(['/login']);
// }
}
