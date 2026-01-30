import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  ModalComponent,
  ModalHeaderComponent,
  ModalBodyComponent,
  ModalFooterComponent,
  PageItemDirective,
  PageLinkDirective,
  PaginationComponent,
} from '@coreui/angular';
import { DriverService } from "../../services/driver.service";
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-drivers',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ColComponent,
    RowComponent,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    ButtonDirective,
    ButtonCloseDirective,
    TableDirective,
    SpinnerComponent,
    ModalComponent,
    ModalHeaderComponent,
    ModalBodyComponent,
    ModalFooterComponent,
    PageItemDirective,
    PageLinkDirective,
    PaginationComponent,

  ],
  templateUrl: './drivers.component.html',
  styleUrl: './drivers.component.scss',
})

export class DriversComponent implements OnInit {

  loading = false;
  viewLoading = false;
  driver: any[] = [];
  driverForm!: FormGroup;

  searchText = '';
  searchTimer: any;
  selectedDriver: any = null;


  totalDrivers = 0;
  currentPage = 1;
  totalPages = 0;
  limit = 5;

  actionLoading: { [key: string]: boolean } = {};

  public visibleAddDriver = false;
  public visibleView = false;
  public visibleDelete = false;
  public visibleRestore = false;



  constructor(
    private fb: FormBuilder,
    private driverService: DriverService,
    private cdr: ChangeDetectorRef
  ) { };


  ngOnInit(): void {
    this.initializeForm();
    this.getAllDrivers();
  };

  // Modal toggles
  toggleDriver() {
    this.visibleAddDriver = !this.visibleAddDriver;
    if (!this.visibleAddDriver) {
      this.driverForm.reset();
    }
  };

  handleDriverChange(event: any) {
    this.visibleAddDriver = event;
  };

  toggleView() {
    this.visibleView = !this.visibleView;
  };

  handleViewChange(event: any) {
    this.visibleView = event;
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


  // Form
  initializeForm(): void {
    this.driverForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])/)
      ]],
      phone: ['', [
        Validators.required,
        Validators.pattern(/^[0-9]{10}$/)
      ]],
      address: ['', [Validators.required, Validators.minLength(5)]],
      dateOfBirth: ['', Validators.required],
    });
  };

  //  // Getter for easy access in template
  get f() {
    return this.driverForm.controls;
  }

  // Submit Form
  submitDriver(): void {
    if (this.driverForm.invalid) {
      this.driverForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    this.driverService.createDriverService(this.driverForm.value).subscribe({
      next: (res) => {
        this.loading = false;
        this.toggleDriver();
        this.getAllDrivers();
      },
      error: (err) => {
        this.loading = false;
        console.error('Create Driver Error:', err);
      }
    });
  };


  // Get all Drivers
  getAllDrivers(page: number = 1): void {
    this.loading = true;
    this.currentPage = page;

    this.driverService.getAllDriversService(this.currentPage, this.limit, this.searchText).subscribe({
      next: (res) => {
        this.driver = res.data || [];

        this.totalDrivers = res.pagination?.totalCount || 0;
        this.totalPages = res.pagination?.totalPages || 0;

        this.loading = false;
        this.cdr.detectChanges();


        console.log("Drivers:", this.driver);
      },
      error: (err) => {
        console.error('Error fetching drivers', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  };

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.getAllDrivers(page);
  };

  // Get driver by id (VIEW)
  getDriver(id: string): void {
    if (!id) return;

    this.viewLoading = true;
    this.visibleView = true;

    this.driverService.getDriverService(id).subscribe({
      next: (res) => {
        this.selectedDriver = res?.data || null;
        this.viewLoading = false;
        this.cdr.detectChanges();
        console.log("driver details", this.selectedDriver);
      },
      error: () => {
        this.viewLoading = false;
      }
    });
  };

  // Open Delete Modal
  openDeleteModal(driver: any): void {
    this.selectedDriver = driver;
    this.visibleDelete = true;
  }

  closeDeleteModal(): void {
    this.visibleDelete = false;
    this.selectedDriver = null;
  }

  // Delete driver by ID
  confirmDelete(): void {
    if (!this.selectedDriver) return;

    const driverId = this.selectedDriver._id;
    this.actionLoading[driverId] = true;

    this.driverService.deleteDriverSerive(driverId).subscribe({
      next: () => {
        // Update UI
        this.driver = this.driver.map(d =>
          d._id === driverId ? { ...d, isDeleted: true } : d
        );

        this.actionLoading[driverId] = false;

        // 🔥 CLOSE MODAL PROPERLY
        this.visibleDelete = false;
        this.selectedDriver = null;

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Delete failed:', err);
        this.actionLoading[driverId] = false;
      }
    });
  }


  // Open Restore Modal
  openRestoreModal(driver: any): void {
    this.selectedDriver = driver;
    this.visibleRestore = true;
  };

  // Restore driver by ID
  confirmRestore(): void {
    if (!this.selectedDriver) return;

    const driverId = this.selectedDriver._id;
    this.actionLoading[driverId] = true;

    this.driverService.restoreDriverService(driverId).subscribe({
      next: () => {
        this.driver = this.driver.map(d =>
          d._id === driverId ? { ...d, isDeleted: false } : d
        );

        this.actionLoading[driverId] = false;

        // 🔥 CLOSE MODAL PROPERLY
        this.visibleRestore = false;
        this.selectedDriver = null;

        this.cdr.detectChanges();
      },
      error: () => {
        this.actionLoading[driverId] = false;
      }
    });
  }








}
