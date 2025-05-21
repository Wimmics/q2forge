import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { isQuestionsCookie, QuestionsCookie } from '../models/cookie-items';
import { DialogService } from './dialog.service';
import { CompetencyQuestion } from '../models/competency-question';
import { DEFAULT_COOKIE_EXPIRATION_DAYS } from './predefined-variables-commun';


@Injectable({
  providedIn: 'root'
})
export class CookieManagerService {

  constructor(private cookieService: CookieService, private dialogService: DialogService) {

  }

  addQuestionsToCookies(competencyQuestions: CompetencyQuestion[]) {

    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + DEFAULT_COOKIE_EXPIRATION_DAYS);

    let questionCookie: QuestionsCookie;

    if (this.cookieService.check('questions')) {
      try {
        let cookie = JSON.parse(this.cookieService.get('questions'));

        if (isQuestionsCookie(cookie)) {
          competencyQuestions.forEach(question => {
            if (!cookie.questions.some(item => item.question === question.question)) {
              cookie.questions.push(question);
            } else {
              this.dialogService.notifyUser('Duplicate Entry', 'The question: "' + question.question + '" already exists in the cookie.');
              return;
            }
          });
          cookie.expirationDate = expirationDate.toISOString();
          questionCookie = cookie;
        } else {
          this.cookieService.delete('questions');
          questionCookie = {
            questions: competencyQuestions,
            expirationDate: expirationDate.toISOString()
          };
        }
      } catch (e) {
        this.cookieService.delete('questions');

        questionCookie = {
          questions: competencyQuestions,
          expirationDate: expirationDate.toISOString()
        };
      }
    } else {
      questionCookie = {
        questions: competencyQuestions,
        expirationDate: expirationDate.toISOString()
      };
    }

    this.cookieService.set('questions', JSON.stringify(questionCookie), { expires: 7 });

  }
}