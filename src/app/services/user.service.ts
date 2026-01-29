import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { apiUrls } from '../api.urls';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})

export class UserService {

  constructor(private http: HttpClient) { };

  // get all users (with search)
  getAllUsersService(page: number = 1, limit: number = 10, search: string = ''): Observable<any> {
    return this.http.get(`${apiUrls.userApis}get-all-users`, {
      params: {
        page: page.toString(),
        limit: limit.toString(),
        search: search.trim()
      }
    });
  };

  // Get user by ID
  getUserService(userId: string): Observable<any> {
    return this.http.get(`${apiUrls.userApis}get-user/${userId}`);
  };

  // Delete user by ID
  deleteUserService(userId: string): Observable<any> {
    return this.http.delete(`${apiUrls.userApis}delete-user/${userId}`);
  }

  // Restore user by ID
  restoreUserService(userId: string): Observable<any> {
    return this.http.put(`${apiUrls.userApis}restore-users/${userId}`, {});
  }





}
