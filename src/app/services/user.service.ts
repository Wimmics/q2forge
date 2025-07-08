import { HttpClient, HttpHeaders } from "@angular/common/http";
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


    addASPARQLChat(chat_id: string, chat_messages: ChatMessage[]): Observable<User> {

        const body = {
            "_id": chat_id,
            "messages": chat_messages,
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


    deleteASPARQLChat(chat: SPARQLChatMessages): Observable<User> {

        const body = {
            "_id": chat._id,
            "messages": chat.messages,
            "created_at": chat.createdAt
        };


        const options = {
            headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
            body: body
        };

        let postObservable = this.http.delete<SPARQLChatMessages>(UPDATE_SPARQL_CHATS_ENDPOINT, options)

        postObservable.subscribe({
            next: (response: SPARQLChatMessages) => {
                if (this.userData) {
                    const updatedItems = this.userData?.sparql_chats?.filter(item => item._id !== response._id);
                    this.userData.sparql_chats = updatedItems;
                    this.userDataSub.next(this.userData!);
                }
            },
            error: (error: any) => {
                this.userDataSub.error(error);
            }
        });
        return this.getUserDataSub()
    }


}