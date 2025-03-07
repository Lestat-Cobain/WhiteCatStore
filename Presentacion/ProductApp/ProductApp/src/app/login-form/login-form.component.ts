import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginService, Login } from '../product.service'; // Adjust the path as needed
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [FormsModule, CommonModule, MatFormFieldModule, MatInputModule, RouterModule, MatButtonModule],
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.css'
})
export class LoginFormComponent {
  login: Login = { email: '', password: ''};

  constructor(
    private route: ActivatedRoute,
    private loginService: LoginService,
    private router: Router
  ) {}

  onSubmit(): void {
      this.loginService.getLogin(this.login).subscribe(
        (response) => {
        console.log(response.token);
        this.loginService.storeToken(response.token);
        this.router.navigate(['product/list']);
      },
        (error) => { 
            console.error('Error failed', error)
          }
      );
  }
}
