import { JsonPipe, KeyValuePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatStepperModule } from '@angular/material/stepper';
import { MatChipEditedEvent, MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { KGConfiguration } from '../models/kg-configuration';
import { ConfigManagerService } from '../services/config-manager.service';
import { DialogService } from '../services/dialog.service';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-kgconfiguration',
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatStepperModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatIconModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    JsonPipe,
    KeyValuePipe
  ],
  templateUrl: './kgconfiguration.component.html',
  styleUrl: './kgconfiguration.component.scss'
})
export class KGConfigurationComponent {

  private _formBuilder = inject(FormBuilder);
  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  availableClassoCntextFormats = ["turtle", "tuple"]

  configuration_idsm = signal<KGConfiguration>({
    kg_full_name: "PubChem knowledge graph",
    kg_short_name: "idsm",
    kg_description: "The IDSM SPARQL endpoint provides fast similarity and structural search functionality in knowledge graph such as ChEMBL, ChEBI or PubChem.",
    kg_sparql_endpoint_url: "https://idsm.elixir-czech.cz/sparql/endpoint/idsm",
    ontologies_sparql_endpoint_url: "http://gen2kgbot.i3s.unice.fr/corese",
    properties_qnames_info: [
      "rdfs:label",
      "skos:prefLabel",
      "skos:altLabel",
      "schema:name",
      "schema:alternateName",
      "obo:IAO_0000118",
      "obo:OBI_9991118",
      "obo:OBI_0001847",
      "rdfs:comment",
      "skos:definition",
      "dc:description",
      "dcterms:description",
      "schema:description",
      "obo:IAO_0000115"
    ],
    prefixes: {
      bao: "http://www.bioassayontology.org/bao#",
      biopax: "http://www.biopax.org/release/biopax-level3.owl#",
      cito: "http://purl.org/spar/cito/",
      chembl: "http://rdf.ebi.ac.uk/terms/chembl#",
      dc: "http://purl.org/dc/elements/1.1/",
      dcterms: "http://purl.org/dc/terms/",
      enpkg: "https://enpkg.commons-lab.org/kg/",
      enpkg_module: "https://enpkg.commons-lab.org/module/",
      fabio: "http://purl.org/spar/fabio/",
      foaf: "http://xmlns.com/foaf/0.1/",
      frbr: "http://purl.org/vocab/frbr/core#",
      ndfrt: "http://purl.bioontology.org/ontology/NDFRT/",
      obo: "http://purl.obolibrary.org/obo/",
      owl: "http://www.w3.org/2002/07/owl#",
      patent: "http://data.epo.org/linked-data/def/patent/",
      pav: "http://purl.org/pav/",
      pubchem: "http://rdf.ncbi.nlm.nih.gov/pubchem/vocabulary#",
      rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
      rdfs: "http://www.w3.org/2000/01/rdf-schema#",
      schema: "http://schema.org/",
      skos: "http://www.w3.org/2004/02/skos/core#",
      sio: "http://semanticscience.org/resource/",
      snomedct: "http://purl.bioontology.org/ontology/SNOMEDCT/",
      xsd: "http://www.w3.org/2001/XMLSchema#",
      up: "http://purl.uniprot.org/core/"
    },
    ontology_named_graphs: [],
    max_similar_classes: 10,
    expand_similar_classes: false,
    class_context_format: "turtle",
    excluded_classes_namespaces: [
      "http://data.epo.org/linked-data/def/patent/Publication",
      "http://ncicb.nci.nih.gov/xml/owl/EVS/Thesaurus.owl#"
    ],
    data_directory: "./data",
    class_embeddings_subdir: "classes_with_instance_nomic",
    property_embeddings_subdir: "properties_nomic",
    queries_embeddings_subdir: "sparql_queries_nomic",
    temp_directory: "./tmp",
  })

