import { inject, Injectable } from '@angular/core';
import { GenericDialog } from '../dialogs/generic-dialog/generic-dialog';
import { MatDialog } from '@angular/material/dialog';
import { ExportDatasetDialog } from '../dialogs/export-dataset-dialog/export-dataset-dialog';
import { AvailableQuestionsDialog } from '../dialogs/available-questions-dialog/available-questions-dialog';
import { AbstractControl, FormArray, FormGroup } from '@angular/forms';
import { ActivateConfigDialog } from '../dialogs/activate-config-dialog/activate-config-dialog';


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
        const formErrors = this.collectFormErrors(formGroup);
        this.notifyUser("Form validation error", "Please check the following errors: \n ```json \n" + JSON.stringify(formErrors, null, 2) + "\n ``` \n");
    }

    collectFormErrors(control: AbstractControl, path: string = ''): any[] {
        let errors: any[] = [];

        if (control.errors) {
            errors.push({ path, errors: control.errors });
        }

        if (control instanceof FormGroup) {
            Object.keys(control.controls).forEach((key) => {
                const childControl = control.get(key);
                if (childControl) {
                    errors = errors.concat(this.collectFormErrors(childControl, path ? `${path}.${key}` : key));
                }
            });
        } else if (control instanceof FormArray) {
            control.controls.forEach((childControl, index) => {
                errors = errors.concat(this.collectFormErrors(childControl, `${path}[${index}]`));
            });
        }

        return errors;
    }

    activateConfig() {
        const dialogRef = this.dialog.open(ActivateConfigDialog).afterClosed().subscribe((result) => {
            if (result) {
                window.location.reload();
            }
        });
    }
}