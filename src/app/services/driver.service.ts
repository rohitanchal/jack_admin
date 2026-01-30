import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { apiUrls } from '../api.urls';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})

export class DriverService {
  
  constructor(private http: HttpClient ) {};

  // Create Driver
  createDriverService(payload: any): Observable<any> {
    return this.http.post(`${apiUrls.driverApis}register-driver`, payload);
  };

  // Get all Driver
  getAllDriversService(page: number = 1, limit: number = 10, search: string = ''): Observable<any> {
    return this.http.get(`${apiUrls.driverApis}get-all-drivers`, {
       params: {
        page: page.toString(),
        limit: limit.toString(),
        search: search.trim()
      }
    });
  };

  // Get Driver by id
  getDriverService(id: string): Observable <any> {
    return this.http.get(`${apiUrls.driverApis}get-driver/${id}`)
  };

  // Update Driver by id

  // Delete Driver by id
  deleteDriverSerive(driverId: string): Observable<any> {
    return this.http.delete(`${apiUrls.driverApis}delete-driver/${driverId}`)
  };

  // Restore deleted Driver by id
  restoreDriverService(driverId: string): Observable <any> {
    return this.http.put(`${apiUrls.driverApis}restore-driver/${driverId}`, {});
  };


}
