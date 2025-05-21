import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MediaMatcher } from '@angular/cdk/layout';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faGithubSquare, faSquareGithub } from '@fortawesome/free-brands-svg-icons';
import { AuthService } from './services/auth-service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, MatToolbarModule, MatButtonModule, MatIconModule, MatSidenavModule, MatListModule
    , FontAwesomeModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  protected readonly navItems = [{
    name: 'Home',
    route: '/',
    icon: 'home',
    requireUserAuthenticated: false
  }, {
    name: 'KG Configuration Creation',
    route: '/kg-configuration-creation',
    icon: 'settings',
    requireUserAuthenticated: true
  }, {
    name: 'Competency Question Generator',
    route: '/competency-question-generator',
    icon: 'create',
    requireUserAuthenticated: true
  }, {
    name: 'SPARQL Query Generator and Executor',
    route: '/sparql-query-generator',
    icon: 'question_answer',
    requireUserAuthenticated: true
  }, {
    name: 'SPARQL Query Refinement',
    route: '/sparql-query-refinement',
    icon: 'check_circle_outline',
    requireUserAuthenticated: true
  },
    //  {
    //   name: 'About',
    //   route: '/about',
    //   icon: 'info'
    // }, 
  ];

  protected readonly isMobile = signal(true);

  private readonly _mobileQuery: MediaQueryList;
  private readonly _mobileQueryListener: () => void;

  faSquareGithub = faSquareGithub

  private authenticationSub?: Subscription;
  userAuthenticated: boolean = false;

  constructor(private authService: AuthService) {
    const media = inject(MediaMatcher);
    this._mobileQuery = media.matchMedia('(max-width: 600px)');
    this.isMobile.set(this._mobileQuery.matches);
    this._mobileQueryListener = () => this.isMobile.set(this._mobileQuery.matches);
    this._mobileQuery.addEventListener('change', this._mobileQueryListener);
  }

  ngOnInit(): void {
    this.authenticationSub = this.authService.getAuthenticatedSub().subscribe((status) => {
      this.userAuthenticated = status;
    });
    this.authService.authenticateFromLocalStorage();
  }

  ngOnDestroy(): void {
    this._mobileQuery.removeEventListener('change', this._mobileQueryListener);
    this.authenticationSub?.unsubscribe();
  }

  logout() {
    this.authService.logout();
  }
}
