import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DEFAULT_CONFIG_ENDPOINT } from './predefined-variables';
import { Seq2SeqModel } from '../models/seq2seqmodel';
import { TextEmbeddingModel } from '../models/text-embedding-model';


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

  transformSeq2SeqModels(): Seq2SeqModel[] {
    return Object.entries(this.defaultConfig.seq2seq_models).map(([key, value]) => {
      const model = value as Seq2SeqModel;
      return {
        configName: key,
        base_url: model.base_url,
        id: model.id,
        max_retries: model.max_retries,
        server_type: model.server_type,
        temperature: model.temperature,
        top_p: model.top_p
      };
    });
  }

  transformTextEmbeddingModels(): TextEmbeddingModel[] {
    return Object.entries(this.defaultConfig.text_embedding_models).map(([key, value]) => {
      const model = value as TextEmbeddingModel;
      return {
        configName: key,
        server_type: model.server_type,
        id: model.id,
        vector_db: model.vector_db
      };
    });
  }

  getSeq2SeqModels(): Promise<Seq2SeqModel[]> {
    return new Promise((resolve) => {
      if (this.defaultConfig) {
        resolve(this.transformSeq2SeqModels());
      } else {
        this.resolveSeq2SeqModelsFn = resolve;
      }
    });
  }

  // Set value and resolve promise
  setDefaultConfig(value: string) {
    this.defaultConfig = JSON.parse(value);

    if (this.resolveSeq2SeqModelsFn) {
      this.resolveSeq2SeqModelsFn(this.transformSeq2SeqModels());
      this.resolveSeq2SeqModelsFn = null; // Prevent multiple calls
    }

    if (this.resolveTextEmbeddingModelsFn) {
      this.resolveTextEmbeddingModelsFn(this.transformTextEmbeddingModels());
      this.resolveTextEmbeddingModelsFn = null; // Prevent multiple calls
    }
  }

  getTextEmbeddingModels(): Promise<TextEmbeddingModel[]> {
    return new Promise((resolve) => {
      if (this.defaultConfig) {
        resolve(this.transformTextEmbeddingModels());
      } else {
        this.resolveTextEmbeddingModelsFn = resolve;
      }
    });
  }

}
