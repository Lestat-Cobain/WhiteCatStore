import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { LoginService } from './product.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private loginService: LoginService, private router: Router) {}

  canActivate(): boolean {
    if (this.loginService.isAuthenticated()) {
      console.log('Im authenticated now =D');
      return true;
    }
    console.log('i cant to recover the token from the localStorage var, sorry :( ... Now for security ill redirect to you to the login page =D');
    this.router.navigate(['']); // Redirect to login if not authenticated
    return false;
  }
}
