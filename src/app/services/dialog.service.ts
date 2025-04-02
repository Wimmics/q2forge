import { inject, Injectable } from '@angular/core';
import { GenericDialog } from '../dialogs/generic-dialog/generic-dialog';
import { MatDialog } from '@angular/material/dialog';
import { ExportDatasetDialog } from '../dialogs/export-dataset-dialog/export-dataset-dialog';
import { AvailableQuestionsDialog } from '../dialogs/available-questions-dialog/available-questions-dialog';
import { FormGroup } from '@angular/forms';


@Injectable({
    providedIn: 'root'
})
export class DialogService {

    constructor(private dialog: MatDialog) { }

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

    notifyFormGroupValidationError(formGroup: FormGroup) {
        let firstFormErrors: string[] = []
        for (const control in formGroup.controls) {
            if (formGroup.controls[control].invalid) {
                let errors = formGroup.controls[control].errors
                if (errors) {
                    firstFormErrors.push(`**${control}:** ${JSON.stringify(errors)}`);
                }
            }
        }
        this.notifyUser("Form validation error", "Please check the following errors:\n" + firstFormErrors.map(item => `* ${item}`).join("\n"));
    }
}