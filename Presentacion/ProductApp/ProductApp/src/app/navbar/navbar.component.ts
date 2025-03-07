import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { LoginService } from '../product.service'; // Adjust if needed
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatToolbarModule, MatButtonModule],
  template: `
    <mat-toolbar color="primary">
      <span>MyApp</span>
      <span class="spacer"></span>
      <button *ngIf="!isAuthenticated" mat-button routerLink="/login">Login</button>
      <button *ngIf="isAuthenticated" mat-button (click)="logout()">Logout</button>
    </mat-toolbar>
  `,
  styles: [`
    .spacer {
      flex: 1 1 auto;
    }
  `]
})
export class NavbarComponent {
  isAuthenticated = false;
  private authSubscription: Subscription | undefined;

  constructor(
    private loginService: LoginService,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('Im initializing the NavBar');
    this.authSubscription = this.loginService.authStatus$.subscribe(status => {
      this.isAuthenticated = status;
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe to avoid memory leaks
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  logout(): void {
    this.loginService.logout();
    this.router.navigate(['']);
  }
}
