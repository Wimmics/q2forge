import { Injectable } from "@angular/core";
import { API_BASE } from "../../services/predefined-variables";
import { AuthService } from "../../services/auth.service";


@Injectable({ providedIn: 'root' })
export class FetchAuthInterceptorService {

    constructor(private authService: AuthService) { }

    init() {
        const originalFetch = window.fetch;

        window.fetch = async (...args) => {
            const [input, init] = args;

            let url = '';
            if (typeof input === 'string') {
                url = input;
            } else if (input instanceof Request) {
                url = input.url;
            }

            if (!url.startsWith(API_BASE)) {
                return originalFetch.call(window, input, init);
            }

            const access_token = this.authService.getAccessToken();

            if (!access_token) {
                return originalFetch.call(window, input, init);
            }


            // Add headers or log input
            if (init && !init.headers) {
                init.headers = {};
            }

            (init?.headers as any)['Authorization'] = `Bearer ${access_token}`;

            return originalFetch.call(window, input, init);

        };
    }
}