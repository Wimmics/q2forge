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

const SERVER = "http://localhost:8000"
export const SPARQL_ENDPOINT_URI = `http://localhost:8080/sparql`
const API_BASE = `${SERVER}/api/q2forge`
export const GENERATE_QUESTION_ENDPOINT = `${API_BASE}/generate_questions`
export const JUDGE_QUERY_ENDPOINT = `${API_BASE}/judge_query`
export const ANSWER_QUESTION_ENDPOINT = `${API_BASE}/answer_question`
export const GRAPH_SCHEMA_ENDPOINT = `${API_BASE}/scenarios_graph_schema`
export const DEFAULT_CONFIG_ENDPOINT = `${API_BASE}/config/active`
export const CREATE_CONFIG_ENDPOINT = `${API_BASE}/config/create`
export const Activate_CONFIG_ENDPOINT = `${API_BASE}/config/activate`
export const KG_DESCRIPTION_CONFIG_ENDPOINT = `${API_BASE}/config/kg_descriptions`
export const KG_EMBEDDINGS_CONFIG_ENDPOINT = `${API_BASE}/config/kg_embeddings`

export const DEFAULT_JUDGE_QUESTION = "Which five diseases are most commonly mentioned in association with a classic anti-inflammatory compound?"

export const DEFAULT_ANSWER_QUESTION = "Which protein targets does donepezil (CHEBI_53289) inhibit with an IC50 below 2 µM? For each, optionally give its title if it exists, otherwise leave the column blank."

export const DEFAULT_COOKIE_EXPIRATION_DAYS = 7

export const KG_VOCABULARIES_QUERY_EXTRACTION = `
PREFIX dcterm: <http://purl.org/dc/terms/>
PREFIX void: <http://rdfs.org/ns/void#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

select ?vocabulary where {
?dataset a void:Dataset.
?dataset void:vocabulary ?vocabulary.
}
`

export const KG_DESCRIPTION_QUERY_EXTRACTION = `
PREFIX dcterm: <http://purl.org/dc/terms/>
PREFIX void: <http://rdfs.org/ns/void#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

select * where {
?dataset a void:Dataset.
?dataset dcterm:description ?description.
}
`