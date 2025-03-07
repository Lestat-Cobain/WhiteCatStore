import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment'; // Import environment
import { BehaviorSubject } from 'rxjs';

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
    return this.http.get<Product[]>(this.apiUrl);
  }

  getProduct(productId: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${productId}`);
  }

  addProduct(product: Product): Observable<Product> {
    console.log('Product to add: ' + product);
    return this.http.post<Product>(this.apiUrl, product);
  }

  updateProduct(product: Product): Observable<Product> {
    return this.http.put<Product>(this.apiUrl, product);
  }

  deleteProduct(productId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${productId}`);
  }
}

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private apiUrl = `${environment.apiUrl}`; // Your API base URL
  private authStatus = new BehaviorSubject<boolean>(this.isAuthenticated());

  authStatus$ = this.authStatus.asObservable();

  constructor(private http: HttpClient) {}

  getLogin(login: Login): Observable<any> {
    console.log('Im in getLogin function with this credentials: ');
    console.log(this.authStatus);
    this.authStatus.next(true); // Notify subscribers about the change
    console.log(this.authStatus);
    return this.http.post(`${this.apiUrl}/login`, login);
  }

  storeToken(token: string): void {
    console.log(token? 'This is the token: ' + token : 'There is not a token yet');
    localStorage.setItem('authToken', token);
  }

  isAuthenticated(): boolean {
    // Check if token exists in local storage
    console.log('Im in isAuthenticated function');
    console.log(localStorage.getItem('authToken'));
    return !!localStorage.getItem('authToken');
  }

  logout(): void {
    console.log('Im in logout function');
    console.log(this.authStatus);
    this.authStatus.next(false);
    console.log(this.authStatus);
    localStorage.removeItem('authToken');
  }
}
