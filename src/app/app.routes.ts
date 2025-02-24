import { Routes } from '@angular/router';
import { SPARQLJudgeComponent } from './sparqljudge/sparqljudge.component';
import { QuestionGeneratorComponent } from './question-generator/question-generator.component';

export const routes: Routes = [
    { path: 'question-generator', component: QuestionGeneratorComponent },
    { path: 'sparql-judge', component: SPARQLJudgeComponent },
    // { path: '', redirectTo: '/sparql-judge', pathMatch: 'full' }, // redirect to `sparql-judge`
];
