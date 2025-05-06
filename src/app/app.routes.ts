import { Routes } from '@angular/router';
import { SPARQLJudgeComponent } from './components/sparqljudge/sparqljudge.component';
import { QuestionGeneratorComponent } from './components/question-generator/question-generator.component';
import { QuestionAnswererComponent } from './components/question-answerer/question-answerer.component';
import { HomeComponent } from './components/home/home.component';
import { KGConfigurationComponent } from './components/kgconfiguration/kgconfiguration.component';

export const routes: Routes = [
    { path: 'question-generator', component: QuestionGeneratorComponent },
    { path: 'question-answerer', component: QuestionAnswererComponent },
    { path: 'sparql-judge', component: SPARQLJudgeComponent },
    { path: 'kg-configuration', component: KGConfigurationComponent },
    { path: '', component: HomeComponent },
];
