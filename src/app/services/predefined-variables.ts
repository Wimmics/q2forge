import { LLMModel } from "../models/llmmodel";

export const DEFAULT_SPARQL_JUDGE_QUERY = `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
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
      LIMIT 5`

export const AVAILABLE_LLM_MODELS: LLMModel[] = [
  {
    modelProvider: "Ovh",
    modelName: "Meta-Llama-3_1-70B-Instruct",
    baseUri: "https://llama-3-1-70b-instruct.endpoints.kepler.ai.cloud.ovh.net/api/openai_compat/v1",
  },
  {
    modelProvider: "Ovh",
    modelName: "DeepSeek-R1-Distill-Llama-70B",
    baseUri: "https://deepseek-r1-distill-llama-70b.endpoints.kepler.ai.cloud.ovh.net/api/openai_compat/v1",
  },
  {
    modelProvider: "OpenAI",
    modelName: "o3-mini",
    apiKey: "default",
  },
  {
    modelProvider: "DeepSeek",
    modelName: "deepseek-reasoner",
  },
  {
    modelProvider: "DeepSeek",
    modelName: "deepseek-chat",
  },
  {
    modelProvider: "Ollama-local",
    modelName: "llama3.2:1b",
  }];

const SERVER = "http://localhost:8000" // dev
// const SERVER = "http://134.59.134.239" // prod
export const SPARQL_ENDPOINT_URI = `${SERVER}/corese`
const API_BASE = `${SERVER}/api/test_dataset`
export const GENERATE_QUESTION_ENDPOINT = `${API_BASE}/generate-question`
export const JUDGE_QUERY_ENDPOINT = `${API_BASE}/judge_query`
export const ANSWER_QUESTION_ENDPOINT = `${API_BASE}/answer_question`
export const GRAPH_SCHEMA_ENDPOINT = `${API_BASE}/scenario_graph_schema`
export const DEFAULT_CONFIG_ENDPOINT = `${API_BASE}/default_config`

export const DEFAULT_JUDGE_QUESTION = "Which five diseases are most commonly mentioned in association with a classic anti-inflammatory compound?"

export const PROMPT_QUESTION_GENERATION = `
Generate a well-structured list of {number_of_questions} scientifically relevant questions based on the following knowledge graph by researchers:
- A brief description of the KG.
- A condensed schema representation of the KG.
- Some additional context to help generate questions.

Requirements:
1. Identify key subtopics and group questions accordingly.
2. Cover multiple scientific domains from the resource.
3. Include Basic, Intermediate, and Advanced levels of question complexity.
4. Provide examples of each complexity level.
5. Ensure clarity, precision, and thematic grouping.

Output:
- Clearly categorized and labeled questions by subtopic in the "question" key.
- Each question labeled with its complexity (Basic, Intermediate, Advanced) and some tags in the "tags" key.

A brief description of the KG:
{brief_description}

A condensed schema representation of the KG.
{kg_schema}

Some additional context to help generate questions.
{additional_context}

Generate only {number_of_questions} questions. No more or less.
`

export const KG_DESCRIPTION = `IDSM ChemWebRDF Manual
The application is a part of the IDSM project and allows SPARQL querying of PubChem data.
Data Schema
The database uses the data coming from the PubChemRDF project that provides RDF formatted information available in the PubChem archive. It mainly comprises information from the PubChem Compound, Substance, and Bioassay databases.

The PubChemRDF data includes many semantic relationships, for which existing ontologies are employed, whenever it is possible. Parts of these ontologies (e.g., class hierarchies, resource labels) are loaded into the database as well. Summarization of the used ontologies and relationship predicates are summarized in the PubChemRDF documentation.`

