import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-payment-request-entry',
  standalone: false,
  templateUrl: './payment-request-entry.component.html',
  styleUrl: '../../developer/developer-page.scss',
})
export class PaymentRequestEntryComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  /** Bill_ID passed from the Billing Document List (null when opened directly). */
  readonly billId = this.route.snapshot.paramMap.get('billId');

  back(): void {
    this.router.navigateByUrl('/account/billing-document-list');
  }
}
