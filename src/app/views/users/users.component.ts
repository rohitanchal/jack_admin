import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ButtonDirective,
  ColComponent,
  RowComponent,
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
  TableDirective,
  PageItemDirective,
  PageLinkDirective,
  PaginationComponent,
  SpinnerComponent,
  ButtonCloseDirective,
  ModalBodyComponent,
  ModalComponent,
  ModalFooterComponent,
  ModalHeaderComponent,
  ModalTitleDirective,
} from '@coreui/angular';
import { FormsModule } from '@angular/forms';
import { UserService } from "../../services/user.service";

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    ButtonDirective,
    ColComponent,
    RowComponent,
    CardBodyComponent,
    CardComponent,
    CardHeaderComponent,
    TableDirective,
    PageItemDirective,
    PageLinkDirective,
    PaginationComponent,
    SpinnerComponent,
    ButtonCloseDirective,
    ModalBodyComponent,
    ModalComponent,
    ModalFooterComponent,
    ModalHeaderComponent,
    ModalTitleDirective,
    FormsModule,
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
})

export class UsersComponent {

  loading = false;
  users: any[] = [];
  allUsers: any[] = [];

  selectedUser: any = null;
  userLoading = false;
  searchText = '';
  searchTimer: any;

  totalUsers = 0;
  currentPage = 1;
  totalPages = 0;
  limit = 5;

  actionLoading: { [key: string]: boolean } = {};

  public visibleUser = false;
  public visibleDelete = false;
  public visibleRestore = false;

  constructor(
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) { }

  // Modal Toggles
  toggleUser() {
    this.visibleUser = !this.visibleUser;
  }

  handleUserChange(event: any) {
    this.visibleUser = event;
  }

  toggleDelete() {
    this.visibleDelete = !this.visibleDelete;
  }

  handleDeleteChange(event: any) {
    this.visibleDelete = event;
  }

  toggleRestore() {
    this.visibleRestore = !this.visibleRestore;
  }

  handleRestoreChange(event: any) {
    this.visibleRestore = event;
  }


  ngOnInit(): void {
    this.getAllUsers();
  };

  // Get all users
  getAllUsers(page: number = 1): void {
    this.loading = true;
    this.currentPage = page;

    this.userService.getAllUsersService(this.currentPage, this.limit, this.searchText).subscribe({
      next: (res) => {
        this.users = res.data || [];

        this.totalUsers = res.pagination?.totalCount || 0;
        this.totalPages = res.pagination?.totalPages || 0;

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching users:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.getAllUsers(page);
  }

  // Search (Globle)
  onSearchChange(): void {
    clearTimeout(this.searchTimer);

    this.searchTimer = setTimeout(() => {
      this.currentPage = 1;
      this.getAllUsers(1);
    }, 400);
  }

  // Open User Modal
  openUserModal(userId: string): void {
    this.visibleUser = true;
    this.getUserById(userId);
  }

  // Get user by ID
  getUserById(userId: string): void {
    if (!userId) return;

    this.visibleUser = true;
    this.userLoading = true;
    this.selectedUser = null;

    this.userService.getUserService(userId).subscribe({
      next: (res) => {
        this.selectedUser = res.data;
        this.userLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching user:', err);
        this.userLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Open Delete Modal
  openDeleteModal(user: any): void {
    this.selectedUser = user;
    this.visibleDelete = true;
  }

  closeDeleteModal(): void {
    this.visibleDelete = false;
    this.selectedUser = null;
  }

  // Delete user by ID
  confirmDelete(): void {
    if (!this.selectedUser) return;

    const userId = this.selectedUser._id;
    this.actionLoading[userId] = true;

    this.userService.deleteUserService(userId).subscribe({
      next: () => {
        // Update UI without refetch
        this.users = this.users.map(user =>
          user._id === userId ? { ...user, isDeleted: true } : user
        );

        this.actionLoading[userId] = false;
        this.closeDeleteModal();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Delete failed:', err);
        this.actionLoading[userId] = false;
      }
    });
  }

  // Open Restore Modal
  openRestoreModal(user: any): void {
    this.selectedUser = user;
    this.visibleRestore = true;
  }

  // Restore user by ID
  confirmRestore(): void {
    if (!this.selectedUser) return;

    const userId = this.selectedUser._id;
    this.actionLoading[userId] = true;

    this.userService.restoreUserService(userId).subscribe({
      next: () => {
        this.users = this.users.map(user =>
          user._id === userId ? { ...user, isDeleted: false } : user
        );

        this.actionLoading[userId] = false;
        this.toggleRestore();
        this.selectedUser = null;
        this.cdr.detectChanges();
      },
      error: () => {
        this.actionLoading[userId] = false;
      }
    });
  }


}