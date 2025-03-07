import { Component, ElementRef, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { ProductService, Product } from '../product.service';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-product-scanner',
  standalone: true,
  imports: [MatCardModule, CommonModule, MatSelectModule, MatButtonModule, RouterModule],
  template: `
  <div class="product-form-container"> 
    <form>
      <mat-card class="scanner-container">
          <h2>Add products</h2>       
          <div class="video-container">
            <video #video class="video-preview"></video>
            <div class="overlay" [class.success]="isBarcodeDetected"></div>
          </div>
          <div *ngIf="scannedResult">
            <h3>Scanned Product ID: {{ scannedResult }}</h3>
            <button mat-raised-button color="primary" (click)="registerProduct()">Register Product</button>
          </div>
          <b>Select any device to scan</b>
          <mat-form-field>
            <mat-select (change)="switchCamera($event)">
              <mat-option *ngFor="let device of videoDevices" [value]="device.deviceId">
                {{ device.label || 'Unnamed Device' }}
              </mat-option>
            </mat-select>
          </mat-form-field>
      </mat-card>
      <div class="button-container">
        <button mat-raised-button color="primary" (click)="goBack()">
          Go Back
        </button>
      </div>
    </form>
  </div>
  `,
  styles: [`

.product-form-container, body, html {
      margin: 0;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      /*background-color: #f0f0f0; /* Optional: Sets a background color */
    }

    .scanner-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px;
      max-width: 600px;
      margin: auto;
    }

    form {
    width: 100%; /* Ensures responsiveness */
    display: block;
    justify-content: center;
    align-items: center;
    }

    .video-container {
      position: relative;
      width: 100%;
      max-width: 600px;
    }

    .video-preview {
      width: 100%;
      max-height: 300px;
    }

    .overlay {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 80%;
      height: 40%;
      border: 2px solid #00ff00; /* Green for guidance */
      transform: translate(-50%, -50%);
      pointer-events: none; /* Allows interaction with the video element */
    }

    .overlay.success {
      border-color: #00ff00; /* Green when a barcode is detected */
      background: rgba(0, 255, 0, 0.1); /* Optional semi-transparent background */
    }

    .button-container {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-top: 16px; /* Adjust spacing as needed */
    }

    .row {
      display: flex;
      flex-wrap: wrap;
        gap: 30px; /* Controls the spacing between items */
    }

    .col {
      flex: 1;
    }
  `]
})
export class ProductScannerComponent implements OnInit, OnDestroy {
  @ViewChild('video', { static: true }) videoElement!: ElementRef<HTMLVideoElement>;
  scannedResult: string | null = null;
  product: Product = { productId: 0, name: '', price: 0, details: { productId: 0, provider: '', productDetails: '', guaranteeTime: '', inStock: 0 } };

  private codeReader = new BrowserMultiFormatReader();
  private activeStream: MediaStream | null = null;
  private activeDeviceId: string | undefined = undefined;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private router: Router
  ) { }

  ngOnInit() {
    this.listVideoDevices().then(() => this.startScanner());
  }

  isBarcodeDetected = false;
  videoDevices: { deviceId: string; label: string }[] = [];

  async listVideoDevices() {
    try {
      this.videoDevices = await BrowserMultiFormatReader.listVideoInputDevices();
      if (this.videoDevices.length > 0) {
        this.activeDeviceId = this.videoDevices[0].deviceId; // Default to the first available device
        console.log('Available video devices:', this.videoDevices);
      } else {
        console.warn('No video input devices found');
      }
    } catch (err) {
      console.error('Error listing video input devices:', err);
    }
  }

  switchCamera(event: Event) {
    const selectedDeviceId = (event.target as HTMLSelectElement).value;
    this.activeDeviceId = selectedDeviceId;
    this.stopScanner();
    this.startScanner();
  }

  playBeep() {
    const audio = new Audio('assets/beep.mp3');
    audio.play();
  }

  startScanner() {
    let lastScannedCode: string | null = null; // Keep track of the last scanned product
    let scanTimeout: any = null; // Timeout to reset the last scanned code
    let productCounter = 0;

    this.codeReader
      .decodeFromVideoDevice(this.activeDeviceId, this.videoElement.nativeElement, (result, err) => {
        if (result) {
          const scannedCode = result.getText();
          
          // Check if the scanned code is the same as the last scanned code
          if (scannedCode !== lastScannedCode) {
            this.scannedResult = scannedCode;
            productCounter++;
            console.log(productCounter);
            console.log('Scanned result:', this.scannedResult);
            this.isBarcodeDetected = true; // Indicate a successful scan
            this.playBeep();

            // Update the last scanned code
            lastScannedCode = scannedCode;
  
            // Set a timeout to reset the last scanned code after a delay
            if (scanTimeout) clearTimeout(scanTimeout);
            scanTimeout = setTimeout(() => {
              lastScannedCode = null;
              this.isBarcodeDetected = false; // Allow new scans after timeout
            }, 1000); // Adjust the delay as needed (e.g., 2000ms = 2 seconds)
          }
        } else {
          this.isBarcodeDetected = false; // Reset if no barcode is detected
        }
      })
      .catch((error) => console.error('Error starting scanner:', error));
  }

  stopScanner() {
    if (this.activeStream) {
      this.activeStream.getTracks().forEach((track) => track.stop()); // Stop all tracks
      this.activeStream = null;
    }
    this.videoElement.nativeElement.srcObject = null; // Clear the video source
  }

  registerProduct() {
    // Call your backend to register the product.
    console.log('Registering product with ID:', this.scannedResult);
    this.productService.addProduct(this.product).subscribe(
      () => this.router.navigate(['product/list']),
      (error) => console.error('Error adding product', error)
    );
  }

  goBack(){
    this.router.navigate(['product/list']);
  }

  ngOnDestroy() {
    this.stopScanner(); // Ensure resources are released when the component is destroyed
  }
}
