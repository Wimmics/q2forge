import { Routes } from '@angular/router';
import { SPARQLQueryRefinementComponent } from './components/sparql-query-refinement/sparql-query-refinement.component';
import { CompetencyQuestionGeneratorComponent } from './components/competency-question-generation/competency-question-generation.component';
import { SPARQLQueryGeneratorExecutorComponent } from './components/sparql-query-generator-executor/sparql-query-generator-executor.component';
import { HomeComponent } from './components/home/home.component';
import { KGConfigurationCreationComponent } from './components/kg-configuration-creation/kg-configuration-creation.component';

export const routes: Routes = [
    { path: 'competency-question-generator', component: CompetencyQuestionGeneratorComponent },
    { path: 'sparql-query-generator', component: SPARQLQueryGeneratorExecutorComponent },
    { path: 'sparql-query-refinement', component: SPARQLQueryRefinementComponent },
    { path: 'kg-configuration-creation', component: KGConfigurationCreationComponent },
    { path: '', component: HomeComponent },
];
