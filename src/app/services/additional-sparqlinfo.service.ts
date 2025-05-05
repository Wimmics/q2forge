import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { KG_DESCRIPTION_QUERY_EXTRACTION, KG_VOCABULARIES_QUERY_EXTRACTION } from './predefined-variables';

@Injectable({
  providedIn: 'root'
})
export class AdditionalSPARQLInfoService {

  constructor(private http: HttpClient) { }

  // Query to get the rdfs:label and rdfs:comment of a property
  getPropertyDetails(propertyUri: string, sparqlEndpoint: string, listOfProperties: string[]): Observable<any> {
    let sparqlQuery: string = `PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX dc: <http://purl.org/dc/elements/1.1/description>
    PREFIX dcterms: <http://purl.org/dc/terms/>
    PREFIX obo: <http://purl.obolibrary.org/obo/>
    SELECT `;

    for (let i = 0; i < listOfProperties.length; i++) {
      sparqlQuery += `?p${i} `
    }

    sparqlQuery += `WHERE {\n`

    for (let i = 0; i < listOfProperties.length; i++) {
      sparqlQuery += `OPTIONAL { <${propertyUri}> ${listOfProperties[i]} ?p${i} . }\n`
    }

    sparqlQuery += `}`;

    const headers = new HttpHeaders({
      'Accept': 'application/sparql-results+json', // Set the response format to JSON
    });

    const params = {
      query: sparqlQuery,
      format: 'application/json',
    };

    return this.http.get<any>(sparqlEndpoint, { headers, params });
  }


  getKGVocabularies(sparqlEndpoint: string): Observable<any> {
    let sparqlQuery: string = KG_VOCABULARIES_QUERY_EXTRACTION;
    const headers = new HttpHeaders({
      'Accept': 'application/sparql-results+json', // Set the response format to JSON
    });

    const params = {
      query: sparqlQuery,
      format: 'application/json',
    };

    return this.http.get<any>(sparqlEndpoint, { headers, params });
  }

  getKGDescriptions(sparqlEndpoint: string): Observable<any> {
    let sparqlQuery: string = KG_DESCRIPTION_QUERY_EXTRACTION;
    const headers = new HttpHeaders({
      'Accept': 'application/sparql-results+json', // Set the response format to JSON
    });

    const params = {
      query: sparqlQuery,
      format: 'application/json',
    };

    return this.http.get<any>(sparqlEndpoint, { headers, params });
  }

}
