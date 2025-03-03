import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DEFAULT_CONFIG_ENDPOINT } from './predefined-variables';


@Injectable({
  providedIn: 'root'
})
export class ConfigManagerService {

  private defaultConfig: any

  constructor(private http: HttpClient) {
    this.initConfiguration();
   }

  initConfiguration(): void {
    this.http.get(DEFAULT_CONFIG_ENDPOINT).subscribe((data: any) => {
      this.defaultConfig = JSON.parse(data);
    });
  }

  getPrefixes(){
    return this.defaultConfig.prefixes;
  }

}
