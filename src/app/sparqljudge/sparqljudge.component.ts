import { Component, inject, signal } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { SPARQLQNExtractorService } from './../services/sparqlqnextractor.service';
import { ExtractedData, SPARQLPartInfo } from './../models/extraction';
import { JsonPipe } from '@angular/common';
import { AdditionalSPARQLInfoService } from '../services/additional-sparqlinfo.service';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipEditedEvent, MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-sparqljudge',
  imports: [
    FormsModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, MatButtonModule, JsonPipe, MatTableModule,
    MatFormFieldModule, MatChipsModule, MatIconModule, MatSlideToggleModule
  ],
  templateUrl: './sparqljudge.component.html',
  styleUrl: './sparqljudge.component.scss'
})
export class SPARQLJudgeComponent {

  displayedColumns: string[] = ['uri', 'info'];
  dataSource: SPARQLPartInfo[] = [];

  loading: boolean = false;
  error: string = '';

  constructor(private sparqlExtractorQNService: SPARQLQNExtractorService,
    private additionalSPARQLInfoService: AdditionalSPARQLInfoService) { }

  model = {
    endpoint: 'http://localhost:8080/sparql',
    query: `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX sio: <http://semanticscience.org/resource/>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX compound: <http://rdf.ncbi.nlm.nih.gov/pubchem/compound/>
PREFIX chebi: <http://purl.obolibrary.org/obo/CHEBI_>

SELECT ?disease ?score ?disease_prefLabel
FROM <http://rdf.ncbi.nlm.nih.gov/pubchem/cooccurrence>
FROM <http://rdf.ncbi.nlm.nih.gov/pubchem/disease>
WHERE {
    ?cooccurrence rdf:subject ?compound .
    ?compound a chebi:67079 .
    ?cooccurrence rdf:object ?disease .
    ?cooccurrence rdf:type sio:SIO_000993 .
    ?cooccurrence sio:SIO_000300 ?score .
    ?disease skos:prefLabel ?disease_prefLabel .
}
ORDER BY DESC(?score)
LIMIT 5`,
  }

  knownPrefixeds = `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX sio: <http://semanticscience.org/resource/>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX compound: <http://rdf.ncbi.nlm.nih.gov/pubchem/compound/>
PREFIX chebi: <http://purl.obolibrary.org/obo/CHEBI_>
PREFIX schema: <http://schema.org/>
PREFIX enpkg_module: <https://enpkg.commons-lab.org/module/>
PREFIX pav: <http://purl.org/pav/>
PREFIX example: <http://example.org/>
PREFIX enpkg: <https://enpkg.commons-lab.org/kg/>
PREFIX obo: <http://purl.obolibrary.org/obo/>
PREFIX cito: <http://purl.org/spar/cito/>
PREFIX pubchem: <http://rdf.ncbi.nlm.nih.gov/pubchem/vocabulary#>
PREFIX sio: <http://semanticscience.org/resource/>
PREFIX bao: <http://www.bioassayontology.org/bao#>
PREFIX chebi: <http://purl.obolibrary.org/obo/CHEBI_>
PREFIX cheminf: <http://semanticscience.org/resource/CHEMINF_>
PREFIX chembl: <http://rdf.ebi.ac.uk/terms/chembl#>`;

  endpoint = new FormControl(this.model.endpoint,
    [
      Validators.required,
      Validators.pattern(/^(https?):\/\/[^\s/$.?#].[^\s]*$/i)
    ]);
  query = new FormControl(this.model.query);

  parsedData: ExtractedData | undefined;

  displayAllInfo = new FormControl(false);

  getQandFQNames() {
    if (this.query.value) {
      try {

        this.parsedData = this.sparqlExtractorQNService.parseQuery(this.query.value);
        this.dataSource = [];
        for (let qname of this.parsedData.qnames) {
          this.dataSource.push({ uri: qname });
        }
        this.error = "";
      } catch (error) {
        this.error = `${error}`;
      }
    }
  }

  addKnownPrefixes() {
    this.query.setValue(this.knownPrefixeds + "\n" + this.query.value);
  }

  getQandFQNamesInfo() {
    if (this.endpoint.value) {
      this.loading = true;
      for (let item of this.dataSource) {
        const ppts = this.properties()
        this.additionalSPARQLInfoService.getPropertyDetails(item.uri, this.endpoint.value, ppts).subscribe(
          (response) => {
            this.loading = false;
            if (response.results.bindings.length > 0) {
              item.info = [];
              const result = response.results.bindings[0];
              if (this.displayAllInfo.value) {
                for (let index = 0; index < ppts.length; index++) {
                  let line = [`${ppts[index]}`, (result[`p${index}`] ? result[`p${index}`]["value"] : 'No data found')];
                  item.info.push(line);
                }
              } else {
                for (let index = 0; index < ppts.length; index++) {
                  if (result[`p${index}`]) {
                    let line = [`${ppts[index]}`, result[`p${index}`]["value"]];
                    item.info.push(line);
                  }
                }
              }

            } else {
              this.error = 'No data found For :' + item.uri;
            }
          },
          (error) => {
            this.loading = false;
            this.error = 'Error fetching data from SPARQL endpoint';
          }
        );
      }
    }
  }

  reset() {
    this.dataSource = [];
    this.query.setValue(this.model.query);
    this.endpoint.setValue(this.model.endpoint);
    this.loading = false;
    this.error = '';
    this.properties.set([...this.defaultProperties]);
  }

  readonly addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  readonly defaultProperties: string[] = ['rdfs:label', 'rdfs:comment', 'dcterms:description', 'obo:IAO_0000115'];
  readonly announcer = inject(LiveAnnouncer);
  properties = signal<string[]>([...this.defaultProperties]);

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    // Add our fruit
    if (value) {
      this.properties.update(properties => [...properties, value]);
    }

    // Clear the input value
    event.chipInput!.clear();
  }

  remove(property: string): void {
    this.properties.update(properties => {
      const index = properties.indexOf(property);
      if (index < 0) {
        return properties;
      }

      properties.splice(index, 1);
      this.announcer.announce(`Removed ${property}`);
      return [...properties];
    });
  }

  edit(property: string, event: MatChipEditedEvent) {
    const value = event.value.trim();

    // Remove fruit if it no longer has a name
    if (!value) {
      this.remove(property);
      return;
    }

    // Edit existing fruit
    this.properties.update(properties => {
      const index = properties.indexOf(property);
      if (index >= 0) {
        properties[index] = value;
        return [...properties];
      }
      return properties;
    });
  }
}
