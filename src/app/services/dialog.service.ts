import { inject, Injectable } from '@angular/core';
import { GenericDialog } from '../dialogs/generic-dialog/generic-dialog';
import { MatDialog } from '@angular/material/dialog';


@Injectable({
    providedIn: 'root'
})
export class DialogService {


    notifyUser(title: string, message: string) {
        let notifyUserDialog = inject(MatDialog);

        const dialogRef = notifyUserDialog.open(GenericDialog,
            {
                data: { title: title, message: message },
            });
    }
}