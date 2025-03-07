import { Component, Inject, OnInit, ChangeDetectorRef  } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { ProductService, Product } from '../product.service';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-detail-modal',
  template: `
    <mat-dialog-content class="dialog-content">
      <h2 class="center-actions">Product Details</h2>
      
      <ng-container *ngIf="product; else loading">
        <p><strong>Provider:</strong> {{ product.details.provider }}</p>
        <p><strong>Details:</strong> {{ product.details.productDetails }}</p>
        <p><strong>Guarantee Time:</strong> {{ product.details.guaranteeTime }}</p>
        <p><strong>In Stock:</strong> {{ product.details.inStock }}</p>

        <!-- Image Section -->
        <div class="image-upload-container">
          <div *ngIf="product?.imageUrl; else noImage" class="image-preview-container">
            <img [src]="product.imageUrl" class="image-preview" alt="Product Image">
          </div>
        </div>
      </ng-container>

      <ng-template #noImage>
        <p>No Image Available</p>
      </ng-template>

      <mat-dialog-actions class="center-actions">
        <button class="custom-button" mat-button (click)="onConfirm()">Ok</button>
      </mat-dialog-actions>

      <ng-template #loading>Loading...</ng-template>
    </mat-dialog-content>
  `,
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  styleUrls: ['./details-modal.component.css']
})
export class ProductDetailModalComponent implements OnInit {
  product: Product | undefined;

  constructor(
    private productService: ProductService,
    @Inject(MAT_DIALOG_DATA) public data: { productId: number },
    private dialogRef: MatDialogRef<ProductDetailModalComponent>,
    private cdr: ChangeDetectorRef // 🔥 Force UI update if needed
  ) { }

  ngOnInit(): void {
    this.productService.getProduct(this.data.productId).subscribe((product) => {
      // Ensure product.imageUrl is formatted correctly
      console.log(product.imageUrl);
      if (product.imageUrl) {
        product.imageUrl = this.getImageUrl(product.imageUrl);
        console.log('Product Image in Modal:', product.imageUrl); 
      } else {
        console.warn('No image found for this product'); // Debugging line ✅
      }
      this.product = product;

      // 🔥 Force Angular to detect changes
      this.cdr.detectChanges();
    });
  }
  
  getImageUrl(base64String: string | null | undefined): string {
    if (!base64String || base64String.trim() === '') {
      console.warn("No Base64 string provided.");
      return ''; // No image
    }

    // 🔥 Ensure Base64 has a valid MIME type
    if (!base64String.startsWith('data:image')) {
      return `data:image/png;base64,${base64String}`;
    }

    return base64String;
  }

  onConfirm(): void {
    this.dialogRef.close(false); // Close modal
  }
}
