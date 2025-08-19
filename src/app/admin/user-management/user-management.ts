import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../shared/services/auth.service';
import { DashboardService } from '../../shared/services/dashboard.service';
import { User } from '../../shared/models/user.model';

interface UserWithRatings extends User {
  averageRating?: number;
  totalRatings?: number;
  recommendationPercentage?: string;
}

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-white dark:bg-gray-900 transition-colors p-6">
      <div class="max-w-7xl mx-auto">

        <!-- Header -->
        <div class="flex justify-between items-center mb-8">
          <h1 class="text-3xl font-bold text-gray-800 dark:text-white">User Management</h1>
          <button
            (click)="goBack()"
            class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-300"
          >
            Back to Dashboard
          </button>
        </div>

        <!-- Filter Tabs -->
        <div class="mb-6">
          <div class="border-b border-gray-200 dark:border-gray-700">
            <nav class="flex space-x-8">
              <button
                (click)="selectedTab = 'all'"
                [class]="selectedTab === 'all' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400'"
                class="py-2 px-1 border-b-2 font-medium text-sm hover:text-gray-700 dark:hover:text-gray-300"
              >
                All Users ({{ allUsers.length }})
              </button>
              <button
                (click)="selectedTab = 'clients'"
                [class]="selectedTab === 'clients' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400'"
                class="py-2 px-1 border-b-2 font-medium text-sm hover:text-gray-700 dark:hover:text-gray-300"
              >
                Clients ({{ getClientUsers().length }})
              </button>
              <button
                (click)="selectedTab = 'cleaners'"
                [class]="selectedTab === 'cleaners' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400'"
                class="py-2 px-1 border-b-2 font-medium text-sm hover:text-gray-700 dark:hover:text-gray-300"
              >
                Cleaners ({{ getCleanerUsers().length }})
              </button>
              <button
                (click)="selectedTab = 'admins'"
                [class]="selectedTab === 'admins' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400'"
                class="py-2 px-1 border-b-2 font-medium text-sm hover:text-gray-700 dark:hover:text-gray-300"
              >
                Admins ({{ getAdminUsers().length }})
              </button>
            </nav>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="isLoading" class="text-center py-8">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p class="text-gray-600 dark:text-gray-400 mt-4">Loading users...</p>
        </div>

        <!-- Users Table -->
        <div *ngIf="!isLoading" class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    User Details
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Contact
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Role
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Rating
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Joined
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                <tr *ngFor="let user of getFilteredUsers()" class="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div class="text-sm font-medium text-gray-900 dark:text-white">{{ user.fullName }}</div>
                      <div class="text-sm text-gray-500 dark:text-gray-400" *ngIf="user.bio">{{ user.bio }}</div>
                      <div class="text-sm text-gray-500 dark:text-gray-400" *ngIf="user.skills">Skills: {{ user.skills }}</div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900 dark:text-white">{{ user.email }}</div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">{{ user.phone }}</div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">{{ user.location }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                          [class]="getRoleClass(user.role)">
                      {{ user.role | titlecase }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div *ngIf="user.role === 'cleaner' && user.averageRating" class="text-sm">
                      <div class="flex items-center">
                        <span class="text-yellow-400 mr-1">★</span>
                        <span class="text-gray-900 dark:text-white">{{ user.averageRating }}</span>
                      </div>
                      <div class="text-xs text-gray-500 dark:text-gray-400">{{ user.totalRatings }} reviews</div>
                    </div>
                    <div *ngIf="user.role !== 'cleaner'" class="text-sm text-gray-500 dark:text-gray-400">-</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900 dark:text-white">{{ formatDate(user.createdAt || '') }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      (click)="viewUserDetails(user)"
                      class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- No Users -->
        <div *ngIf="!isLoading && getFilteredUsers().length === 0" class="text-center py-12">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-8">
            <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
            </svg>
            <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-2">No users found</h3>
            <p class="text-gray-600 dark:text-gray-400">No users match the selected filter</p>
          </div>
        </div>

      </div>
    </div>
  `
})
export class AdminUserManagement implements OnInit {
  allUsers: UserWithRatings[] = [];
  selectedTab = 'all';
  isLoading = false;

  constructor(
    private auth: AuthService,
    private dashboardService: DashboardService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.isLoading = true;
    // Since we don't have a users endpoint, we'll collect users from profile endpoints
    this.loadUsersFromProfiles();
  }

  loadUsersFromProfiles() {
    const users: UserWithRatings[] = [];

    // Try to get user profiles by checking user IDs 1-50
    for (let userId = 1; userId <= 50; userId++) {
      this.dashboardService.getUserProfile(userId).subscribe({
        next: (response: any) => {
          if (response.success && response.user) {
            const user = response.user as UserWithRatings;
            users.push(user);

            // If this is a cleaner, load their ratings
            if (user.role === 'cleaner') {
              this.loadUserRatings(user);
            }
          }
        },
        error: () => {
          // User doesn't exist, continue
        }
      });
    }

    // Update users array after a delay to allow API calls to complete
    setTimeout(() => {
      this.allUsers = users.sort((a, b) => (a.id || 0) - (b.id || 0));
      this.isLoading = false;
    }, 2000);
  }

  loadUserRatings(user: UserWithRatings) {
    if (!user.id) return;

    this.dashboardService.getUserRatings(user.id).subscribe({
      next: (ratings: any[]) => {
        user.totalRatings = ratings.length;
        if (ratings.length > 0) {
          const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
          user.averageRating = Math.round(avgRating * 10) / 10;
          const recommendations = ratings.filter(r => r.would_recommend).length;
          user.recommendationPercentage = ((recommendations / ratings.length) * 100).toFixed(1);
        }
      },
      error: () => {
        // No ratings found
      }
    });
  }

  getFilteredUsers(): UserWithRatings[] {
    switch (this.selectedTab) {
      case 'clients':
        return this.getClientUsers();
      case 'cleaners':
        return this.getCleanerUsers();
      case 'admins':
        return this.getAdminUsers();
      default:
        return this.allUsers;
    }
  }

  getClientUsers(): UserWithRatings[] {
    return this.allUsers.filter(user => user.role === 'client');
  }

  getCleanerUsers(): UserWithRatings[] {
    return this.allUsers.filter(user => user.role === 'cleaner');
  }

  getAdminUsers(): UserWithRatings[] {
    return this.allUsers.filter(user => user.role === 'admin');
  }

  getRoleClass(role: string): string {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'cleaner':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'client':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  }

  viewUserDetails(user: UserWithRatings) {
    alert(`User Details:\n\nName: ${user.fullName}\nEmail: ${user.email}\nRole: ${user.role}\nPhone: ${user.phone}\nLocation: ${user.location}${user.bio ? '\nBio: ' + user.bio : ''}${user.skills ? '\nSkills: ' + user.skills : ''}${user.experience_years ? '\nExperience: ' + user.experience_years + ' years' : ''}`);
  }

  formatDate(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  goBack() {
    this.router.navigate(['/admin']);
  }
}
