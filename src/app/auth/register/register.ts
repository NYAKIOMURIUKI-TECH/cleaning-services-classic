import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../shared/auth.service';
import { Role } from '../../shared/models/user.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrls: ['./register.scss']
})
export class Register {
  fullName = '';
  email = '';
  password = '';
  role: Role = 'client'; // Default role, can be changed in the template

  constructor(private auth: AuthService) {}

  register() {
    this.auth.register(this.fullName, this.email, this.password, this.role).subscribe();
  }
}
