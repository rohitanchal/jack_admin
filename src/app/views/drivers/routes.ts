import { Routes } from '@angular/router';
import { DriversComponent } from './drivers.component';

export const routes: Routes = [
  {
    path: '',
    component: DriversComponent,
    data: {
      title: 'Driver Management',
    },
  },
];
