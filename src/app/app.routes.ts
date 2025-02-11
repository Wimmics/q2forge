import { Routes } from '@angular/router';
import { SPARQLJudgeComponent } from './sparqljudge/sparqljudge.component';

export const routes: Routes = [
    { path: 'sparql-judge', component: SPARQLJudgeComponent },
    // { path: '', redirectTo: '/sparql-judge', pathMatch: 'full' }, // redirect to `sparql-judge`
];
