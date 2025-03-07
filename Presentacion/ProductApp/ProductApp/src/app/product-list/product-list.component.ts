import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { NavbarComponent } from '../navbar/navbar.component';
import { ProductService, Product } from '../product.service';
import { RouterModule } from '@angular/router';  // Import RouterModule
import { Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDeleteDialogComponent } from '../confirm-delete-dialog/confirm-delete-dialog.component';
import { ProductDetailModalComponent } from '../details-modal/details-modal.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatDialogModule, RouterModule, NavbarComponent],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent {
    displayedColumns: string[] = ['productId', 'name', 'price', 'actions'];
    products: Product[] = [];

    constructor(private productService: ProductService, private router: Router, public dialog: MatDialog) {}
  
    ngOnInit(): void {
      this.loadProducts();
    }
  
    loadProducts(): void {
      this.productService.getProducts().subscribe(disProducts => {
        console.log(disProducts);
        this.products = disProducts;
      });
    }

    editProduct(productId: number) {
      this.router.navigate(['product/edit', productId]);  
    }

    deleteProduct(productId: number): void {
      const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
        height: '400px',
        width: '600px',
      });
  
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          // User confirmed the deletion
          this.performDelete(productId)
        }
      });
    }

    openProductDetails(productId: number) {
      if (!productId) {
        console.error('Invalid product ID:', productId);
        return;
      }

      console.log('Opening modal for product ID:', productId); // Debugging line ✅

      const product = this.products.find(p => p.productId === productId);
        this.dialog.open(ProductDetailModalComponent, {
          width: '1200px',
          height: '700px',
          data: { productId }
        });
    }
  
    performDelete(productId: number): void {
      this.productService.deleteProduct(productId).subscribe(() => {
        this.loadProducts();  
      });
    }
}
