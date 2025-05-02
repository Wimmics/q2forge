import { AsyncPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { KGConfiguration, QueryExample } from '../models/kg-configuration';
import { ConfigManagerService } from '../services/config-manager.service';
import { DialogService } from '../services/dialog.service';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, filter, map, Observable } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MarkdownModule } from 'ngx-markdown';
import { KnownPrefixesService } from '../services/known-prefixes.service';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Prefix } from '../models/prefix';
import { RouterModule } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';

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
    MarkdownModule,
    MatAutocompleteModule,
    MatTooltipModule,
    AsyncPipe,
    RouterModule,
  ],
  templateUrl: './kgconfiguration.component.html',
  styleUrl: './kgconfiguration.component.scss'
})
export class KGConfigurationComponent {

  private _formBuilder = inject(FormBuilder);
  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  readonly httpPatternValidator = Validators.pattern(/^(https?):\/\/[^\s/$.?#].[^\s]*$/i)


  availableClassoCntextFormats = ["turtle", "tuple", "nl"]

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
    excluded_classes_namespaces: [
      "http://data.epo.org/linked-data/def/patent/Publication",
      "http://ncicb.nci.nih.gov/xml/owl/EVS/Thesaurus.owl#"
    ],
    queryExamples: []
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
    excluded_classes_namespaces: [],
    queryExamples: [
      {
        question: "Retrieve genes that are mentioned proximal to the a given phenotype (resistance to leaf rust in this example).",
        query: 'prefix rdf:     <http://www.w3.org/1999/02/22-rdf-syntax-ns#> \nprefix rdfs:    <http://www.w3.org/2000/01/rdf-schema#> \nprefix xsd:     <http://www.w3.org/2001/XMLSchema#> \nprefix schema:  <http://schema.org/> \nprefix owl:     <http://www.w3.org/2002/07/owl#> \nprefix skos:    <http://www.w3.org/2004/02/skos/core#> \nprefix oa:      <http://www.w3.org/ns/oa#> \nprefix ncbi:    <http://identifiers.org/taxonomy/> \nprefix dct:     <http://purl.org/dc/terms/> \nprefix frbr:    <http://purl.org/vocab/frbr/core#> \nprefix fabio:   <http://purl.org/spar/fabio/> \nprefix obo:     <http://purl.obolibrary.org/obo/> \nprefix bibo:    <http://purl.org/ontology/bibo/> \nprefix d2kab:   <http://ns.inria.fr/d2kab/> \nprefix dc:      <http://purl.org/dc/terms/> \nprefix d2kab_bsv:   <http://ontology.inrae.fr/bsv/ontology/>\nprefix dul: <http://www.ontologydesignpatterns.org/ont/dul/DUL.owl#>\nprefix dct:     <http://purl.org/dc/terms/> \nprefix taxref: <http://taxref.mnhn.fr/lod/property/>\n\nSELECT ?GeneName (count(distinct ?paper) as ?NbOcc)\nFROM NAMED <http://ns.inria.fr/d2kab/graph/wheatgenomicsslkg>\nFROM NAMED <http://ns.inria.fr/d2kab/ontology/wto/v3>\nWHERE {\n  GRAPH <http://ns.inria.fr/d2kab/graph/wheatgenomicsslkg> { \n     ?a1 a oa:Annotation; \n      oa:hasTarget [ oa:hasSource ?source1 ] ;  \n      oa:hasBody ?WTOtraitURI .\n\n   ?source1 frbr:partOf+ ?paper .\n    \n   ?a a oa:Annotation ; \n      oa:hasTarget [ oa:hasSource ?source ] ;\n      oa:hasBody [ a d2kab:Gene; skos:prefLabel ?GeneName ].\n\n   ?source frbr:partOf+ ?paper.\n\n   ?paper a fabio:ResearchPaper.\n}\n   GRAPH <http://ns.inria.fr/d2kab/ontology/wto/v3> {\n       ?WTOtraitURI skos:prefLabel "resistance to Leaf rust" .\n}\n}\nGROUP BY ?GeneName \nHAVING (count(distinct ?paper) > 1)\nORDER BY DESC(?NbOcc)'
      },
      {
        question: "Retrieve publications in which genes are mentioned proximal to wheat varieties and traits from a specific class, e.g., all wheat traits related to resistance to fungal pathogens.",
        query: 'prefix rdf:     <http://www.w3.org/1999/02/22-rdf-syntax-ns#> \nprefix rdfs:    <http://www.w3.org/2000/01/rdf-schema#> \nprefix xsd:     <http://www.w3.org/2001/XMLSchema#> \nprefix schema:  <http://schema.org/> \nprefix owl:     <http://www.w3.org/2002/07/owl#> \nprefix skos:    <http://www.w3.org/2004/02/skos/core#> \nprefix oa:      <http://www.w3.org/ns/oa#> \nprefix ncbi:    <http://identifiers.org/taxonomy/> \nprefix dct:     <http://purl.org/dc/terms/> \nprefix frbr:    <http://purl.org/vocab/frbr/core#> \nprefix fabio:   <http://purl.org/spar/fabio/> \nprefix obo:     <http://purl.obolibrary.org/obo/> \nprefix bibo:    <http://purl.org/ontology/bibo/> \nprefix d2kab:   <http://ns.inria.fr/d2kab/> \nprefix dc:      <http://purl.org/dc/terms/> \nprefix d2kab_bsv:   <http://ontology.inrae.fr/bsv/ontology/>\nprefix dul: <http://www.ontologydesignpatterns.org/ont/dul/DUL.owl#>\nprefix dct:     <http://purl.org/dc/terms/> \nprefix taxref: <http://taxref.mnhn.fr/lod/property/>\n\nSELECT *\nFROM NAMED <http://ns.inria.fr/d2kab/ontology/wto/v3>\nWHERE {\n  GRAPH <http://ns.inria.fr/d2kab/ontology/wto/v3> {\n    { ?body a ?class ; skos:prefLabel ?WTOtrait.\n      ?class rdfs:subClassOf* <http://opendata.inrae.fr/wto/0000340>.\n    }\n    UNION\n    { ?body rdfs:label ?WTOtrait ;\n        rdfs:subClassOf* <http://opendata.inrae.fr/wto/0000340>.\n    }\n    UNION\n    { ?body skos:prefLabel ?WTOtrait ; skos:broader* ?concept .\n      ?concept a ?class.\n      ?class rdfs:subClassOf* <http://opendata.inrae.fr/wto/0000340>.\n    }\n  }\n}'
      },
      {
        question: 'Retrieve genetic markers mentioned proximal to genes which are in turn mentioned proximal to a wheat phenotype ("resistance to Stripe rust" in this example) considering the same scientific publication.',
        query: 'prefix rdf:     <http://www.w3.org/1999/02/22-rdf-syntax-ns#> \nprefix rdfs:    <http://www.w3.org/2000/01/rdf-schema#> \nprefix xsd:     <http://www.w3.org/2001/XMLSchema#> \nprefix schema:  <http://schema.org/> \nprefix owl:     <http://www.w3.org/2002/07/owl#> \nprefix skos:    <http://www.w3.org/2004/02/skos/core#> \nprefix oa:      <http://www.w3.org/ns/oa#> \nprefix ncbi:    <http://identifiers.org/taxonomy/> \nprefix dct:     <http://purl.org/dc/terms/> \nprefix frbr:    <http://purl.org/vocab/frbr/core#> \nprefix fabio:   <http://purl.org/spar/fabio/> \nprefix obo:     <http://purl.obolibrary.org/obo/> \nprefix bibo:    <http://purl.org/ontology/bibo/> \nprefix d2kab:   <http://ns.inria.fr/d2kab/> \nprefix dc:      <http://purl.org/dc/terms/> \nprefix d2kab_bsv:   <http://ontology.inrae.fr/bsv/ontology/>\nprefix dul: <http://www.ontologydesignpatterns.org/ont/dul/DUL.owl#>\nprefix dct:     <http://purl.org/dc/terms/> \nprefix taxref: <http://taxref.mnhn.fr/lod/property/>\n\nSELECT (GROUP_CONCAT(distinct ?GeneName; SEPARATOR="-") as ?genes) \n(GROUP_CONCAT(distinct ?marker; SEPARATOR="-") as ?markers) \n?paper ?year ?WTOtrait\nFROM NAMED <http://ns.inria.fr/d2kab/graph/wheatgenomicsslkg>\nFROM NAMED <http://ns.inria.fr/d2kab/ontology/wto/v3>\nWHERE {\nVALUES ?WTOtrait { "resistance to Stripe rust" }\nGRAPH <http://ns.inria.fr/d2kab/graph/wheatgenomicsslkg> { \n?a1 a oa:Annotation ;\n    oa:hasTarget [ oa:hasSource ?source1 ];\n    oa:hasBody [ a d2kab:Gene ; skos:prefLabel ?GeneName].\n\n?source1 frbr:partOf+ ?paper .\n\n?a2 a oa:Annotation ;\n    oa:hasTarget [ oa:hasSource ?source2 ] ;\n    oa:hasBody [ a d2kab:Marker ; skos:prefLabel ?marker ]. \n\n?source2 frbr:partOf+ ?paper .\n\n?a3 a oa:Annotation; \n    oa:hasTarget [ oa:hasSource ?source3 ];\n    oa:hasBody ?WTOtraitURI.\n\n?source3 frbr:partOf+ ?paper . \n\n?paper a fabio:ResearchPaper; dct:title ?source3; dct:issued ?year .\nFILTER (?year >= "2010"^^xsd:gYear)\n}\nGRAPH <http://ns.inria.fr/d2kab/ontology/wto/v3> {\n       ?WTOtraitURI skos:prefLabel ?WTOtrait.\n}\n}\nGROUP BY ?paper ?year ?WTOtrait'
      },
      {
        question: 'Retrieves couples of scientific publications such as a first publication mentions a given phenotype and a gene and the second one mentions the same gene name with a genetic marker.',
        query: 'prefix rdf:     <http://www.w3.org/1999/02/22-rdf-syntax-ns#> \nprefix rdfs:    <http://www.w3.org/2000/01/rdf-schema#> \nprefix xsd:     <http://www.w3.org/2001/XMLSchema#> \nprefix schema:  <http://schema.org/> \nprefix owl:     <http://www.w3.org/2002/07/owl#> \nprefix skos:    <http://www.w3.org/2004/02/skos/core#> \nprefix oa:      <http://www.w3.org/ns/oa#> \nprefix ncbi:    <http://identifiers.org/taxonomy/> \nprefix dct:     <http://purl.org/dc/terms/> \nprefix frbr:    <http://purl.org/vocab/frbr/core#> \nprefix fabio:   <http://purl.org/spar/fabio/> \nprefix obo:     <http://purl.obolibrary.org/obo/> \nprefix bibo:    <http://purl.org/ontology/bibo/> \nprefix d2kab:   <http://ns.inria.fr/d2kab/> \nprefix dc:      <http://purl.org/dc/terms/> \nprefix d2kab_bsv:   <http://ontology.inrae.fr/bsv/ontology/>\nprefix dul: <http://www.ontologydesignpatterns.org/ont/dul/DUL.owl#>\nprefix dct:     <http://purl.org/dc/terms/> \nprefix taxref: <http://taxref.mnhn.fr/lod/property/>\n\nSELECT distinct ?paper1 ?WTOtrait ?Title1 ?geneName ?paper2 ?Title2 (GROUP_CONCAT(distinct ?marker; SEPARATOR="-") as ?markers) \nFROM <http://ns.inria.fr/d2kab/graph/wheatgenomicsslkg>\nFROM <http://ns.inria.fr/d2kab/ontology/wto/v3>\nWHERE {\n{\n\nSELECT distinct ?geneName ?gene ?paper1 ?Title1 ?WTOtrait WHERE \n{\n    VALUES ?WTOtrait { "resistance to Stripe rust" }\n    ?a1 a oa:Annotation ; \n        oa:hasTarget [ oa:hasSource ?source1 ] ;\n        oa:hasBody ?body .\n\n    GRAPH <http://ns.inria.fr/d2kab/ontology/wto/v3> {\n        ?body skos:prefLabel ?WTOtrait.\n    }\n\n    ?a2 a oa:Annotation ;\n        oa:hasTarget [ oa:hasSource ?source2 ] ;\n        oa:hasBody ?gene .\n        ?gene a d2kab:Gene ; skos:prefLabel ?geneName . \n        ?source1 frbr:partOf+ ?paper1 .\n        ?source2 frbr:partOf+ ?paper1 .\n        ?paper1 a fabio:ResearchPaper ; dct:title ?source1 .\n        ?source1 rdf:value ?Title1.\n}\nLIMIT 20\n}\n?a3 a oa:Annotation ;\n    oa:hasTarget [ oa:hasSource ?source3 ] ;\n    oa:hasBody [a d2kab:Marker ; skos:prefLabel ?marker ] .\n \n?a4 a oa:Annotation ;\n    oa:hasTarget [ oa:hasSource ?source4 ] ;\n    oa:hasBody ?gene .\n \n?source3 frbr:partOf+ ?paper2 .\n?source4 frbr:partOf+ ?paper2 .\n?paper2 a fabio:ResearchPaper ; dct:title ?titleURI .\n?titleURI rdf:value ?Title2.\nFILTER (URI(?paper1) != URI(?paper2))\n}\nGROUP BY ?WTOtrait ?geneName ?paper1 ?Title1 ?paper2 ?Title2\nLIMIT 50'
      }

    ]
  })

