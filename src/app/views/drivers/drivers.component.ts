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
import { FormsModule, FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
type FileType = 'profilePic' | 'licenseFront' | 'licenseBack' | 'insuranceDocs';

@Component({
  selector: 'app-drivers',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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
  selectedFiles: {
    profilePic?: File;
    licenseFront?: File;
    licenseBack?: File;
    insuranceDocs?: File[];
  } = {};

  searchSubject = new Subject<string>();

  totalDrivers = 0;
  currentPage = 1;
  totalPages = 0;
  limit = 5;

  actionLoading: { [key: string]: boolean } = {};

  public visibleAddDriver = false;
  public visibleEdit = false;
  public visibleView = false;
  public visibleVerify = false;
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

    // Search Driver
    this.searchSubject
      .pipe(
        debounceTime(400),
        distinctUntilChanged()
      )
      .subscribe((value) => {
        this.searchText = value;
        this.currentPage = 1;
        this.getAllDrivers(1);
      });
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

  toggleEdit(): void {
    this.visibleEdit = !this.visibleEdit;
    if (!this.visibleEdit) this.resetEditState();
  }

  handleEditChange(event: boolean): void {
    this.visibleEdit = event;
    if (!event) this.resetEditState();
  }

  resetEditState(): void {
    this.selectedDriver = null;
    this.driverForm.reset();

    this.selectedFiles = {
      profilePic: undefined,
      licenseFront: undefined,
      licenseBack: undefined,
      insuranceDocs: []
    };
  }

  toggleView() {
    this.visibleView = !this.visibleView;
  };

  handleViewChange(event: any) {
    this.visibleView = event;
  };

  toggleVerify(): void {
    this.visibleVerify = false;
    this.selectedDriver = null;
  }

  handleVerifyChange(event: boolean): void {
    this.visibleVerify = event;
    if (!event) this.selectedDriver = null;
  }

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

  // Searching Driver 
  onSearchChange(value: string): void {
    this.searchSubject.next(value);
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

      licenseNumber: [''],
      licenseExpiry: [''],

      providerName: [''],
      policyNumber: [''],
      insuranceExpiry: [''],
    });
  };

  // Getter for easy access in template
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

  openVerifyModal(driver: any): void {
    this.selectedDriver = driver;
    this.visibleVerify = true;
  }

  // Verify Driver Account
  confirmVerify(): void {
    if (!this.selectedDriver?._id) return;

    this.driverService.verifyDriver(this.selectedDriver._id).subscribe({
      next: (res) => {
        this.driver = this.driver.map(d =>
          d._id === this.selectedDriver._id
            ? { ...d, isVerified: true }
            : d
        );

        this.visibleVerify = false;
        this.selectedDriver = null;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Verify failed', err);
      }
    });
  }

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
        this.driver = this.driver.map(d =>
          d._id === driverId ? { ...d, isDeleted: true } : d
        );

        this.actionLoading[driverId] = false;

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

        this.visibleRestore = false;
        this.selectedDriver = null;

        this.cdr.detectChanges();
      },
      error: () => {
        this.actionLoading[driverId] = false;
      }
    });
  };

  // Edit Modal Open
  openEditModal(driverId: string): void {
    this.visibleEdit = true;
    this.loading = true;

    this.driverService.getDriverService(driverId).subscribe({
      next: (res) => {
        const driver = res.data;
        this.selectedDriver = driver;

        this.driverForm.patchValue({
          name: driver.name ?? '',
          email: driver.email ?? '',
          phone: driver.phone ?? '',
          address: driver.address ?? '',
          dateOfBirth: this.formatDateForInput(driver.dateOfBirth),

          licenseNumber: driver.documents?.drivingLicense?.licenseNumber ?? '',
          licenseExpiry: this.formatDateForInput(
            driver.documents?.drivingLicense?.expiryDate
          ),

          providerName: driver.documents?.insurance?.providerName ?? '',
          policyNumber: driver.documents?.insurance?.policyNumber ?? '',
          insuranceExpiry: this.formatDateForInput(
            driver.documents?.insurance?.expiryDate
          ),
        });

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  // Files Select
  onFileSelect(event: Event, type: FileType): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    if (type === 'insuranceDocs') {
      this.selectedFiles.insuranceDocs = Array.from(input.files);
    } else {
      this.selectedFiles[type] = input.files[0];
    }
  }

  // Date Formatter
  formatDateForInput(dateValue: any): string {
    if (!dateValue) return '';

    if (typeof dateValue === 'object' && dateValue.$date) {
      return new Date(dateValue.$date).toISOString().split('T')[0];
    }

    if (typeof dateValue === 'string') {
      return new Date(dateValue).toISOString().split('T')[0];
    }

    return '';
  };

  // Update Driver
  updateDriver(): void {
    if (!this.selectedDriver) return;

    const formData = new FormData();
    let hasChanges = false;
    const controls = this.driverForm.controls;

    const appendIfDirty = (key: string, value: any) => {
      if (controls[key]?.dirty && value !== null && value !== '') {
        formData.append(key, value);
        hasChanges = true;
      }
    };

    appendIfDirty('name', this.driverForm.value.name);
    appendIfDirty('email', this.driverForm.value.email);
    appendIfDirty('phone', this.driverForm.value.phone);
    appendIfDirty('address', this.driverForm.value.address);
    appendIfDirty('dateOfBirth', this.driverForm.value.dateOfBirth);

    if (controls['password']?.dirty && this.driverForm.value.password) {
      formData.append('password', this.driverForm.value.password);
      hasChanges = true;
    }

    const documents: any = {};

    if (controls['licenseNumber']?.dirty || controls['licenseExpiry']?.dirty) {
      documents.drivingLicense = {
        licenseNumber: this.driverForm.value.licenseNumber,
        expiryDate: this.driverForm.value.licenseExpiry,
      };
      hasChanges = true;
    }

    if (
      controls['providerName']?.dirty ||
      controls['policyNumber']?.dirty ||
      controls['insuranceExpiry']?.dirty
    ) {
      documents.insurance = {
        providerName: this.driverForm.value.providerName,
        policyNumber: this.driverForm.value.policyNumber,
        expiryDate: this.driverForm.value.insuranceExpiry,
      };
      hasChanges = true;
    }

    if (Object.keys(documents).length) {
      formData.append('documents', JSON.stringify(documents));
    }

    const FILE_ORDER: FileType[] = [
      'profilePic',
      'licenseFront',
      'licenseBack'
    ];

    FILE_ORDER.forEach(type => {
      if (this.selectedFiles[type]) {
        formData.append('files', this.selectedFiles[type] as File);
        hasChanges = true;
      } else {
        formData.append(
          'files',
          new File([''], 'skip.png', { type: 'image/png' })
        );
      }
    });

    if (this.selectedFiles.insuranceDocs?.length) {
      this.selectedFiles.insuranceDocs.forEach(file => {
        formData.append('files', file);
        hasChanges = true;
      });
    }

    if (!hasChanges) {
      alert('No changes detected');
      return;
    }

    this.loading = true;

    this.driverService.updateDriverService(this.selectedDriver._id, formData)
      .subscribe({
        next: () => {
          this.loading = false;
          this.visibleEdit = false;
          this.resetEditState();
          this.getAllDrivers();
        },
        error: err => {
          this.loading = false;
          console.error('Update failed', err);
        }
      });
  };


}
