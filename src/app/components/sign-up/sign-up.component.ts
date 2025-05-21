import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, FormsModule, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { AuthService } from '../../services/auth-service';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-sign-up',
  imports: [ReactiveFormsModule, FormsModule, MatFormFieldModule, MatIconModule, MatButtonModule, MatInputModule, RouterModule],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss'
})
export class SignUpComponent {
  signUpForm!: FormGroup;
  showPassword = false

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.signUpForm = new FormGroup({
      'username': new FormControl('', [Validators.required]),
      'password': new FormControl('', [Validators.required, Validators.minLength(6)]),
      'retype-password': new FormControl('', [Validators.required])
    },
      { validators: this.passwordsMatchValidator }
    )
  }

  onSubmit() {
    if (this.signUpForm.invalid) {
      return;
    }

    // if (this.signUpForm.value["password"] != this.signUpForm.value["retype-password"]) {
    //   this.signUpForm.get("retype-password")?.setErrors({ "not_matching": true })
    //   this.signUpForm.get("password")?.setErrors({ "not_matching": true })
    //   return
    // }

    // this.signUpForm.get("retype-password")?.setErrors(null)
    // this.signUpForm.get("password")?.setErrors(null)

    this.authService.signupUser(this.signUpForm.value.username, this.signUpForm.value.password);
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  passwordsMatchValidator(form: AbstractControl) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('retype-password')?.value;
    if (password !== confirmPassword) {
      form.get('retype-password')?.setErrors({ mismatch: true });
    } else {
      form.get('retype-password')?.setErrors(null);
    }
    return null;
  }
}
