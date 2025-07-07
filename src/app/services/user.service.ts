import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { UPDATE_SPARQL_CHATS_ENDPOINT, USER_DATA_ENDPOINT } from "./predefined-variables";
import { DialogService } from "./dialog.service";
import { User } from "../models/user-data";
import { AuthService } from "./auth.service";
import { Observable, Subject } from "rxjs";
import { ChatMessage, SPARQLChatMessages } from "../models/chat-message";

@Injectable({ providedIn: "root" })
export class UserService {

    private userData: User | undefined;

    private userDataSub = new Subject<User>();

    constructor(private http: HttpClient, private authService: AuthService, private dialogService: DialogService) { }

    getUserDataSub() {
        return this.userDataSub.asObservable();
    }

    getUserData() {
        if (this.userData) {
            return this.userDataSub.next(this.userData);
        }

        this.http.get<User>(USER_DATA_ENDPOINT).subscribe({
            next: (user: User) => {
                this.userData = user;
                this.userDataSub.next(user);
            },
            error: (error: any) => {
                this.userDataSub.error(error);
            }

        })
    }


    updateSPARQLChats(chat_id: string, chat_messages: ChatMessage[]): Observable<User> {

        const body = {
            "_id": chat_id,
            "messages":chat_messages,
            "created_at": new Date().toISOString()
        };


        let postObservable = this.http.post<SPARQLChatMessages>(UPDATE_SPARQL_CHATS_ENDPOINT, body)

        postObservable.subscribe({
            next: (response: SPARQLChatMessages) => {
                this.userData?.sparql_chats?.push(response);
                this.userDataSub.next(this.userData!);
            },
        });

        return this.getUserDataSub()

    }


}