  configuration = signal<KGConfiguration>({
    kg_full_name: "WheatGenomic Scienctific Literature Knowledge Graph",
    kg_short_name: "d2kab",
    kg_description: "The Wheat Genomics Scientific Literature Knowledge Graph (WheatGenomicsSLKG) is a FAIR knowledge graph that exploits the Semantic Web technologies to describe PubMed scientific articles on wheat genetics and genomics. It represents Named Entities (NE) about genes, phenotypes, taxa and varieties, mentioned in the title and the abstract of the articles, and the relationships between wheat mentions of varieties and phenotypes.",
    kg_sparql_endpoint_url: "http://d2kab.i3s.unice.fr/sparql",
    ontologies_sparql_endpoint_url: "http://d2kab.i3s.unice.fr/sparql",
    properties_qnames_info: [],
    prefixes: {
      "bibo": "http://purl.org/ontology/bibo/",
      "d2kab": "http://ns.inria.fr/d2kab/",
      "dc": "http://purl.org/dc/elements/1.1/",
      "dcterms": "http://purl.org/dc/terms/",
      "fabio": "http://purl.org/spar/fabio/",
      "foaf": "http://xmlns.com/foaf/0.1/",
      "frbr": "http://purl.org/vocab/frbr/core#",
      "obo": "http://purl.obolibrary.org/obo/",
      "oio": "http://www.geneontology.org/formats/oboInOwl#",
      "oa": "http://www.w3.org/ns/oa#",
      "owl": "http://www.w3.org/2002/07/owl#",
      "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
      "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
      "schema": "http://schema.org/",
      "skos": "http://www.w3.org/2004/02/skos/core#",
      "xsd": "http://www.w3.org/2001/XMLSchema#",
      "wto": "http://opendata.inrae.fr/wto/"
    },
    ontology_named_graphs: [
      "http://ns.inria.fr/d2kab/graph/wheatgenomicsslkg",
      "http://ns.inria.fr/d2kab/ontology/wto/v3",
      "http://purl.org/dc/elements/1.1/",
      "http://purl.org/dc/terms/",
      "http://purl.org/obo/owl/",
      "http://purl.org/ontology/bibo/",
      "http://purl.org/spar/fabio",
      "http://purl.org/vocab/frbr/core#",
      "http://www.w3.org/2002/07/owl#",
      "http://www.w3.org/2004/02/skos/core",
      "http://www.w3.org/ns/oa#"
    ],
    max_similar_classes: 10,
    expand_similar_classes: true,
    class_context_format: "turtle",
    excluded_classes_namespaces: [],
    data_directory: "./data",
    class_embeddings_subdir: "classes_with_instance_nomic",
    property_embeddings_subdir: "properties_nomic",
    queries_embeddings_subdir: "sparql_queries_nomic",
    temp_directory: "./tmp"
  })

  firstFormGroup: FormGroup;

  secondFormGroup: FormGroup;
  
  thirdFormGroup: FormGroup;
  
  constructor(private configManagerService: ConfigManagerService,
    private dialogService: DialogService) {

    this.firstFormGroup = this._formBuilder.group({
      kg_full_name: [this.configuration().kg_full_name, Validators.required],
      kg_short_name: [this.configuration().kg_short_name, Validators.required],
      kg_description: [this.configuration().kg_description, Validators.required],
      kg_sparql_endpoint_url: [this.configuration().kg_sparql_endpoint_url, Validators.required],
      ontologies_sparql_endpoint_url: [this.configuration().ontologies_sparql_endpoint_url, []],
      properties_qnames_info: [this.configuration().properties_qnames_info, []],
      // prefixes: this._formBuilder.group({}),
      ontology_named_graphs: [this.configuration().ontology_named_graphs],
      max_similar_classes: [this.configuration().max_similar_classes, Validators.required],
      expand_similar_classes: [this.configuration().expand_similar_classes, Validators.required],
      class_context_format: [this.configuration().class_context_format, Validators.required],
      excluded_classes_namespaces: [this.configuration().excluded_classes_namespaces, []],
      data_directory: [this.configuration().data_directory, Validators.required],
      class_embeddings_subdir: [this.configuration().class_embeddings_subdir, Validators.required],
      property_embeddings_subdir: [this.configuration().property_embeddings_subdir, Validators.required],
      queries_embeddings_subdir: [this.configuration().queries_embeddings_subdir, Validators.required],
      temp_directory: [this.configuration().temp_directory, Validators.required],
    });

    // Dynamically create form controls inside the prefixes FormGroup
    // const prefixGroup = this.firstFormGroup.get('prefixes') as FormGroup;
    // Object.keys(this.configuration().prefixes).forEach((key) => {
    //   prefixGroup.addControl(key, this._formBuilder.control(this.configuration().prefixes[key]));
    // });

    this.secondFormGroup = this._formBuilder.group({
      kg_short_name: [this.configuration().kg_short_name, Validators.required],
    });

    this.secondFormGroup.get('kg_short_name')?.disable();

    this.thirdFormGroup = this._formBuilder.group({
      kg_short_name: [this.configuration().kg_short_name, Validators.required],
    });

    this.thirdFormGroup.get('kg_short_name')?.disable();

  }

