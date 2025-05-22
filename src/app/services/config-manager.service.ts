import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {
  Activate_CONFIG_ENDPOINT,
  AVAILABLE_CONFIG_ENDPOINT,
  CREATE_CONFIG_ENDPOINT,
  ACTIVE_CONFIG_ENDPOINT,
  GRAPH_SCHEMA_ENDPOINT,
  KG_DESCRIPTION_CONFIG_ENDPOINT,
  KG_EMBEDDINGS_CONFIG_ENDPOINT
} from './predefined-variables';
import { Seq2SeqModel } from '../models/seq2seqmodel';
import { TextEmbeddingModel } from '../models/text-embedding-model';
import { Observable, of, throwError } from 'rxjs';
import { GraphSchema } from '../models/graph-schema';
import { KGConfiguration } from '../models/kg-configuration';


@Injectable({
  providedIn: 'root'
})
export class ConfigManagerService {

  private currentConfig: any

  private scenariosSchema: GraphSchema[] = [];

  resolveSeq2SeqModelsFn: ((value: any) => void) | null = null;
  resolveTextEmbeddingModelsFn: ((value: any) => void) | null = null;
  resolveAvailableScenariosFn: ((value: any) => void) | null = null;

  constructor(private http: HttpClient) {
    // this.initConfiguration();
  }

  // initConfiguration(): void {
  //   this.http.get(DEFAULT_CONFIG_ENDPOINT).subscribe((data: any) => {
  //     this.setDefaultConfig(data);
  //   });
  // }

  getActiveConfiguration(): Observable<KGConfiguration> {
    return this.http.get<KGConfiguration>(ACTIVE_CONFIG_ENDPOINT)
  }

  // getDefaultConfig(): Promise<KGConfiguration> {
  //   return new Promise((resolve) => {
  //     if (this.currentConfig) {
  //       resolve(this.currentConfig);
  //     } else {
  //       this.http.get(DEFAULT_CONFIG_ENDPOINT).subscribe((data: any) => {
  //         this.setDefaultConfig(data);
  //         resolve(this.currentConfig);
  //       });
  //     }
  //   });
  // }

  setDefaultConfig(value: string) {
    this.currentConfig = value;

    if (this.resolveSeq2SeqModelsFn) {
      this.resolveSeq2SeqModelsFn(this.transformSeq2SeqModels());
      this.resolveSeq2SeqModelsFn = null; // Prevent multiple calls
    }

    if (this.resolveTextEmbeddingModelsFn) {
      this.resolveTextEmbeddingModelsFn(this.transformTextEmbeddingModels());
      this.resolveTextEmbeddingModelsFn = null; // Prevent multiple calls
    }

    if (this.resolveAvailableScenariosFn) {
      this.resolveAvailableScenariosFn(this.getScenariosSchema());
      // this.resolveAvailableScenariosFn = null; // Prevent multiple calls
    }
  }

  getPrefixes() {
    return this.currentConfig.prefixes;
  }

  transformSeq2SeqModels(): Seq2SeqModel[] {
    return Object.entries(this.currentConfig.seq2seq_models).map(([key, value]) => {
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
    return Object.entries(this.currentConfig.text_embedding_models).map(([key, value]) => {
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
      if (this.currentConfig) {
        resolve(this.transformSeq2SeqModels());
      } else {
        this.resolveSeq2SeqModelsFn = resolve;
      }
    });
  }

  getTextEmbeddingModels(): Promise<TextEmbeddingModel[]> {
    return new Promise((resolve) => {
      if (this.currentConfig) {
        resolve(this.transformTextEmbeddingModels());
      } else {
        this.resolveTextEmbeddingModelsFn = resolve;
      }
    });
  }

  getScenariosSchema(): Promise<GraphSchema[]> {
    return new Promise((resolve) => {
      if (this.scenariosSchema.length > 0) {
        resolve(this.scenariosSchema);
      }
      else {
        this.http.get<GraphSchema[]>(GRAPH_SCHEMA_ENDPOINT).subscribe((data: any) => {
          this.scenariosSchema = data;
          resolve(this.scenariosSchema);
        });
      }
    });
  }

  getScenarioSchema(scenario_id: string): Promise<GraphSchema> {
    return new Promise((resolve) => {
      if (this.scenariosSchema.length > 0) {
        resolve(this.scenariosSchema.filter((schema) => schema.scenario_id === scenario_id)[0]);
      }
      else {
        this.http.get<GraphSchema[]>(GRAPH_SCHEMA_ENDPOINT).subscribe((data: any) => {
          this.scenariosSchema = data;
          resolve(this.scenariosSchema.filter((schema) => schema.scenario_id === scenario_id)[0]);
        });
      }
    });
  }


  createNewConfiguration(newConfig: KGConfiguration): Observable<any> {

    return this.http.post(CREATE_CONFIG_ENDPOINT, newConfig)

  }

  activateConfiguration(kg_short_name: string): Observable<any> {

    if (this.currentConfig.kg_short_name === kg_short_name) {
      return throwError(() => new HttpErrorResponse({
        error: "Configuration already active",
        status: 400,
        statusText: "Duplicate configuration"
      }))
    }

    const config = {
      "kg_short_name": kg_short_name
    };

    return this.http.post(Activate_CONFIG_ENDPOINT, config)

  }



  generateKGDescriptions(kg_short_name: string): Observable<any> {
    const config = {
      "kg_short_name": kg_short_name
    };

    return this.http.post(KG_DESCRIPTION_CONFIG_ENDPOINT, config)

  }

  generateKGEmbeddings(kg_short_name: string): Observable<any> {
    const config = {
      "kg_short_name": kg_short_name
    };

    return this.http.post(KG_EMBEDDINGS_CONFIG_ENDPOINT, config)

  }

  getAvailableConfigurations(): Observable<string[]> {
    return this.http.get(AVAILABLE_CONFIG_ENDPOINT) as Observable<string[]>;
  }

}
