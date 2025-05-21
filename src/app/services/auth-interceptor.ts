import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { AuthService } from "./auth-service";
import { API_BASE } from "./predefined-variables";


export const authInterceptor: HttpInterceptorFn = (req, next) => {


    if (!req.url.startsWith(API_BASE)) {
        return next(req);
    }

    const authService = inject(AuthService);

    const access_token = authService.getAccessToken();

    if (!access_token) {
        return next(req);
    }

    const authRequest = req.clone({
        headers: req.headers.set("Authorization", `Bearer ${access_token}`)
    })

    return next(authRequest);
}