  isEditable = false;

  isConfigCreated = false;

  isConfigActivated = false;

  isKGDescriptionsGenerated = false;

  isKGEmbeddingGenerated = false;

  isInConfigCreatedTask = false;
  isInConfigActivatedTask = false;
  isInKGDescriptionsGeneratedTask = false;
  isInKGEmbeddingGeneratedTask = false;


  addPropertyQName(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    if (value) {
      this.configuration().properties_qnames_info.push(value);
    }

    // Clear the input value
    event.chipInput!.clear();
  }

  removePropertyQName(property: string): void {
    const index = this.configuration().properties_qnames_info.indexOf(property);
    if (index < 0) {
      return;
    }

    this.configuration().properties_qnames_info.splice(index, 1);
  }

  editPropertyQName(property: string, event: MatChipEditedEvent) {
    const value = event.value.trim();

    // Remove property if it no longer has a name
    if (!value) {
      this.removePropertyQName(property);
      return;
    }

    const index = this.configuration().properties_qnames_info.indexOf(property);

    if (index >= 0) {
      this.configuration().properties_qnames_info[index] = value;
      return;
    }
    return this.configuration()
  }

  addExcludedClassesNamespaces(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    if (value) {
      this.configuration().excluded_classes_namespaces.push(value);
    }

    // Clear the input value
    event.chipInput!.clear();
  }

  removeExcludedClassesNamespaces(property: string): void {
    const index = this.configuration().excluded_classes_namespaces.indexOf(property);
    if (index < 0) {
      return;
    }

    this.configuration().excluded_classes_namespaces.splice(index, 1);
  }

  editExcludedClassesNamespaces(property: string, event: MatChipEditedEvent) {
    const value = event.value.trim();

    // Remove property if it no longer has a name
    if (!value) {
      this.removeExcludedClassesNamespaces(property);
      return;
    }

    const index = this.configuration().excluded_classes_namespaces.indexOf(property);

    if (index >= 0) {
      this.configuration().excluded_classes_namespaces[index] = value;
      return;
    }
    return this.configuration()
  }

  addOntologyNamedGraphs(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    if (value) {
      this.configuration().ontology_named_graphs.push(value);
    }

    // Clear the input value
    event.chipInput!.clear();
  }

  removeOntologyNamedGraphs(property: string): void {
    const index = this.configuration().ontology_named_graphs.indexOf(property);
    if (index < 0) {
      return;
    }

    this.configuration().ontology_named_graphs.splice(index, 1);
  }

  editOntologyNamedGraphs(property: string, event: MatChipEditedEvent) {
    const value = event.value.trim();

    // Remove property if it no longer has a name
    if (!value) {
      this.removeOntologyNamedGraphs(property);
      return;
    }

    const index = this.configuration().ontology_named_graphs.indexOf(property);

    if (index >= 0) {
      this.configuration().ontology_named_graphs[index] = value;
      return;
    }
    return this.configuration()
  }

