import { Component, OnInit, inject } from '@angular/core';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  private theme = inject(ThemeService);
  title = 'DASOLWEB';

  ngOnInit(): void {
    this.theme.init();
  }
}
