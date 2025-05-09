import { AfterViewInit, Component, OnInit } from '@angular/core';
import { MarkdownComponent } from 'ngx-markdown';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { GraphSchema } from '../../models/graph-schema';
import { ConfigManagerService } from '../../services/config-manager.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FlipCardComponent } from "../flip-card/flip-card.component";

@Component({
  selector: 'app-home',
  imports: [MarkdownComponent, MatProgressSpinner, FlipCardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {

  scenariosSchema: GraphSchema[] | undefined;

  constructor(private configManagerService: ConfigManagerService, private activatedRoute: ActivatedRoute, private router: Router) { }


  ngOnInit(): void {
    this.configManagerService.getScenariosSchema().then(response => {
      this.scenariosSchema = response;
      this.activatedRoute.fragment.subscribe(fragment => {
        if (fragment)
          this.scrollToFragment(fragment);
      });
    });
  }

  scrollToFragment(fragment: string) {
    this.router.navigate(['/'], { fragment: fragment });
  }
}
