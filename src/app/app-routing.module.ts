import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AdminLayoutComponent } from './main/admin-layout/admin-layout.component';
import { GuestLayoutComponent } from './main/guest-layout/guest-layout.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { MainDashboardComponent } from './dashboard/main-dashboard/main-dashboard.component';
import { ModuleGroupComponent } from './modules/module-group/module-group.component';
import { ModuleMasterComponent } from './developer/module-master/module-master.component';
import { MenuMasterComponent } from './developer/menu-master/menu-master.component';
import { FormMasterComponent } from './developer/form-master/form-master.component';
import { ModulePermitComponent } from './developer/module-permit/module-permit.component';
import { LookupMasterComponent } from './general/lookup-master/lookup-master.component';
import { VendorMasterComponent } from './purchase/vendor-master/vendor-master.component';
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

  // Protected (main) area — only reachable after login.
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard/default', pathMatch: 'full' },
      { path: 'dashboard/default', component: MainDashboardComponent, data: { title: 'Dashboard', icon: 'dashboard' } },
      { path: 'modules/:code', component: ModuleGroupComponent },
      { path: 'modules/:code/:menuId', component: ModuleGroupComponent },

      // Developer admin screens (forms point their RoutePath here)
      { path: 'developer/module-master', component: ModuleMasterComponent, data: { title: 'Module Master', icon: 'dataset' } },
      { path: 'developer/menu-master', component: MenuMasterComponent, data: { title: 'Menu Master', icon: 'list_alt' } },
      { path: 'developer/form-master', component: FormMasterComponent, data: { title: 'Form Master', icon: 'description' } },
      { path: 'developer/module-permit', component: ModulePermitComponent, data: { title: 'Module Permit', icon: 'admin_panel_settings' } },

      // General module screens
      { path: 'general/lookup-master', component: LookupMasterComponent, data: { title: 'Lookup Master', icon: 'list' } },

      // Purchase module screens
      { path: 'purchase/vendor-master', component: VendorMasterComponent, data: { title: 'Vendor Master', icon: 'store' } },
    ],
  },

  { path: '**', redirectTo: 'auth/login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
