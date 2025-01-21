import { NgOptimizedImage } from "@angular/common";
import { Component } from '@angular/core';
import { MatButton } from "@angular/material/button";

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    MatButton,
    NgOptimizedImage
  ],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss'
})
export class LoginPageComponent {

}

