import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink} from '@angular/router';

@Component({
  selector: 'app-flip-card',
  templateUrl: './flip-card.component.html',
  styleUrls: ['./flip-card.component.scss'],
  imports: [MatIconModule, MatButtonModule, RouterLink],
})
export class FlipCardComponent {
  @Input() description: string = '';
  @Input() icon: string = '';
  @Input() tryLink: string = '';
  @Input() readMoreLink: string = '';
  isFlipped: boolean = false;


  flipCard() {
    this.isFlipped = !this.isFlipped;
  }

}