  configuration_ = signal<KGConfiguration>({
    kg_full_name: "",
    kg_short_name: "",
    kg_description: "",
    kg_sparql_endpoint_url: "",
    ontologies_sparql_endpoint_url: "",
    properties_qnames_info: [],
    prefixes: {
    },
    ontology_named_graphs: [
    ],
    excluded_classes_namespaces: [],
    queryExamples: []
  })

  firstFormGroup: FormGroup;

  secondFormGroup: FormGroup;

  thirdFormGroup: FormGroup;

  isEditable = false

  constructor(private configManagerService: ConfigManagerService,
    private dialogService: DialogService,
    private knownPrefixesService: KnownPrefixesService) {

    this.firstFormGroup = this._formBuilder.group({
      kg_full_name: [this.configuration().kg_full_name, Validators.required],
      kg_short_name: [this.configuration().kg_short_name, [Validators.required, Validators.pattern(/^[a-z0-9_]+$/)]],
      kg_description: [this.configuration().kg_description, Validators.required],
      kg_sparql_endpoint_url: [this.configuration().kg_sparql_endpoint_url, [Validators.required, this.httpPatternValidator]],
      ontologies_sparql_endpoint_url: [this.configuration().ontologies_sparql_endpoint_url, [this.httpPatternValidator]],
      properties_qnames_info: [this.configuration().properties_qnames_info, []],
      prefixes: this._formBuilder.array([]),
      ontology_named_graphs: [this.configuration().ontology_named_graphs],
      excluded_classes_namespaces: [this.configuration().excluded_classes_namespaces, []],
      queryExamples: this._formBuilder.array([]),
    });

    this.fillPrefixesFormArray()
    this.fillQueryExamplesFormArray()

    this.secondFormGroup = this._formBuilder.group({
      kg_short_name: [this.configuration().kg_short_name, Validators.required],
    });

    this.secondFormGroup.get('kg_short_name')?.disable();

    this.thirdFormGroup = this._formBuilder.group({
      kg_short_name: [this.configuration().kg_short_name, Validators.required],
    });

    this.thirdFormGroup.get('kg_short_name')?.disable();
  }

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

