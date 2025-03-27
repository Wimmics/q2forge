import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ExtractCodeBlocksService {

    findJsonBlocks(text: string): string[] {
        const matches = text.match(/```json([\s\S]*?)```/g);
        return matches ? matches.map(match => match.replace(/```json|```/g, "").trim()) : [];
    }

    findSPARQLBlocks(text: string): string[] {
        const matches = text.match(/```sparql([\s\S]*?)```/g);
        return matches ? matches.map(match => match.replace(/```sparql|```/g, "").trim()) : [];
    }
}