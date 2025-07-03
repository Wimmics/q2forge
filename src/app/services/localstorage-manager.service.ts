import { Injectable } from '@angular/core';
import { isQuestionsCookie, QuestionsCookie } from '../models/cookie-items';
import { DialogService } from './dialog.service';
import { CompetencyQuestion } from '../models/competency-question';
import { DEFAULT_COOKIE_EXPIRATION_DAYS } from './predefined-variables-commun';


@Injectable({
  providedIn: 'root'
})
export class LocalStorageManagerService {

  constructor(private dialogService: DialogService) {

  }
  addQuestionsToLocalStorage(competencyQuestions: CompetencyQuestion[]) {

    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + DEFAULT_COOKIE_EXPIRATION_DAYS);

    let questionCookie: QuestionsCookie;

    
    let questionCookieString = localStorage.getItem('questions');
    if (questionCookieString) {
      try {
        let cookie = JSON.parse(questionCookieString);

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
          localStorage.removeItem('questions');
          questionCookie = {
            questions: competencyQuestions,
            expirationDate: expirationDate.toISOString()
          };
        }
      } catch (e) {
        localStorage.removeItem('questions');

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

    localStorage.setItem('questions', JSON.stringify(questionCookie));

  }
}
