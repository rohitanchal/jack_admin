import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ColComponent,
  RowComponent,
  CardComponent,
  CardHeaderComponent,
  CardBodyComponent,
  ButtonDirective,
  ButtonCloseDirective,
  TableDirective,
  SpinnerComponent,
  ModalBodyComponent,
  ModalComponent,
  ModalFooterComponent,
  ModalHeaderComponent,
  ModalTitleDirective,
  PageItemDirective,
  PageLinkDirective,
  PaginationComponent,
} from '@coreui/angular';
import { VehicleService } from "../../services/vehicle.service";
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';


@Component({
  selector: 'app-vehicles',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ColComponent,
    RowComponent,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    ButtonDirective,
    ButtonCloseDirective,
    TableDirective,
    SpinnerComponent,
    ModalBodyComponent,
    ModalComponent,
    ModalFooterComponent,
    ModalHeaderComponent,
    ModalTitleDirective,
    PageItemDirective,
    PageLinkDirective,
    PaginationComponent,

  ],
  templateUrl: './vehicles.component.html',
  styleUrl: './vehicles.component.scss',
})

export class VehiclesComponent {

  loading = false;
  vehicles: any[] = [];

  totalCount = 0;
  totalPages = 0;
  currentPage = 1;
  limit = 5;

  actionLoading: { [key: string]: boolean } = {};

  search = '';
  selectedVehicle: any = null;
  deleteErrorMessage: string = '';

  public visibleAdd = false;
  public visibleDelete = false;
  public visibleRestore = false;


  searchSubject = new Subject<string>();



  constructor(
    private cdr: ChangeDetectorRef,
    private vehicleService: VehicleService,

  ) { };

  ngOnInit(): void {
    this.getVehicles();

    this.searchSubject
      .pipe(
        debounceTime(400),
        distinctUntilChanged()
      )
      .subscribe((value) => {
        this.search = value;
        this.currentPage = 1;
        this.getVehicles(1);
      });
  };

  // Modal toggle

  toggleAdd() {
    this.visibleAdd = !this.visibleAdd;
  };

  handleAddChange(event: any) {
    this.visibleAdd = event;
  };

  toggleDelete() {
    this.visibleDelete = !this.visibleDelete;
  };

  handleDeleteChange(event: any) {
    this.visibleDelete = event;
  };

  toggleRestore() {
    this.visibleRestore = !this.visibleRestore;
  };

  handleRestoreChange(event: any) {
    this.visibleRestore = event;
  };

  // Get all vehciles
  getVehicles(page: number = 1): void {
    this.loading = true;
    this.currentPage = page;

    this.vehicleService
      .getVehiclesService(this.currentPage, this.limit, this.search)
      .subscribe({
        next: (res) => {
          this.vehicles = res.data || [];

          this.totalCount = res.pagination?.totalCount || 0;
          this.totalPages = res.pagination?.totalPages || 0;

          this.loading = false;
          this.cdr.detectChanges();
          console.log("Get all vehcle:", this.vehicles);
        },
        error: (err) => {
          console.error('Error fetching vehicles', err);
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
  };

  // Pagination handler
  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.getVehicles(page);
  };

  // Delete Modal 
  openDeleteModal(vehicle: any) {

    if (vehicle.currentStatus === 'BOOKED' || vehicle.isAssigned) {
      alert(
        'This vehicle cannot be deleted because it is currently booked or assigned.'
      );
      return;
    };

    // SAFE TO DELETE
    this.selectedVehicle = vehicle;
    this.visibleDelete = true;
  };

  // Delete Confirmation
  confirmDelete(): void {
    if (!this.selectedVehicle?._id) return;

    const vehicleId = this.selectedVehicle._id;
    this.actionLoading[vehicleId] = true;
    this.deleteErrorMessage = '';

    this.vehicleService.deleteVehicleService(vehicleId).subscribe({
      next: () => {
        this.vehicles = this.vehicles.map(v =>
          v._id === vehicleId ? { ...v, isDeleted: true } : v
        );

        this.actionLoading[vehicleId] = false;
        this.toggleDelete();
        this.selectedVehicle = null;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.actionLoading[vehicleId] = false;

        // show backend message
        this.deleteErrorMessage =
          err?.error?.message || 'Unable to delete vehicle';

        console.error('Delete failed:', err);
        this.cdr.detectChanges();
      }
    });
  };

  // Restore Modal
  openRestoreModal(vehicle: any) {
    this.selectedVehicle = vehicle;
    this.visibleRestore = true;
  };

  // Restore Confirmation 
  confirmRestore(): void {
    if (!this.selectedVehicle?._id) return;

    const vehicleId = this.selectedVehicle._id;
    this.actionLoading[vehicleId] = true;

    this.vehicleService.restoreVehicleService(vehicleId).subscribe({
      next: () => {
        this.vehicles = this.vehicles.map(v =>
          v._id === vehicleId ? { ...v, isDeleted: false } : v
        );

        this.actionLoading[vehicleId] = false;
        this.toggleRestore();
        this.selectedVehicle = null;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Restore failed:', err);
        this.actionLoading[vehicleId] = false;
      }
    });
  };

  // Search vehicle 
  onSearchChange(value: string): void {
    this.searchSubject.next(value);
  };



}
