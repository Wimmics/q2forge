import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Subject } from "rxjs";
import { AuthModel } from "../models/auth-model";
import { LOGIN_ENDPOINT, SIGN_UP_ENDPOINT } from "./predefined-variables";
import { DialogService } from "./dialog.service";
import { AccessToken } from "../models/access-token";

@Injectable({ providedIn: "root" })
export class AuthService {

    private access_token?: string;
    private authenticatedSub = new Subject<boolean>();
    private isAuthenticated = false;
    private logoutTimer: any;

    constructor(private http: HttpClient, private router: Router, private dialogService: DialogService) { }

    getIsAuthenticated() {
        return this.isAuthenticated;
    }
    getAuthenticatedSub() {
        return this.authenticatedSub.asObservable();
    }
    getAccessToken() {
        return this.access_token;
    }

    signupUser(username: string, password: string) {

        const authData: AuthModel = { username: username, password: password };

        this.http.post<{ access_token: string, expires_in: number }>(SIGN_UP_ENDPOINT, authData).subscribe({
            next: (res) => {
                this.access_token = res.access_token;
                if (this.access_token) {
                    this.authenticatedSub.next(true);
                    this.isAuthenticated = true;
                    this.logoutTimer = setTimeout(() => { this.logout() }, res.expires_in * 1000 * 60);
                    const now = new Date();
                    const expiresDate = new Date(now.getTime() + (res.expires_in * 1000 * 60));
                    this.storeLoginDetails(this.access_token, expiresDate);
                    this.router.navigate(['/']);
                }
            },
            error: (error: any) => {
                this.dialogService.notifyUser("Error", "Error while login: " + error.error.detail);
            }
        })
    }

    loginUser(username: string, password: string) {

        const body = new URLSearchParams();
        body.set('username', username);
        body.set('password', password);

        const headers = new HttpHeaders({
            'Content-Type': 'application/x-www-form-urlencoded'
        });

        this.http.post<AccessToken>(LOGIN_ENDPOINT, body.toString(), { headers }).subscribe({
            next: (res: any) => {
                this.access_token = res.access_token;
                if (this.access_token) {
                    this.authenticatedSub.next(true);
                    this.isAuthenticated = true;
                    this.logoutTimer = setTimeout(() => { this.logout() }, res.expires_in * 1000 * 60);
                    const now = new Date();
                    const expiresDate = new Date(now.getTime() + (res.expires_in * 1000 * 60));
                    this.storeLoginDetails(this.access_token, expiresDate);
                    this.router.navigate(['/']);
                }
            },
            error: (error: any) => {
                this.dialogService.notifyUser("Error", "Error while login: " + error.error.detail);
            }
        });
    }

    logout() {
        this.access_token = '';
        this.isAuthenticated = false;
        this.authenticatedSub.next(false);
        clearTimeout(this.logoutTimer);
        this.clearLoginDetails();
        this.router.navigate(['/login']);
    }

    storeLoginDetails(access_token: string, expirationDate: Date) {
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('expires_in', expirationDate.toISOString());
    }

    clearLoginDetails() {
        localStorage.removeItem('access_token');
        localStorage.removeItem('expires_in');
    }

    getLocalStorageData() {
        const access_token = localStorage.getItem('access_token');
        const expiresIn = localStorage.getItem('expires_in');

        if (!access_token || !expiresIn) {
            return;
        }
        return {
            'access_token': access_token,
            'expires_in': new Date(expiresIn)
        }
    }

    authenticateFromLocalStorage() {
        const localStorageData = this.getLocalStorageData();
        if (localStorageData) {
            const now = new Date();
            const expiresIn = localStorageData.expires_in.getTime() - now.getTime();

            if (expiresIn > 0) {
                this.access_token = localStorageData.access_token;
                this.isAuthenticated = true;
                this.authenticatedSub.next(true);
                this.logoutTimer = setTimeout(() => { this.logout() }, expiresIn);
            }
        }
    }
}