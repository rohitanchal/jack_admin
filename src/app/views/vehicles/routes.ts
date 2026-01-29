import { Routes } from '@angular/router';
import { VehiclesComponent } from './vehicles.component';

export const routes: Routes = [
  {
    path: '',
    component: VehiclesComponent,
    data: {
      title: 'Vehicle Management',
    },
  }
];
