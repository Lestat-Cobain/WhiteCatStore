import { Component, OnInit,  ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ProductService, Product } from '../product.service'; // Adjust the path as needed
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [FormsModule, CommonModule, MatFormFieldModule, MatInputModule, RouterModule, MatButtonModule],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.css']
})
export class ProductFormComponent implements OnInit {
  product: Product = { productId: 0, name: '', price: 0, details: { productId: 0 , provider: '', productDetails: '', guaranteeTime: '', inStock: 0 }, imageUrl: '' };
  isEditMode = false;

  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit() {
    // Check if we have a productId in route parameters to determine if it's edit mode
    const productId = this.route.snapshot.paramMap.get('productId');
    if (productId) {
      this.isEditMode = true;
      this.loadProduct(+productId); // Convert the productId to number and load the product details
    } else {
      this.isEditMode = false;
    }
  }


  loadProduct(productId: number) {
    this.productService.getProduct(productId).subscribe(
      (data: Product) => {
        this.product = data;
        console.log(data);
      },
      (error) => {
        console.error('Error fetching product data', error);
      }
    );
  }

  /* onSubmit() {
    if (this.isEditMode) {
      this.productService.updateProduct(this.product).subscribe(
        () => this.router.navigate(['product/list']),
        (error) => console.error('Error updating product', error)
      );
    } else {
      console.log('adding the following product: ' + this.product);
      this.productService.addProduct(this.product).subscribe(
        () => this.router.navigate(['product/list']),
        (error) => console.error('Error adding product', error)
      );
    }
  } */

    onSubmit() {
      if (!this.product.imageUrl) {
        console.error('Image not processed yet!');
        return;
      }
    
      console.log('Adding the following product:', this.product);
      
      if (this.isEditMode) {
        this.productService.updateProduct(this.product).subscribe(
          () => this.router.navigate(['product/list']),
          (error) => console.error('Error updating product', error)
        );
      } else {
        this.productService.addProduct(this.product).subscribe(
          () => this.router.navigate(['product/list']),
          (error) => console.error('Error adding product', error)
        );
      }
    }
    

  goBack(){
    this.router.navigate(['product/list']);
  }

  /* onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
  
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      this.resizeImage(reader.result as string, 300, 300); // Resize to 300x300 pixels
    };
  } */
  
  // Resize image function
  /* resizeImage(base64Str: string, maxWidth: number, maxHeight: number) {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
  
      canvas.width = maxWidth;
      canvas.height = maxHeight;
  
      ctx?.drawImage(img, 0, 0, maxWidth, maxHeight);
  
      this.product.imageUrl = canvas.toDataURL('image/jpeg', 0.8); // Convert to base64
    };
  } */

    onFileSelected(event: any) {
      const file = event.target.files[0];
      if (!file) return;
    
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.resizeImage(reader.result as string, 300, 300, (resizedBase64) => {
          this.product.imageUrl = resizedBase64;
          console.log('Resized Image:', this.product.imageUrl); // Ensure correct base64 is assigned
        });
      };
    }
    

    resizeImage(base64Str: string, maxWidth: number, maxHeight: number, callback: (resizedBase64: string) => void) {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
    
        canvas.width = maxWidth;
        canvas.height = maxHeight;
    
        ctx?.drawImage(img, 0, 0, maxWidth, maxHeight);
    
        const resizedBase64 = canvas.toDataURL('image/jpeg', 0.8); // Convert to base64
        callback(resizedBase64);
      };
    }
    

  clearImage() {
    this.product.imageUrl = ''; // Clear the preview
    if (this.fileInput) {
      this.fileInput.nativeElement.value = ''; // Reset file input
    }
  }
}
