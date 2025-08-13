import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators,FormsModule } from '@angular/forms';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);
@Component({
  selector: 'app-admin',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.scss'
})
export class Admin implements OnInit {
   totalEarnings = 0;
   totalBooking= 0;
services = [
    { name: 'Carpet Cleaning', price: 500 },
    { name: 'General Cleaning', price: 300 },
    { name: 'Deep Cleaning', price: 100 }
  ];

  displayedServices = [...this.services];
  serviceSearch = '';
  
  users = [
    { name: 'Alice Johnson', email: 'alice@example.com' },
    { name: 'Bob Smith', email: 'bob@example.com' },
    { name: 'Charlie Brown', email: 'charlie@example.com' }
  ];
  displayedUsers = [...this.users];
  userSearch = '';
  
  // Add service form fields
  newServiceName = '';
  newServicePrice: number | null = null;

   @ViewChild('earningsChart') earningsChartRef!: ElementRef<HTMLCanvasElement>;
   @ViewChild('bookingsChart') bookingsChartRef!: ElementRef<HTMLCanvasElement>;

   constructor(private fb: FormBuilder, private router: Router) {}
   ngOnInit(): void {
      this.loadDashboardStats();
   }
    ngAfterViewInit(): void {
    this.createCharts();
  }

  // Example: fetch stats from backend (replace with actual API call)
  loadDashboardStats() {
    // Mock data — replace with HTTP GET
    this.totalEarnings = 54000;
    this.totalBooking = 320;
  }

  createCharts() {
    // Earnings chart
    new Chart(this.earningsChartRef.nativeElement, {
      type: 'line',
      data: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [{
          label: 'Earnings (KeS)',
          data: [12000, 15000, 14000, 13000],
          borderColor: '#1E3A8A',
          backgroundColor: 'rgba(30, 58, 138, 0.3)',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          title: { display: true, text: 'Total Earnings per Week' }
        }
      }
    });

    // Bookings chart
    new Chart(this.bookingsChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [{
          label: 'Bookings',
          data: [80, 90, 70, 80],
          backgroundColor: '#1E3A8A',
          borderColor: '#1E3A8A',
          borderWidth: 1,
          hoverBackgroundColor: 'rgba(30, 58, 138, 0.7)',
          hoverBorderColor: '#1E3A8A'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          title: { display: true, text: 'Total Bookings per Week' }
        }
      }
    });
  }

  
  // ===== CRUD Actions for Services =====
  searchServices() {
    if (!this.serviceSearch.trim()) {
      alert('Enter a service name to search.');
      return;
    }
    this.displayedServices = this.services.filter(service =>
      service.name.toLowerCase().includes(this.serviceSearch.toLowerCase())
    );
  }

  viewAllServices() {
    this.displayedServices = [...this.services];
  }

  addService() {
    const name = prompt('Enter the new service name:');
    if (name && name.trim()) {
      const priceStr = prompt('Enter the price for the new service:');
      const price = priceStr ? parseFloat(priceStr) : NaN;
      if (!isNaN(price)) {
        this.services.push({ name: name.trim(), price });
        alert(`Service "${name}" added successfully.`);
      } else {
        alert('Invalid price entered.');
      }
    }
  }

  updateService() {
    const index = parseInt(prompt(`Enter the service index to update (1-${this.services.length}):`) || '', 10) - 1;
    if (!isNaN(index) && index >= 0 && index < this.services.length) {
      const newName = prompt(`Enter new name for "${this.services[index]}":`);
      if (newName && newName.trim()) {
        this.services[index] = {
          name: newName.trim(),
          price: this.services[index].price
        };
        alert('Service updated successfully.');
      }
    } else {
      alert('Invalid service index.');
    }
  }

  deleteService() {
    const index = parseInt(prompt(`Enter the service index to delete (1-${this.services.length}):`) || '', 10) - 1;
    if (!isNaN(index) && index >= 0 && index < this.services.length) {
      const confirmDelete = confirm(`Are you sure you want to delete "${this.services[index]}"?`);
      if (confirmDelete) {
        this.services.splice(index, 1);
        alert('Service deleted successfully.');
      }
    } else {
      alert('Invalid service index.');
    }
  }

  // ===== CRUD Actions for Users =====
  deleteUser() {
    const index = parseInt(prompt(`Enter the user index to delete (1-${this.users.length}):`) || '', 10) - 1;
    if (!isNaN(index) && index >= 0 && index < this.users.length) {
      const confirmDelete = confirm(`Are you sure you want to delete "${this.users[index]}"?`);
      if (confirmDelete) {
        this.users.splice(index, 1);
        alert('User deleted successfully.');
      }
    } else {
      alert('Invalid user index.');
    }
  }
   viewAllUsers() {
    this.displayedUsers = [...this.users];
  }


  searchTerm = '';
  filteredUsers = [...this.users];

  // Dummy search function
  searchUser() {
    if (this.searchTerm.trim() === '') {
      this.filteredUsers = [...this.users];
    } else {
      this.filteredUsers = this.users.filter(user =>
        user.name.toLowerCase().includes(this.searchTerm.toLowerCase()));
    }
  }
}
  
