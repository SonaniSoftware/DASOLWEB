import { Component, OnInit, inject } from '@angular/core';
import { ColDef, ICellRendererParams, ValueFormatterParams } from 'ag-grid-community';
import {
  DeveloperService,
  ProcessMasterRow,
  ProcessPermitRow,
  ProcessStatusRow,
  ProcessTypeRow,
} from '../../core/services/developer.service';
import { NotificationService } from '../../core/services/notification.service';
import { GridActionsComponent } from '../grid-actions.component';
import { statusBadge, gridTheme } from '../grid-shared';

@Component({
  selector: 'app-process-permit',
  standalone: false,
  templateUrl: './process-permit.component.html',
  styleUrl: '../developer-page.scss',
})
export class ProcessPermitComponent implements OnInit {
  private dev = inject(DeveloperService);
  private notify = inject(NotificationService);

  rows: ProcessPermitRow[] = [];
  types: ProcessTypeRow[] = [];
  processes: ProcessMasterRow[] = [];
  statuses: ProcessStatusRow[] = [];

  loading = false;
  showForm = false;
  editKeys: { typeId: number; processId: number; statusId: number } | null = null;
  model = this.blankModel();

  readonly theme = gridTheme;
  readonly context = { componentParent: this };
  readonly defaultColDef: ColDef = { sortable: true, filter: true, resizable: true, flex: 1 };
  readonly columnDefs: ColDef[] = [
    { headerName: 'Type', field: 'TypeName', maxWidth: 160 },
    { headerName: 'Process', field: 'ProcessName' },
    { headerName: 'Status', field: 'StatusName' },
    { headerName: 'Next Process', field: 'NProcessName' },
    { headerName: 'Next Status', field: 'NStatusName' },
    {
      headerName: 'Final', field: 'ISFinal', maxWidth: 100, flex: 0,
      valueFormatter: (p: ValueFormatterParams) => (p.value ? 'Yes' : 'No'),
    },
    {
      headerName: 'Active', field: 'ISActive', maxWidth: 110, flex: 0,
      cellRenderer: (p: ICellRendererParams) => statusBadge(p.value),
    },
    { headerName: 'Actions', cellRenderer: GridActionsComponent, sortable: false, filter: false, maxWidth: 120, flex: 0 },
  ];

  ngOnInit(): void {
    // Load the master lists first so we can resolve names + fill the dropdowns.
    this.dev.listProcessTypes().subscribe((t) => {
      this.types = t;
      this.dev.listProcesses().subscribe((p) => {
        this.processes = p;
        this.dev.listProcessStatuses().subscribe((s) => {
          this.statuses = s;
          this.load();
        });
      });
    });
  }

  /** Processes belonging to the currently selected type. */
  get typeProcesses(): ProcessMasterRow[] {
    return this.processes.filter((p) => p.TypeID === this.model.typeId);
  }
  /** Statuses belonging to the currently selected type. */
  get typeStatuses(): ProcessStatusRow[] {
    return this.statuses.filter((s) => s.TypeID === this.model.typeId);
  }

  load(): void {
    this.loading = true;
    this.dev.listProcessPermits().subscribe({
      next: (r) => {
        this.rows = r.map((row) => ({
          ...row,
          TypeName: this.typeName(row.TypeID),
          ProcessName: this.processName(row.TypeID, row.ProcessID),
          StatusName: this.statusName(row.TypeID, row.StatusID),
          NProcessName: row.NProcessID != null ? this.processName(row.TypeID, row.NProcessID) : '',
          NStatusName: row.NStatusID != null ? this.statusName(row.TypeID, row.NStatusID) : '',
        }));
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  add(): void {
    this.editKeys = null;
    this.model = this.blankModel();
    this.model.typeId = this.types[0]?.TypeID ?? 0;
    this.showForm = true;
  }

  edit(row: ProcessPermitRow): void {
    this.editKeys = { typeId: row.TypeID, processId: row.ProcessID, statusId: row.StatusID };
    this.model = {
      typeId: row.TypeID,
      processId: row.ProcessID,
      statusId: row.StatusID,
      permitCode: row.PermitCode ?? '',
      permitName: row.PermitName ?? '',
      nProcessId: row.NProcessID,
      nStatusId: row.NStatusID,
      isFinal: !!row.ISFinal,
      serialNo: row.SerialNo,
      isActive: !!row.ISActive,
    };
    this.showForm = true;
  }

  /** Clear next-step fields when a step is marked final. */
  onFinalChange(): void {
    if (this.model.isFinal) {
      this.model.nProcessId = null;
      this.model.nStatusId = null;
    }
    this.autoFill();
  }

  /** Reset step/status selections when the type changes (they are type-scoped). */
  onTypeChange(): void {
    this.model.processId = 0;
    this.model.statusId = 0;
    this.model.nProcessId = null;
    this.model.nStatusId = null;
    this.autoFill();
  }

  /**
   * Auto-fill Permit Code (processId + statusId + nProcessId) and
   * Permit Name ("ProcessName - StatusName") from the current selections.
   * Called whenever Process / Status / Next Process changes.
   */
  autoFill(): void {
    const pid = this.model.processId || '';
    const sid = this.model.statusId || '';
    const nid = this.model.nProcessId ?? '';
    this.model.permitCode = `${pid}${sid}${nid}`;

    const pName = this.processName(this.model.typeId, this.model.processId);
    const sName = this.statusName(this.model.typeId, this.model.statusId);
    this.model.permitName = pName && sName ? `${pName} - ${sName}` : (pName || sName || '');
  }

  save(): void {
    const m = this.model;
    if (!m.typeId || !m.processId || !m.statusId) {
      this.notify.warning('Type, process and status are required.');
      return;
    }
    if (!m.isFinal && !m.nProcessId) {
      this.notify.warning('Next process is required for a non-final step.');
      return;
    }
    const req = this.editKeys
      ? this.dev.updateProcessPermit(this.editKeys.typeId, this.editKeys.processId, this.editKeys.statusId, m)
      : this.dev.createProcessPermit(m);
    req.subscribe({
      next: () => { this.notify.success('Saved.'); this.showForm = false; this.load(); },
      error: (e) => this.notify.error(e?.error?.message ?? 'Save failed.'),
    });
  }

  remove(row: ProcessPermitRow): void {
    if (!confirm(`Delete permit for "${this.processName(row.TypeID, row.ProcessID)} / ${this.statusName(row.TypeID, row.StatusID)}"?`)) return;
    this.dev.deleteProcessPermit(row.TypeID, row.ProcessID, row.StatusID).subscribe({
      next: () => { this.notify.success('Deleted.'); this.load(); },
      error: (e) => this.notify.error(e?.error?.message ?? 'Delete failed.'),
    });
  }

  private blankModel() {
    return {
      typeId: 0,
      processId: 0,
      statusId: 0,
      permitCode: '',
      permitName: '',
      nProcessId: null as number | null,
      nStatusId: null as number | null,
      isFinal: false,
      serialNo: null as number | null,
      isActive: true,
    };
  }

  private typeName(typeId: number): string {
    return this.types.find((t) => t.TypeID === typeId)?.TypeName ?? '';
  }
  private processName(typeId: number, processId: number): string {
    return this.processes.find((p) => p.TypeID === typeId && p.ProcessID === processId)?.ProcessName ?? '';
  }
  private statusName(typeId: number, statusId: number): string {
    return this.statuses.find((s) => s.TypeID === typeId && s.StatusID === statusId)?.StatusName ?? '';
  }
}
