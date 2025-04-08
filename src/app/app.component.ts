import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MediaMatcher } from '@angular/cdk/layout';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faGithubSquare, faSquareGithub } from '@fortawesome/free-brands-svg-icons';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, MatToolbarModule, MatButtonModule, MatIconModule, MatSidenavModule, MatListModule
    , FontAwesomeModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  protected readonly navItem = [{
    name: 'Home',
    route: '/',
    icon: 'home'
  }, {
    name: 'Competency Question Generator',
    route: '/question-generator',
    icon: 'create'
  }, {
    name: 'SPARQL Query Generator',
    route: '/question-answerer',
    icon: 'question_answer'
  }, {

    name: 'SPARQL Query Refinement',
    route: '/sparql-judge',
    icon: 'check_circle_outline'
  }, {

    name: 'New KG Configuration',
    route: '/kg-configuration',
    icon: 'settings'
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

  constructor() {
    const media = inject(MediaMatcher);

    this._mobileQuery = media.matchMedia('(max-width: 600px)');
    this.isMobile.set(this._mobileQuery.matches);
    this._mobileQueryListener = () => this.isMobile.set(this._mobileQuery.matches);
    this._mobileQuery.addEventListener('change', this._mobileQueryListener);
  }

  ngOnDestroy(): void {
    this._mobileQuery.removeEventListener('change', this._mobileQueryListener);
  }
}
