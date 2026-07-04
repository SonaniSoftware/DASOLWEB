import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AdminLayoutComponent } from './main/admin-layout/admin-layout.component';
import { GuestLayoutComponent } from './main/guest-layout/guest-layout.component';
import { GuestHomeLayoutComponent } from './main/guest-home-layout/guest-home-layout.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { MainDashboardComponent } from './dashboard/main-dashboard/main-dashboard.component';
import { ModuleGroupComponent } from './modules/module-group/module-group.component';
import { ModuleMasterComponent } from './developer/module-master/module-master.component';
import { MenuMasterComponent } from './developer/menu-master/menu-master.component';
import { FormMasterComponent } from './developer/form-master/form-master.component';
import { ProcessTypeComponent } from './developer/process-type/process-type.component';
import { ProcessStatusComponent } from './developer/process-status/process-status.component';
import { ProcessMasterComponent } from './developer/process-master/process-master.component';
import { ProcessPermitComponent } from './developer/process-permit/process-permit.component';
import { ModulePermitComponent } from './settings/module-permit/module-permit.component';
import { MenuPermitComponent } from './settings/menu-permit/menu-permit.component';
import { LookupMasterComponent } from './general/lookup-master/lookup-master.component';
import { VendorMasterComponent } from './purchase/vendor-master/vendor-master.component';
import { EmployeeRegisterComponent } from './employee/employee-register/employee-register.component';
import { BillingDocumentListComponent } from './account/billing-document-list/billing-document-list.component';
import { BillingDocumentEntryComponent } from './account/billing-document-entry/billing-document-entry.component';
import { PaymentRequestEntryComponent } from './account/payment-request-entry/payment-request-entry.component';
import { ProfileComponent } from './profile/profile.component';
import { authGuard, guestGuard } from './core/gaurds/auth.guard';

const routes: Routes = [
  // Public (auth) area — shown first. Logged-in users are bounced to the dashboard.
  {
    path: 'auth',
    component: GuestLayoutComponent,
    canActivate: [guestGuard],
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
    ],
  },

  // Guest home — logged-in users with no admin group (GroupID 0/1/null).
  {
    path: 'guest',
    component: GuestHomeLayoutComponent,
    canActivate: [authGuard],
  },

  // Protected (main) area — only reachable after login.
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard/default', pathMatch: 'full' },
      { path: 'dashboard/default', component: MainDashboardComponent, data: { title: 'Dashboard', icon: 'dashboard' } },
      { path: 'profile', component: ProfileComponent, data: { title: 'My Profile', icon: 'person' } },
      { path: 'modules/:code', component: ModuleGroupComponent },
      { path: 'modules/:code/:menuId', component: ModuleGroupComponent },

      // Developer admin screens (forms point their RoutePath here)
      { path: 'developer/module-master', component: ModuleMasterComponent, data: { title: 'Module Master', icon: 'dataset' } },
      { path: 'developer/menu-master', component: MenuMasterComponent, data: { title: 'Menu Master', icon: 'list_alt' } },
      { path: 'developer/form-master', component: FormMasterComponent, data: { title: 'Form Master', icon: 'description' } },
      { path: 'developer/process-type', component: ProcessTypeComponent, data: { title: 'Process Type', icon: 'category' } },
      { path: 'developer/process-status', component: ProcessStatusComponent, data: { title: 'Process Status', icon: 'flag' } },
      { path: 'developer/process-master', component: ProcessMasterComponent, data: { title: 'Process Master', icon: 'account_tree' } },
      { path: 'developer/process-permit', component: ProcessPermitComponent, data: { title: 'Process Permit', icon: 'rule' } },

      // Settings module screens
      { path: 'settings/module-permit', component: ModulePermitComponent, data: { title: 'Module Permit', icon: 'admin_panel_settings' } },
      { path: 'settings/menu-permit', component: MenuPermitComponent, data: { title: 'Menu Permit', icon: 'admin_panel_settings' } },

      // General module screens
      { path: 'general/lookup-master', component: LookupMasterComponent, data: { title: 'Lookup Master', icon: 'list' } },

      // Purchase module screens
      { path: 'purchase/vendor-master', component: VendorMasterComponent, data: { title: 'Vendor Master', icon: 'store' } },

      // Employee (HRM) module screens
      { path: 'employee/employee-register', component: EmployeeRegisterComponent, data: { title: 'Employee Register', icon: 'badge' } },

      // Account module screens
      { path: 'account/billing-document-list', component: BillingDocumentListComponent, data: { title: 'Billing Document List', icon: 'receipt_long' } },
      { path: 'account/billing-document-entry', component: BillingDocumentEntryComponent, data: { title: 'Billing Document Entry', icon: 'note_add' } },
      { path: 'account/billing-document-entry/:billId', component: BillingDocumentEntryComponent, data: { title: 'Billing Document Entry', icon: 'note_add' } },
      { path: 'account/payment-request-entry', component: PaymentRequestEntryComponent, data: { title: 'Payment Request Entry', icon: 'request_quote' } },
      { path: 'account/payment-request-entry/:billId', component: PaymentRequestEntryComponent, data: { title: 'Payment Request Entry', icon: 'request_quote' } },
    ],
  },

  { path: '**', redirectTo: 'auth/login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
