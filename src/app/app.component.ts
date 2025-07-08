import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MediaMatcher } from '@angular/cdk/layout';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSquareGithub } from '@fortawesome/free-brands-svg-icons';
import { AuthService } from './services/auth.service';
import { Subscription } from 'rxjs';
import { FetchAuthInterceptorService } from './utils/interceptors/fetch-auth-interceptor';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { ChatMessage, SPARQLChatMessages } from './models/chat-message';
import { User } from './models/user-data';
import { UserService } from './services/user.service';
import { DialogService } from './services/dialog.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, MatToolbarModule, MatButtonModule, MatIconModule, MatSidenavModule, MatListModule
    , FontAwesomeModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  animations: [
    trigger('indicatorRotate', [
      state('collapsed', style({ transform: 'rotate(0deg)' })),
      state('expanded', style({ transform: 'rotate(180deg)' })),
      transition('expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4,0.0,0.2,1)')
      ),
    ])
  ]
})
export class AppComponent implements OnInit {
  protected readonly navItems = [{
    name: 'Home',
    route: '/',
    icon: 'home',
    requireUserAuthenticated: false
  }, {
    name: 'Configuration Creation',
    route: '/kg-configuration-creation',
    icon: 'settings',
    requireUserAuthenticated: true
  }, {
    name: 'CQ Generator',
    route: '/competency-question-generator',
    icon: 'create',
    requireUserAuthenticated: true
  }, {
    name: 'SPARQL Generator',
    route: '/sparql-query-generator',
    icon: 'question_answer',
    requireUserAuthenticated: true
  }, {
    name: 'SPARQL Refinement',
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

  queryGeneratorExpanded: boolean = true;

  userData = signal<User>({ username: '', disabled: false, active_config_id: '', sparql_chats: [] });

  constructor(private authService: AuthService, private fetchAuthInterceptorService: FetchAuthInterceptorService,
    private userService: UserService, private dialogService: DialogService
  ) {
    const media = inject(MediaMatcher);
    this._mobileQuery = media.matchMedia('(max-width: 600px)');
    this.isMobile.set(this._mobileQuery.matches);
    this._mobileQueryListener = () => this.isMobile.set(this._mobileQuery.matches);
    this._mobileQuery.addEventListener('change', this._mobileQueryListener);
  }

  ngOnInit(): void {

    this.fetchAuthInterceptorService.init();

    this.authenticationSub = this.authService.getAuthenticatedSub().subscribe((status) => {
      this.userAuthenticated = status;

      if (status) {
        this.userService.getUserDataSub().subscribe((user: User) => {
          this.userData.set(user);
        });
        this.userService.getUserData();
      }
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

  removeChatItem(chat: SPARQLChatMessages) {
    console.log('Removing chat with ID:', chat._id);
    
    this.userService.deleteASPARQLChat(chat).subscribe({
      error: (error: any) => {
        this.dialogService.notifyUser("SPARQL Chat", "Error deleting the chat: " + error?.error?.detail);
      }
    });
  }
}
