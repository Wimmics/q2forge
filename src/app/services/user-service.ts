import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { USER_DATA_ENDPOINT } from "./predefined-variables";
import { DialogService } from "./dialog.service";
import { User } from "../models/user-data";
import { AuthService } from "./auth-service";

@Injectable({ providedIn: "root" })
export class UserService {

    constructor(private http: HttpClient, private authService: AuthService, private dialogService: DialogService) { }

    getUserData() {
        return this.http.get<User>(USER_DATA_ENDPOINT)
    }

}