export const KG_SCHEMA = `PubChemRDF: 2024-12-31
ChEMBL: 35.0
ChEBI Ontology: 236
MassBank of North America (MoNA): 2024-04-28
In Silico Spectral Database (ISDB): 4.1
Medical Subject Headings (MESH): 2023-12-18
BioAssay Ontology (BAO): 2.8.11
Protein Ontology (PRO): 70.0
Gene Ontology (GO): 2024-06-17
Sequence Ontology (SO): 2024-06-05
Cell Line Ontology (CLO): 2.1.188
Cell Ontology (CL): 2024-08-16
The BRENDA Tissue Ontology (BTO): 2021-10-26
Human Disease Ontology (DO): 2024-07-31
Mondo Disease Ontology (MONDO): 2024-08-06
Symptom Ontology (SYMP): 2024-05-17
Pathogen Transmission Ontology (TRANS): 2022-10-10
The Human Phenotype Ontology (HP): 2024-08-13
Phenotype And Trait Ontology (PATO): 2024-03-28
Units of Measurement Ontology (UO): 2023-05-25
Ontology for Biomedical Investigations (OBI): 2024-06-10
Information Artifact Ontology (IAO): 2022-11-07
Uber-anatomy Ontology (UBERON): 2024-08-07
NCBI Taxonomy Database: 2024-07-03
National Center Institute Thesaurus (OBO Edition): 24.04e
OBO Relations Ontology: 2024-04-24
Basic Formal Ontology (BFO): 2019-08-26
Food Ontology (FOODON): 2024-07-12
Evidence and Conclusion Ontology (ECO): 2024-07-19
Disease Drivers Ontology (DISDRIV): 2023-12-15
Genotype Ontology (GENO): 2023-10-08
Common Anatomy Reference Ontology (CARO): 2023-03-15
Environment Ontology (ENVO): 2024-07-01
Ontology for General Medical Science (OGMS): 2021-08-19
Unified phenotype ontology (uPheno): 2.0
OBO Metadata Ontology: 2023-11-02
Biological Pathway Exchange (BioPAX): 1.0
UniProt RDF schema ontology: 2024_04
PDBx ontology: 5.341
Quantities, Units, Dimensions and Types Ontology (QUDT): 2.1
Open PHACTS Units extending QUDT: 2013-09-18
Shapes Constraint Language (SHACL): 2017-07-20
Linked Models: Datatype Ontology (DTYPE): 1.1
Linked Models: Vocabulary for Attaching Essential Metadata (VAEM): 2.0
Chemical Information Ontology (CHEMINF): 2.1.0
Semanticscience integrated ontology (SIO): 1.59
Ontology of Bioscientific Data Analysis and Data Management (EDAM): 1.25
National Drug File-Reference Terminology (NDF-RT): 2011-10-14
National Center Institute Thesaurus (NCIt): 24.07e
Experimental Factor Ontology (EFO): 3.69.0
Eagle-i Resource Ontology (ERO): 2015-06-30
Funding, Research Administration and Projects Ontology (FRAPO): 1.1.1
Patent Ontology (EPO): patent ontology version 1.1.0
W3C PROVenance Interchange: 2013-04-30
Metadata Authority Description Schema in RDF (MADS/RDF): 1.5.0
Citation Typing Ontology (CiTO): 2.8.1
Ontology for vCard: 2014-05-22
Feature Annotation Location Description Ontology (FALDO): 2013
FRBR-aligned Bibliographic Ontology (FaBiO): 2.2
Essential FRBR in OWL2 DL Ontology (FRBR): 1.0.1
Dublin Core Metadata Initiative Terms (DCMI): 2020-01-20
Bibliographic Ontology (BIBO): 1.3
Simple Knowledge Organization System (SKOS): 2009-08-18
Description of a Project Vocabulary (DOAP): 2022-03-13
FOAF Vocabulary: 0.1
Provenance, Authoring and Versioning (PAV): 2.3.1
SemWeb Vocab Status Ontology: 2011-12-12
Vocabulary of Interlinked Datasets (VoID): 2011-03-06
Situation Ontology: 1.1
Mass Spectrometry Ontology (MS): 4.1.172
ClassyFire Ontology: 2.1
OWL 2 Schema (OWL 2): 2009-10-16
RDF Schema (RDFS): 1.1
RDF Vocabulary Terms: 1.1`

export const ADDITIONAL_CONTEXT = `The PubChemRDF provides machine-readable RDF formatted information for the PubChem contents. PubChemRDF data is organized into different subdomains, including compound, substance, bioassay, gene/protein, pathway, taxonomy, cell line, reference, disease and more. Each individual subdomain can be accessed via the RESTful interface or downloaded on the FTP site and loaded into local triple stores. A list of Use Cases with SPARQL queries is provided to help you understand PubChemRDF and build your own SPARQL queries. For additional information, please check the Introduction page and the following paper:

Fu G, Batchelor C, Dumontier M, Hastings J, Willighagen E, Bolton E. PubChemRDF: towards the semantic annotation of PubChem compound and substance databases. J Cheminform. 2015 July 14; 7:34. doi: 10.1186/s13321-015-0084-4.
[PubMed PMID: 26175801] [PubMed Central PMCID: PMC4500850] [Free Full Text]`

