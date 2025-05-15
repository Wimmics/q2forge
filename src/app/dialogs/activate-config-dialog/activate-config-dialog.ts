import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { catchError } from 'rxjs';
import { ConfigManagerService } from '../../services/config-manager.service';
import { DialogService } from '../../services/dialog.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-activate-config-dialog',
  imports: [MatProgressSpinnerModule, MatFormFieldModule, MatSelectModule, ReactiveFormsModule, MatButtonModule,
    MatDialogModule, MatIconModule
  ],
  templateUrl: './activate-config-dialog.html',
  styleUrl: './activate-config-dialog.scss'
})
export class ActivateConfigDialog implements OnInit {

  activatingConfig = false;
  availableConfigs: string[] = [];
  selectedConfig: FormControl = new FormControl();

  constructor(
    private configManagerService: ConfigManagerService,
    private dialogService: DialogService,
    public dialogRef: MatDialogRef<ActivateConfigDialog>) { }

  ngOnInit() { 
    this.configManagerService.getAvailableConfigurations()
      .pipe(
        catchError((error: HttpErrorResponse) => {
          this.dialogService.notifyUser("Configuration retrieval error",
            "Server response: \n ```json\n" + JSON.stringify(error, null, 2) + "\n```"
          );
          throw error; // Rethrow the error to propagate it further
        })
      )
      .subscribe({
        next: value => {
          this.availableConfigs = value;
          this.selectedConfig.setValue(this.availableConfigs[0]);
        }
      });

  }
  activateConfiguration() {
    this.activatingConfig = true;
    this.configManagerService.activateConfiguration(this.selectedConfig.value)
      .subscribe({
        next: value => {
          this.activatingConfig = false;
          this.dialogService.notifyUser("Configuration activated successfully",
            "Server response: \n ```json\n" + JSON.stringify(value, null, 2) + "\n```"
          );
          this.dialogRef.close(true);
        },
        error: (error: HttpErrorResponse) => {
          this.activatingConfig = false;
          this.dialogService.notifyUser("Configuration activation error",
            "Server response: \n ```json\n" + JSON.stringify(error, null, 2) + "\n```"
          );
        }
      });
  }
}
