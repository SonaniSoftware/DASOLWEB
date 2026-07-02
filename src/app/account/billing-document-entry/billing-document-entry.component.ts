import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-billing-document-entry',
  standalone: false,
  templateUrl: './billing-document-entry.component.html',
  styleUrl: '../../developer/developer-page.scss',
})
export class BillingDocumentEntryComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  /** Bill_ID passed from the list (null when opened via "New"). */
  readonly billId = this.route.snapshot.paramMap.get('billId');

  /** Back to the Billing Document List. */
  back(): void {
    this.router.navigateByUrl('/account/billing-document-list');
  }
}