  removePrefix(index: number) {
    delete this.configuration().prefixes[index];
  }

  getPrefix(key: string): string | undefined {
    return this.configuration().prefixes[key];
  }

  getAllPrefixes(): { [key: string]: string } {
    return this.configuration().prefixes;
  }

  deletePrefix(key: string): boolean {
    if (this.configuration().prefixes[key]) {
      delete this.configuration().prefixes[key];
      return true; // Successfully deleted
    }
    return false; // Key not found
  }

  addPrefix() {
    this.configuration().prefixes["z===     ===z"] = "";
  }

  createConfiguration() {
    this.isInConfigCreatedTask = true;
    this.configManagerService.createNewConfiguration(this.firstFormGroup.value)
      .subscribe({
        next: value => {
          this.isInConfigCreatedTask = false;
          this.isConfigCreated = true;
          this.dialogService.notifyUser("Configuration created successfully!",
            "Server response: \n ```json\n" + JSON.stringify(value, null, 2) + "\n```"
          );
          this.configuration.set(value);
          this.secondFormGroup.get('kg_short_name')?.setValue(this.configuration().kg_short_name);

        },
        error: error => {
          this.isInConfigCreatedTask = false;
          this.isConfigCreated = false;
          this.dialogService.notifyUser("Configuration creation error",
            "Server response: \n ```json\n" + JSON.stringify(error, null, 2) + "\n```"
          )
        }
        ,
      });
  }

  generateKGDescriptions() {
    this.isInKGDescriptionsGeneratedTask = true;

    this.configManagerService.generateKGDescriptions(this.secondFormGroup.value.kg_short_name)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          this.isInKGDescriptionsGeneratedTask = false;
          this.isKGDescriptionsGenerated = false;
          this.dialogService.notifyUser("KG description generation error",
            "Server response: \n ```json\n" + JSON.stringify(error, null, 2) + "\n```"
          );
          throw error; // Rethrow the error to propagate it further
        })
      )
      .subscribe({
        next: value => {
          this.isInKGDescriptionsGeneratedTask = false;
          this.isKGDescriptionsGenerated = true;
          this.dialogService.notifyUser("KG description generation successful!",
            "Server response: \n ```json\n" + JSON.stringify(value, null, 2) + "\n```"
          );
        }
      });

  }

  activateConfiguration() {
    this.isInConfigActivatedTask = true;
    this.configManagerService.activateConfiguration(this.secondFormGroup.value.kg_short_name)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          this.isInConfigActivatedTask = false;
          this.isConfigActivated = false;
          this.dialogService.notifyUser("Configuration activation error",
            "Server response: \n ```json\n" + JSON.stringify(error, null, 2) + "\n```"
          );
          throw error; // Rethrow the error to propagate it further
        })
      )
      .subscribe({
        next: value => {
          this.isConfigActivated = true;
          this.isInConfigActivatedTask = false;
          this.dialogService.notifyUser("Configuration activated successfully!",
            "Server response: \n ```json\n" + JSON.stringify(value, null, 2) + "\n```"
          );
        }
      });
  }

  generateKGEmbeddings() {
    this.isInKGEmbeddingGeneratedTask = true;
    this.configManagerService.generateKGEmbeddings(this.thirdFormGroup.value.kg_short_name)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          this.isKGEmbeddingGenerated = false;
          this.isInKGEmbeddingGeneratedTask = false;
          this.dialogService.notifyUser("KG embeddings generated an error",
            "Server response: \n ```json\n" + JSON.stringify(error, null, 2) + "\n```"
          );
          throw error; // Rethrow the error to propagate it further
        })
      )
      .subscribe({
        next: value => {
          this.isKGEmbeddingGenerated = true;
          this.isInKGEmbeddingGeneratedTask = false;
          this.dialogService.notifyUser("KG embeddings generattion was successful!",
            "Server response: \n ```json\n" + JSON.stringify(value, null, 2) + "\n```"
          );
        }
      });

  }
}
