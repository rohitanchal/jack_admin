import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { apiUrls } from '../api.urls';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})

export class AdminService {
  constructor(private http: HttpClient) { };

  // admin login
  adminLoginService(data: { email: string; password: string }): Observable<any> {
    return this.http.post(`${apiUrls.adminApis}login`, data);
  }

  refreshToken(): Observable<any> {
    const refreshToken = localStorage.getItem('refreshToken');

    return this.http.post(`${apiUrls.adminApis}refresh-token`, {
      refreshToken,
    });
  }

  // Admin logout 
  logout(): Observable<any> {
    const token = localStorage.getItem('accessToken');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http
      .post(`${apiUrls.adminApis}logout`, {}, { headers })
      .pipe(
        tap(() => {
          // Clear storage after successful logout
          localStorage.clear();
        })
      );
  }

  // Emergency logout (used when refresh fails)
  forceLogout(): void {
    localStorage.clear();
  }


}