  deletePrefix(key: string, index: number) {
    this.configuration().prefixes = this.prefixArray.controls.reduce((acc, control) => {
      const key: string = control.get('key')?.value || "";
      const value: string = control.get('value')?.value || "";

      acc[key] = value;

      return acc;
    }, {} as { [key: string]: string });

    this.prefixArray.clear()

    setTimeout(() => {
      delete this.configuration().prefixes[key];
      this.fillPrefixesFormArray();
    }, 100);
  }

  addPrefix(key: string = '', value: string = '') {
    this.prefixArray.push(this._formBuilder.group(
      {
        key: this._formBuilder.control(key, [Validators.required]),
        value: this._formBuilder.control(value, [Validators.required, this.httpPatternValidator])
      })
    );

    this.filteredPrefixOptions.push(this.prefixArray.at(this.prefixArray.length - 1).valueChanges.pipe(
      filter(value => value['key'].length > 0),
      map(value => this._filterPrefix(value || ''))
    ));
  }

  private _filterPrefix(value: any): Prefix[] {
    let key = (value['key'] == undefined) ? "" : value['key'].toLowerCase();
    return this.knownPrefixesService.getPrefixes().filter(option => option.shortName.toLowerCase().startsWith(key));
  }

  createConfiguration() {

    if (this.firstFormGroup.invalid) {
      this.dialogService.notifyFormGroupValidationError(this.firstFormGroup);
      return; // Prevent further processing
    }

    // format the prefixes object
    this.configuration().prefixes = this.prefixArray.controls.reduce((acc, control) => {
      const key = control.get('key')?.value;
      const value = control.get('value')?.value;
      if (key && value) {
        acc[key] = value;
      }
      return acc;
    }, {} as { [key: string]: string });

    // format the queryExamples object
    this.configuration().queryExamples = this.queryExamplesArray.controls.map(control => {
      const question = control.get('question')?.value;
      const query = control.get('query')?.value;
      return {
        question: question,
        query: query
      } as QueryExample;
    })

    this.configuration().kg_full_name = this.firstFormGroup.value.kg_full_name;
    this.configuration().kg_short_name = this.firstFormGroup.value.kg_short_name;
    this.configuration().kg_description = this.firstFormGroup.value.kg_description;
    this.configuration().kg_sparql_endpoint_url = this.firstFormGroup.value.kg_sparql_endpoint_url;
    this.configuration().ontologies_sparql_endpoint_url = this.firstFormGroup.value.ontologies_sparql_endpoint_url;
    this.configuration().properties_qnames_info = this.firstFormGroup.value.properties_qnames_info;
    this.configuration().ontology_named_graphs = this.firstFormGroup.value.ontology_named_graphs;
    this.configuration().excluded_classes_namespaces = this.firstFormGroup.value.excluded_classes_namespaces;



    this.isInConfigCreatedTask = true;

    this.configManagerService.createNewConfiguration(this.configuration())
      .subscribe({
        next: value => {
          this.isInConfigCreatedTask = false;
          this.isConfigCreated = true;
          this.dialogService.notifyUser("Configuration created successfully",
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
          this.dialogService.notifyUser("KG description generation successful",
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
          this.dialogService.notifyUser("Configuration activated successfully",
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
          this.dialogService.notifyUser("KG embeddings generattion was successful",
            "Server response: \n ```json\n" + JSON.stringify(value, null, 2) + "\n```"
          );
        }
      });

  }

  fillPrefixesFormArray() {
    // Iterate over the prefixes object and create FormGroup for each prefix
    Object.entries(this.configuration().prefixes).forEach(([key, value]) => {
      this.addPrefix(key, value);
    });
  }
  get prefixArray() {
    return this.firstFormGroup.get('prefixes') as FormArray;
  }

  get firstFormValueMarkdown() {
    return "```json \n" + JSON.stringify(this.firstFormGroup.value, null, 2) + "\n```";
  }

  filteredPrefixOptions: Observable<Prefix[]>[] = [];

  filterPrefixes(value: string) {
    if (value && value.length != 0) {
      return this.knownPrefixesService.filterPrefixes(value)
    }
    else {
      return ""
    }
  }

  selectPrefix(index: number) {
    const prefix = this.prefixArray.at(index).get('key')?.value;
    if (!prefix) {
      return;
    }

    const value = this.knownPrefixesService.getPrefixValue(prefix);

    if (value) {
      this.prefixArray.at(index).get('value')?.setValue(value);
    }
  }


  /*
  >>>>>>>>>>>>>>>>>>>>>> Query Example >>>>>>>>>>>>>>>>>>>>>>
  */

  get queryExamplesArray() {
    return this.firstFormGroup.get('queryExamples') as FormArray;
  }


  deleteQueryExample(questionToDelete: string, queryToDelete: string) {

    let data: QueryExample[] = []
    this.queryExamplesArray.controls
      .forEach(control => {
        const question: string = control.get('question')?.value || "";
        const query: string = control.get('query')?.value || "";

        if (question != questionToDelete || query != queryToDelete) {
          data.push({
            question: question,
            query: query
          });
        }
      })


    this.queryExamplesArray.clear()

    this.configuration().queryExamples = data;

    setTimeout(() => {
      this.fillQueryExamplesFormArray();
    }, 100);
  }

  addQueryExample(question: string = '', query: string = '') {
    this.queryExamplesArray.push(this._formBuilder.group(
      {
        question: this._formBuilder.control(question, [Validators.required]),
        query: this._formBuilder.control(query, [Validators.required])
      })
    );
  }

  fillQueryExamplesFormArray() {

    this.configuration().queryExamples.forEach((queryExample: QueryExample) => {
      this.addQueryExample(queryExample.question, queryExample.query);
    });
  }

  printConfig() {
    console.log(this.configuration());

  }

  /*
  <<<<<<<<<<<<<<<<<<<<<< Query Example <<<<<<<<<<<<<<<<<<<<<<
  */

}
