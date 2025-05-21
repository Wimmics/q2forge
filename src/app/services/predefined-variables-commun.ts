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

export const DEFAULT_JUDGE_QUESTION = "Which five diseases are most commonly mentioned in association with a classic anti-inflammatory compound?"

export const DEFAULT_ANSWER_QUESTION = "What protein targets does donepezil (CHEBI_53289) inhibit with an IC50 less than 2 µM?"

export const DEFAULT_COOKIE_EXPIRATION_DAYS = 7

export const KG_VOCABULARIES_QUERY_EXTRACTION = `
PREFIX dcterm: <http://purl.org/dc/terms/>
PREFIX void: <http://rdfs.org/ns/void#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

select * where {
?x a void:Dataset.
?x void:vocabulary ?y.
}
`

export const KG_DESCRIPTION_QUERY_EXTRACTION = `
PREFIX dcterm: <http://purl.org/dc/terms/>
PREFIX void: <http://rdfs.org/ns/void#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

select * where {
?x a void:Dataset.
?x void:vocabulary ?y.
}
`