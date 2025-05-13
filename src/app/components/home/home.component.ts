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
  safeFullVideoURL?: SafeResourceUrl;
  private fullVideoURL: string = 'https://www.youtube.com/embed/I3w-jmZRJII';

  safeTeaserVideoURL?: SafeResourceUrl;
  private teaserVideoURL: string = 'https://www.youtube.com/embed/E9rgCZzWH4k';

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

    this.safeTeaserVideoURL = this._sanitizer.bypassSecurityTrustResourceUrl(this.teaserVideoURL);

    this.safeFullVideoURL = this._sanitizer.bypassSecurityTrustResourceUrl(this.fullVideoURL);
  }

  scrollToFragment(fragment: string) {
    this.router.navigate(['/'], { fragment: fragment });
  }
}
