import { inject, Injectable } from '@angular/core';
import { GenericDialog } from '../dialogs/generic-dialog/generic-dialog';
import { MatDialog } from '@angular/material/dialog';
import { ExportDatasetDialog } from '../dialogs/export-dataset-dialog/export-dataset-dialog';
import { AvailableQuestionsDialog } from '../dialogs/available-questions-dialog/available-questions-dialog';


@Injectable({
    providedIn: 'root'
})
export class DialogService {

    constructor(private dialog: MatDialog) {}

    notifyUser(title: string, message: string) {

        const dialogRef = this.dialog.open(GenericDialog,
            {
                data: { title: title, message: message },
            });
    }


    exportDataset() {

        const dialogRef = this.dialog.open(ExportDatasetDialog,
            {
                maxWidth: '95vw',
                width: '80vw',
            });
    }

    checkCurrentQuestions() {

        const dialogRef = this.dialog.open(AvailableQuestionsDialog,
            {
                maxWidth: '95vw',
                width: '80vw',
            });
    }
}