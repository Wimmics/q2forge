import { AfterViewInit, Component, OnInit } from '@angular/core';
import { MarkdownComponent } from 'ngx-markdown';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { GraphSchema } from '../../models/graph-schema';
import { ConfigManagerService } from '../../services/config-manager.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FlipCardComponent } from "../flip-card/flip-card.component";
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-home',
  imports: [MarkdownComponent, MatProgressSpinner, FlipCardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {

  scenariosSchema: GraphSchema[] | undefined;
  safeDemoVideoURL?: SafeResourceUrl;
  private demoVideoURL: string = 'https://www.youtube.com/embed/jwlaz6c8tYo';

  constructor(private configManagerService: ConfigManagerService, private activatedRoute: ActivatedRoute,
     private router: Router,private _sanitizer: DomSanitizer) { }



  ngOnInit(): void {
    this.configManagerService.getScenariosSchema().then(response => {
      this.scenariosSchema = response;
      this.activatedRoute.fragment.subscribe(fragment => {
        if (fragment)
          this.scrollToFragment(fragment);
      });
    });

    this.safeDemoVideoURL = this._sanitizer.bypassSecurityTrustResourceUrl(this.demoVideoURL);
  }

  scrollToFragment(fragment: string) {
    this.router.navigate(['/'], { fragment: fragment });
  }
}
