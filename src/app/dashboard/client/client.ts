import { Component, OnInit} from '@angular/core';
import { ClientService } from '../../services/client.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-client',
  imports: [FormsModule, CommonModule, HttpClientModule, RouterModule],
  templateUrl: './client.html',
  styleUrl: './client.scss'
})
export class Client implements OnInit {
  services: any[] = [];
  myBookings: any[] = [];
  bookingForm= {
    serviceId: '',
    date: '',
    time: '',
    location:'',
    note:''
  };
  clientId: number = 1; // Example client ID, replace with actual logic
  constructor(private clientService: ClientService, private routerModule: RouterModule) {}
  ngOnInit(): void {
      this.clientService.getServices().subscribe(data =>this.services = data);
      this.clientService.getMyBookings(this.clientId).subscribe(data => this.myBookings = data);
  }

bookService() {
    const bookingData = {
      clientId: this.clientId,
      ...this.bookingForm
    };

    this.clientService.bookService(bookingData).subscribe({
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