export const NUMBER_OF_QUESTIONS_TO_GENERATE = 5


export const llm_generation_answer = "<think>\nOkay, so I need to generate two scientifically relevant questions based on the provided knowledge graph (KG). Let me try to break this down step by step.\n\nFirst, I'll read through the description of the KG. It's part of the IDSM project and allows SPARQL querying of PubChem data. The database includes PubChem Compound, Substance, and Bioassay databases. It uses various ontologies to structure the data, including ChEBI, MESH, BAO, PRO, GO, etc. \n\nThe condensed schema representation lists a bunch of ontologies with their versions. This tells me that the KG is extensive, covering a wide range of biological and chemical domains, each with their own structured data.\n\nThe additional context mentions that PubChemRDF offers information in RDF format, organized into subdomains like compound, substance, bioassay, genes, proteins, pathways, etc. It also provides SPARQL queries and use cases, which suggests that the KG supports complex scientific inquiries.\n\nI need to create two questions. Each should be categorized by subtopic, with labels indicating their complexity (Basic, Intermediate, Advanced) and relevant tags. The questions should cover multiple scientific domains and vary in complexity.\n\nLet me think about the key subtopics. From the context, subdomains include compound, substance, bioassay, gene/protein, pathway, taxonomy, cell line, disease, etc.\n\nFor the first question, maybe something about compounds and their relationships. Since PubChemRDF includes compound and substance databases, a question linking compounds to their biological activities would make sense. That could involve the BioAssay Ontology (BAO) for the activities and maybe PRO for proteins.\n\nThe second question could focus on pathways and genes. Since there's a pathway subdomain and ontologies like Gene Ontology (GO) and BioPAX, this would fit well.\n\nNow, thinking about complexity:\n\n1. An intermediate question: How do compounds relate to their bioassay results and proteins? This requires knowledge of multiple ontologies and how they connect in the KG.\n2. An advanced question: How do specific pathways relate to diseases, genes, and their orthologs? This would require more complex querying, possibly involving multiple ontologies and relationships.\n\nI need to phrase these questions clearly, ensuring they are scientifically relevant and precise. They should each have appropriate tags from the available ontologies and relevant domains.\n\nSo, first question: \"What are the key relationships between chemical compounds and their associated bioassay results, and how do these relate to protein interactions in the PubChemRDF dataset?\"\n\nThis touches on compounds, substances, bioassays, and protein interactions, using ontologies like PubChemRDF, BAO, and PRO.\n\nSecond question: \"How can one identify biological pathways associated with specific diseases, and what genes and orthologs are involved in these pathways across different species in the PubChemRDF knowledge graph?\"\n\nThis involves pathways, diseases, genes, and orthologs, using ontologies like BioPAX, DO, GO, and OBI.\n\nI think these cover multiple domains and vary in complexity from intermediate to advanced. Let me make sure they are clear and precise.\n</think>\n\nHere are the two scientifically relevant questions generated based on the knowledge graph:\n\n```json\n[\n  {\n    \"question\": \"What are the key relationships between chemical compounds and their associated bioassay results, and how do these relate to protein interactions in the PubChemRDF dataset?\",\n    \"complexity\": \"Intermediate\",\n    \"tags\": [\"PubChemRDF\", \"BioAssay Ontology (BAO)\", \"Protein Ontology (PRO)\", \"Compound\", \"Substance\", \"Protein Interactions\"]\n  },\n  {\n    \"question\": \"How can one identify biological pathways associated with specific diseases, and what genes and orthologs are involved in these pathways across different species in the PubChemRDF knowledge graph?\",\n    \"complexity\": \"Advanced\",\n    \"tags\": [\"PubChemRDF\", \"Biological Pathway\", \"Disease Ontology (DO)\", \"Gene Ontology (GO)\", \"Orthologs\", \"BioPAX\"]\n  }\n]\n```\n\nThese questions are designed to cover multiple scientific domains and vary in complexity from intermediate to advanced, incorporating relevant ontologies and subtopics from the provided knowledge graph."
