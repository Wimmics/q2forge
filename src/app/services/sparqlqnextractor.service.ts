import { Injectable } from '@angular/core';
import { ExtractedData } from '../models/extraction';
import { Parser } from 'sparqljs';


@Injectable({
  providedIn: 'root'
})
export class SPARQLQNExtractorService {

  private parser = new Parser();

  constructor() { }

  /**
   * Extracts QNames and URIs from a SPARQL query.
   * @param query The input SPARQL query string.
   * @returns An object containing prefixes, QNames, and URIs.
   */
  parseQuery(query: string): ExtractedData {
    try {
      const parsedQuery = this.parser.parse(query) as any;
      const whereClause = parsedQuery.where || [];
      let qnames: string[] = [];
      let fullQNames: string[] = [];

      function extractQNamesFromNode(node: any) {
        if (typeof node === 'string') {
          if (node.includes(':')) {
            qnames.push(node);
          } else if (node.startsWith('http')) {
            fullQNames.push(node);
          }
        } else if (typeof node === 'object') {
          Object.values(node).forEach(extractQNamesFromNode);
        }
      }

      whereClause.forEach(extractQNamesFromNode);

      return { qnames, fullQNames };
    } catch (error) {
      console.error('Error parsing SPARQL query:', error);
      throw error;
    }
  }


  
}
