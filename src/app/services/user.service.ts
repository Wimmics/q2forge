import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { USER_DATA_ENDPOINT } from "./predefined-variables";
import { DialogService } from "./dialog.service";
import { User } from "../models/user-data";
import { AuthService } from "./auth.service";
import { Subject } from "rxjs";

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

}