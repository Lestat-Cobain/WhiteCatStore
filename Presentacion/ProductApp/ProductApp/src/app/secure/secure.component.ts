import { Component, OnInit } from '@angular/core';
import { SecureService } from '../secure.service'; // Adjust path if needed

@Component({
  standalone: true,
  selector: 'app-secure',
  template: `
    <h2>Secure Data</h2>
    <pre>{{ secureData }}</pre>
  `
})
export class SecureComponent implements OnInit {
  secureData: any;

  constructor(private secureService: SecureService) {}

  ngOnInit(): void {
    this.secureService.getSecureData().subscribe(
      (data) => this.secureData = data,
      (error) => console.error('Error fetching secure data', error)
    );
  }
}
