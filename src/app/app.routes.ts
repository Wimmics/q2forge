import { Routes } from '@angular/router';
import { SPARQLQueryRefinementComponent } from './components/sparql-query-refinement/sparql-query-refinement.component';
import { CompetencyQuestionGeneratorComponent } from './components/competency-question-generation/competency-question-generation.component';
import { SPARQLQueryGeneratorExecutorComponent } from './components/sparql-query-generator-executor/sparql-query-generator-executor.component';
import { HomeComponent } from './components/home/home.component';
import { KGConfigurationCreationComponent } from './components/kg-configuration-creation/kg-configuration-creation.component';
import { DocumentationComponent } from './components/documentation/documentation.component';
import { LoginComponent } from './components/login/login.component';
import { SignUpComponent } from './components/sign-up/sign-up.component';
import { authGuard } from './services/auth-guard';

export const routes: Routes = [
    { path: 'competency-question-generator', component: CompetencyQuestionGeneratorComponent, canActivate: [authGuard] },
    { path: 'sparql-query-generator', component: SPARQLQueryGeneratorExecutorComponent, canActivate: [authGuard] },
    { path: 'sparql-query-refinement', component: SPARQLQueryRefinementComponent, canActivate: [authGuard] },
    { path: 'kg-configuration-creation', component: KGConfigurationCreationComponent, canActivate: [authGuard] },
    { path: 'login', component: LoginComponent },
    { path: 'sign-up', component: SignUpComponent },
    { path: '', component: HomeComponent },
    { path: 'api/docs', component: DocumentationComponent },
    { path: '**', redirectTo: '', pathMatch: 'full' }, // Redirect to home for any unknown routes
];
