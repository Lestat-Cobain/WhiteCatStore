import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { environment } from '../environments/environment'; // Import environment
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

export interface Product {
  productId: number;
  name: string;
  price: number;
  details: ProductDetails;
  imageUrl?: string; // Added image URL property
}

export interface ProductDetails {
  productId: number;
  provider: string;
  productDetails: string;
  guaranteeTime: string;
  inStock: number;
}

export interface Login {
  email: String;
  password: String;
}


@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl,{withCredentials: true});
  }

  getProduct(productId: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${productId}`, {withCredentials: true});
  }

  addProduct(product: Product): Observable<Product> {
    console.log('Product to add: ' + product);
    return this.http.post<Product>(this.apiUrl, product, {withCredentials: true});
  }

  updateProduct(product: Product): Observable<Product> {
    return this.http.put<Product>(this.apiUrl, product, {withCredentials: true});
  }

  deleteProduct(productId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${productId}`, {withCredentials: true});
  }
}

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private apiUrl = environment.apiUrl;
  private authStatus = new BehaviorSubject<boolean>(false);
  authStatus$ = this.authStatus.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  getLogin(login: Login): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, login, {
      withCredentials: true
    }).pipe(
      tap(() => this.authStatus.next(true))
    );
  }

  validateAuth(): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/products/validate`, {
      withCredentials: true
    }).pipe(
      tap((isAuth) => this.authStatus.next(isAuth)),
      catchError(() => {
        this.authStatus.next(false);
        return of(false);
      })
    );
  }

  checkSession(): Observable<boolean> {
    return this.http.get<boolean>('https://localhost:7080/products/validate', { withCredentials: true });
  }  

  isAuthenticated(): boolean {
    return this.authStatus.getValue();
  }

  logout(): void {
    this.http.post('https://localhost:7080/logout', {}, { withCredentials: true }).subscribe(() => {
      this.authStatus.next(false);
      this.router.navigate(['']);
    });
  }  

  setAuthenticated(isAuth: boolean): void {
    this.authStatus.next(isAuth);
  }
}