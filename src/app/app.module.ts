import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { RouteReuseStrategy } from '@angular/router';
import { ToastrModule } from 'ngx-toastr';
import { AgGridAngular } from 'ag-grid-angular';
import { TabReuseStrategy } from './core/strategies/tab-reuse.strategy';

import { AppRoutingModule } from './app-routing.module';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { AppComponent } from './app.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { AdminLayoutComponent } from './main/admin-layout/admin-layout.component';
import { GuestLayoutComponent } from './main/guest-layout/guest-layout.component';
import { MainDashboardComponent } from './dashboard/main-dashboard/main-dashboard.component';
import { AdminNavbarComponent } from './main/admin-navbar/admin-navbar.component';
import { NavbarLeftComponent } from './main/admin-navbar/navbar-left/navbar-left.component';
import { NavbarRightComponent } from './main/admin-navbar/navbar-right/navbar-right.component';
import { NavigationComponent } from './main/navigation/navigation.component';
import { NavItemComponent } from './main/navigation/nav-item/nav-item.component';
import { ModuleGroupComponent } from './modules/module-group/module-group.component';
import { ModuleMasterComponent } from './developer/module-master/module-master.component';
import { MenuMasterComponent } from './developer/menu-master/menu-master.component';
import { FormMasterComponent } from './developer/form-master/form-master.component';
import { ModulePermitComponent } from './developer/module-permit/module-permit.component';
import { GridActionsComponent } from './developer/grid-actions.component';
import { PermitCheckboxComponent } from './developer/permit-checkbox.component';
import { IconPickerComponent } from './developer/icon-picker.component';
import { TabBarComponent } from './main/tab-bar/tab-bar.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    AdminLayoutComponent,
    GuestLayoutComponent,
    MainDashboardComponent,
    AdminNavbarComponent,
    NavbarLeftComponent,
    NavbarRightComponent,
    NavigationComponent,
    NavItemComponent,
    ModuleGroupComponent,
    ModuleMasterComponent,
    MenuMasterComponent,
    FormMasterComponent,
    ModulePermitComponent,
    GridActionsComponent,
    PermitCheckboxComponent,
    IconPickerComponent,
    TabBarComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    AppRoutingModule,
    ToastrModule.forRoot(),
    AgGridAngular
  ],
  providers: [
    provideHttpClient(withInterceptors([authInterceptor])),
    { provide: RouteReuseStrategy, useClass: TabReuseStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
