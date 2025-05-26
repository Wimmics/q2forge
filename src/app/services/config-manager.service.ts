import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {
  AVAILABLE_CONFIG_ENDPOINT,
  CREATE_CONFIG_ENDPOINT,
  ACTIVE_CONFIG_ENDPOINT,
  GRAPH_SCHEMA_ENDPOINT,
  KG_DESCRIPTION_CONFIG_ENDPOINT,
  KG_EMBEDDINGS_CONFIG_ENDPOINT,
  ACTIVATE_CONFIG_ENDPOINT
} from './predefined-variables';
import { Seq2SeqModel } from '../models/seq2seqmodel';
import { TextEmbeddingModel } from '../models/text-embedding-model';
import { BehaviorSubject, Observable, Subject, throwError } from 'rxjs';
import { GraphSchema } from '../models/graph-schema';
import { KGConfiguration } from '../models/kg-configuration';
import { DialogService } from './dialog.service';


@Injectable({
  providedIn: 'root'
})
export class ConfigManagerService {

  private currentActiveConfigurationSub: Subject<KGConfiguration> = new Subject<KGConfiguration>();
  private currentActiveConfiguration?: KGConfiguration;

  private availableConfigurationsSub: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  private availableConfigurations?: string[];

  private scenariosSchema: GraphSchema[] = [];

  constructor(private http: HttpClient, private dialogService: DialogService) {
  }

  getCurrentActiveConfigurationSub(): Observable<KGConfiguration> {
    return this.currentActiveConfigurationSub.asObservable();
  }

  getActiveConfiguration(): void {

    if (this.currentActiveConfiguration) {
      this.currentActiveConfigurationSub.next(this.currentActiveConfiguration);
      return;
    }

    this.http.get<KGConfiguration>(ACTIVE_CONFIG_ENDPOINT).subscribe({
      next: (config: KGConfiguration) => {
        this.currentActiveConfiguration = config;
        this.currentActiveConfigurationSub.next(config);
      },
      error: (error: any) => {
        if (error.error.detail === "No active configuration found") {
          this.dialogService.notifyUser("No active configuration", "No active configuration found. Please activate a configuration to prefill the fields.");
        } else {
          this.dialogService.notifyUser("Error", "Error while fetching the active configuration: " + error.error.detail);
        }
        this.currentActiveConfigurationSub.error(error);
      },
    });
  }

  getPrefixes() {
    if (!this.currentActiveConfiguration) {
      return [];
    }
    return this.currentActiveConfiguration.prefixes;
  }

  transformSeq2SeqModels(models: { [key: string]: Seq2SeqModel }): Seq2SeqModel[] {
    return Object.entries(models).map(([key, value]) => {
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

  transformTextEmbeddingModels(models: { [key: string]: TextEmbeddingModel }): TextEmbeddingModel[] {
    return Object.entries(models).map(([key, value]) => {
      const model = value as TextEmbeddingModel;
      return {
        configName: key,
        server_type: model.server_type,
        id: model.id,
        vector_db: model.vector_db
      };
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

  activateConfiguration(kg_short_name: string): Observable<KGConfiguration> {

    if (this.currentActiveConfiguration?.kg_short_name === kg_short_name) {
      return throwError(() => new HttpErrorResponse({
        error: "Configuration already active",
        status: 400,
        statusText: "Duplicate configuration"
      }))
    }

    const config = {
      "kg_short_name": kg_short_name
    };


    let postObservable = this.http.post<KGConfiguration>(ACTIVATE_CONFIG_ENDPOINT, config)

    postObservable.subscribe({
      next: (config: KGConfiguration) => {
        this.currentActiveConfiguration = config;
        this.currentActiveConfigurationSub.next(config);
      },
    });

    return postObservable;

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

  getAvailableConfigurations(): BehaviorSubject<string[]> {
    if (this.availableConfigurations) {
      return this.availableConfigurationsSub;
    }

    this.http.get<string[]>(AVAILABLE_CONFIG_ENDPOINT).subscribe({
      next: (configs: string[]) => {
        this.availableConfigurations = configs;
        this.availableConfigurationsSub.next(configs);
      },
      error: (error: any) => {
        this.availableConfigurationsSub.error(error);
      }
    });

    return this.availableConfigurationsSub;
  }

}
