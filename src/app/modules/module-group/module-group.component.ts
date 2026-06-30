import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { findModuleGroup, ModuleGroup } from '../module-groups';
import { FormRef, ModuleService } from '../../core/services/module.service';

@Component({
  selector: 'app-module-group',
  standalone: false,
  templateUrl: './module-group.component.html',
  styleUrl: './module-group.component.scss',
})
export class ModuleGroupComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private moduleApi = inject(ModuleService);

  group?: ModuleGroup;
  menuId?: string;
  menuName?: string;
  forms: FormRef[] = [];
  loading = false;

  constructor() {
    this.route.paramMap.subscribe((params) => {
      const code = params.get('code');
      const menuId = params.get('menuId');

      this.group = findModuleGroup(code);
      this.menuId = menuId ?? undefined;
      this.menuName = undefined;
      this.forms = [];

      if (menuId) {
        this.loadMenuForms(menuId);
      }
    });
  }

  private loadMenuForms(menuId: string): void {
    this.loading = true;
    this.moduleApi.getMenuForms(menuId).subscribe({
      next: (forms) => {
        // Open the menu's form directly — skip this listing page.
        const target = forms.find((f) => f.routePath);
        if (target?.routePath) {
          this.router.navigateByUrl(target.routePath.toLowerCase(), { replaceUrl: true });
          return;
        }
        this.forms = forms;
        this.menuName = forms[0]?.menuName;
        this.loading = false;
      },
      error: () => {
        this.forms = [];
        this.loading = false;
      },
    });
  }
}
