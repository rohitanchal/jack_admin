import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconDirective } from '@coreui/icons-angular';
import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardGroupComponent,
  ColComponent,
  ContainerComponent,
  FormControlDirective,
  InputGroupComponent,
  InputGroupTextDirective,
  RowComponent,
} from '@coreui/angular';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ContainerComponent,
    RowComponent,
    ColComponent,
    CardGroupComponent,
    CardComponent,
    CardBodyComponent,
    InputGroupComponent,
    InputGroupTextDirective,
    IconDirective,
    FormControlDirective,
    ButtonDirective,
  ]
})

export class LoginComponent {

  loginForm!: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private router: Router,
  ) { };

  ngOnInit(): void {
    this.initLoginForm();
  };

  // Login Form
  initLoginForm() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  };

  // Submit Login Form
  submitLoginForm(): void {
    if (this.loginForm.invalid) {
      alert('Please enter valid email & password');
      return;
    }

    this.adminService.adminLoginService(this.loginForm.value)
      .subscribe({
        next: (res) => {
          alert('Login successful');

          // Save tokens
          localStorage.setItem('accessToken', res.accessToken);
          localStorage.setItem('refreshToken', res.refreshToken);
          localStorage.setItem('admin', JSON.stringify(res.admin));

          // Navigate
          this.router.navigate(['/dashboard']);
          this.loginForm.reset();
        },
        error: (err) => {
          console.error('Login Error:', err);
          alert(err?.error?.message || 'Invalid email or password');
          this.errorMessage = err?.error?.message || 'Login failed';
        }
      });
  };





}
