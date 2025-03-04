import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DEFAULT_CONFIG_ENDPOINT } from './predefined-variables';


@Injectable({
  providedIn: 'root'
})
export class ConfigManagerService {

  private defaultConfig: any

  resolveSeq2SeqModelsFn: ((value: any) => void) | null = null;
  resolveTextEmbeddingModelsFn: ((value: any) => void) | null = null;

  constructor(private http: HttpClient) {
    this.initConfiguration();
  }

  initConfiguration(): void {
    this.http.get(DEFAULT_CONFIG_ENDPOINT).subscribe((data: any) => {
      this.setDefaultConfig(data);
    });
  }

  getPrefixes() {
    return this.defaultConfig.prefixes;
  }

  getSequ2SeqModels(): Promise<any> {
    return new Promise((resolve) => {
      if (this.defaultConfig) {
        resolve(Object.keys(this.defaultConfig.seq2seq_models));
      } else {
        this.resolveSeq2SeqModelsFn = resolve;
      }
    });
  }

  // Set value and resolve promise
  setDefaultConfig(value: string) {
    this.defaultConfig = JSON.parse(value);

    if (this.resolveSeq2SeqModelsFn) {
      this.resolveSeq2SeqModelsFn(Object.keys(this.defaultConfig.seq2seq_models));
      this.resolveSeq2SeqModelsFn = null; // Prevent multiple calls
    }

    if (this.resolveTextEmbeddingModelsFn) {
      this.resolveTextEmbeddingModelsFn(Object.keys(this.defaultConfig.text_embedding_models));
      this.resolveTextEmbeddingModelsFn = null; // Prevent multiple calls
    }
  }

  getTextEmbeddingModels(): Promise<any> {
    return new Promise((resolve) => {
      if (this.defaultConfig) {
        resolve(Object.keys(this.defaultConfig.text_embedding_models));
      } else {
        this.resolveTextEmbeddingModelsFn = resolve;
      }
    });
  }

}
