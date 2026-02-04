import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { apiUrls } from '../api.urls';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})

export class VehicleService {

  constructor(private http: HttpClient) { };

  // Add New Vehicle
  addVehicleService(): Observable<any> {
    return this.http.post(`${apiUrls.vehicleApis}add`, {});
  };

  // Get all vehicles
  getVehiclesService(page: number = 1, limit: number = 10, search: string = ''): Observable<any> {
    return this.http.get(`${apiUrls.vehicleApis}get-all`, {
      params: {
        page: page.toString(),
        limit: limit.toString(),
        search: search.trim()
      }
    });
  };

  // Delete Vehicle
  deleteVehicleService(vehicleId: string): Observable<any> {
    return this.http.delete(`${apiUrls.vehicleApis}delete/${vehicleId}`)
  };

  // Restore deleted vehicle
  restoreVehicleService(vehicleId: string): Observable<any> {
    return this.http.put(`${apiUrls.vehicleApis}restore/${vehicleId}`, {});
  };

}
