import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild, inject } from '@angular/core';
import { CambioPaginaEvent, PaginacionComponent, PaginacionConfig } from '../../../../shared/components/paginacion/paginacion.component';
import { SelectboxComponent } from '../../../../shared/components/selectbox/selectbox.component';
import { Colaborador, DatosBancarios, DocumentoColaborador } from '../../models/colaborador.model';
import { PdfViewerModalComponent } from '../../../../shared/components/pdf-viewer-modal/pdf-viewer-modal.component';
import { CopyTextButtonComponent } from '../../../../shared/components/copy-text-button/copy-text-button.component';
import { ColaboradoresService } from '../../services/colaboradores.service';

type SharePlatform = 'whatsapp' | 'messenger' | 'instagram';

@Component({
  imports: [PaginacionComponent, SelectboxComponent, PdfViewerModalComponent, CopyTextButtonComponent],
  selector: 'app-colaboradores-table',
  templateUrl: './colaboradores-table.component.html'
})
export class ColaboradoresTableComponent {
  private readonly colaboradoresService = inject(ColaboradoresService);
  @Input({ required: true }) colaboradores: Colaborador[] = [];
  @Input() expandedId = '';
  @Output() expandedIdChange = new EventEmitter<string>();
  @Output() editColaborador = new EventEmitter<Colaborador>();
  @Output() selectedIdsChange = new EventEmitter<string[]>();

  protected selectedIds = new Set<string>();
  protected paginaActual = 0;
  protected porPagina = 10;
  protected previewDocument: DocumentoColaborador | null = null;
  protected shareDocumentSelection: DocumentoColaborador | null = null;
  protected sharePlatformSelection: SharePlatform | null = null;
  protected shareFeedback = '';
  private readonly selectedBankIndexes = new Map<string, number>();
  private rowSelectionActive = false;
  private ignoreNextRowAction = false;
  private dragSelectionValue = false;
  private dragStartId: string | null = null;
  private previewObjectUrl = '';

  @ViewChild('selectionTable') private selectionTable?: ElementRef<HTMLTableElement>;

  protected toggle(colaboradorId: string): void {
    this.expandedIdChange.emit(this.expandedId === colaboradorId ? '' : colaboradorId);
  }

  protected selectedBankIndex(colaborador: Colaborador): number {
    return this.selectedBankIndexes.get(colaborador.id)
      ?? Math.max(0, colaborador.datosBancarios?.findIndex((cuenta) => cuenta.esPrincipal) ?? 0);
  }

  protected selectedBankAccount(colaborador: Colaborador): DatosBancarios | null {
    const cuentas = colaborador.datosBancarios ?? [];
    return cuentas[this.selectedBankIndex(colaborador)] ?? cuentas[0] ?? null;
  }

  protected selectBankAccount(colaboradorId: string, index: string): void {
    this.selectedBankIndexes.set(colaboradorId, Number(index));
  }

  protected get paginationConfig(): PaginacionConfig {
    const totalElementos = this.colaboradores.length;
    return {
      paginaActual: this.paginaActual,
      porPagina: this.porPagina,
      totalElementos,
      totalPaginas: Math.max(1, Math.ceil(totalElementos / this.porPagina))
    };
  }

  protected get paginatedColaboradores(): Colaborador[] {
    const inicio = this.paginaActual * this.porPagina;
    return this.colaboradores.slice(inicio, inicio + this.porPagina);
  }

  protected get allPageRowsSelected(): boolean {
    return this.paginatedColaboradores.length > 0 && this.paginatedColaboradores.every(({ id }) => this.selectedIds.has(id));
  }

  protected get somePageRowsSelected(): boolean {
    return !this.allPageRowsSelected && this.paginatedColaboradores.some(({ id }) => this.selectedIds.has(id));
  }

  protected onPageChange(event: CambioPaginaEvent): void {
    this.paginaActual = event.pagina;
    this.porPagina = event.porPagina;
  }

  protected isSelected(colaboradorId: string): boolean {
    return this.selectedIds.has(colaboradorId);
  }

  protected toggleRowSelection(colaboradorId: string, isSelected: boolean): void {
    if (isSelected) this.selectedIds.add(colaboradorId);
    else this.selectedIds.delete(colaboradorId);

    this.emitSelectedIds();
  }

  protected togglePageSelection(isSelected: boolean): void {
    for (const { id } of this.paginatedColaboradores) {
      if (isSelected) this.selectedIds.add(id);
      else this.selectedIds.delete(id);
    }

    this.emitSelectedIds();
  }

  private emitSelectedIds(): void {
    this.selectedIdsChange.emit([...this.selectedIds]);
  }

  protected beginRowSelection(event: MouseEvent, colaboradorId: string): void {
    if (event.button !== 0 || this.isInteractiveTarget(event.target)) return;

    this.rowSelectionActive = true;
    this.dragStartId = colaboradorId;
    this.dragSelectionValue = !this.isSelected(colaboradorId);
  }

  protected extendRowSelection(colaboradorId: string): void {
    if (!this.rowSelectionActive || !this.dragStartId || colaboradorId === this.dragStartId) return;

    this.ignoreNextRowAction = true;
    this.setRowSelection(this.dragStartId, this.dragSelectionValue);
    this.setRowSelection(colaboradorId, this.dragSelectionValue);
  }

  protected onRowClick(colaborador: Colaborador): void {
    if (this.ignoreNextRowAction) return;
    this.editColaborador.emit(colaborador);
  }

  protected formatContactoEmergencia(nombre: string, parentesco?: string, telefono?: string): string {
    return [nombre, parentesco, telefono].filter(Boolean).join(' · ');
  }

  protected formatSueldoBasico(value: string): string {
    const amount = Number(value.replace(/[^\d.]/g, ''));
    if (!Number.isFinite(amount)) return 'S/ 0.00';
    return `S/ ${amount.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  protected estadoDocumento(documento: DocumentoColaborador): DocumentoColaborador['estado'] {
    if (!documento.fechaVencimiento) return documento.estado;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiration = new Date(`${documento.fechaVencimiento}T00:00:00`);
    const daysRemaining = Math.ceil((expiration.getTime() - today.getTime()) / 86400000);

    if (daysRemaining < 0) return 'Vencido';
    if (daysRemaining <= 30) return 'Por vencer';
    return 'Vigente';
  }

  protected estadoDocumentoClase(documento: DocumentoColaborador): string {
    const status = this.estadoDocumento(documento);
    return status === 'Vencido' ? 'text-rose-600 dark:text-rose-300' : status === 'Por vencer' ? 'text-amber-600 dark:text-amber-300' : 'text-emerald-600 dark:text-emerald-300';
  }

  protected documentosAdjuntos(colaborador: Colaborador): DocumentoColaborador[] {
    return colaborador.documentos.filter((documento) => Boolean(documento.archivoUrl && documento.archivoNombre));
  }

  protected openDocument(documento: DocumentoColaborador): void {
    if (!documento.archivoUrl) return;
    const isPreviewable = documento.archivoTipo === 'application/pdf'
      || documento.archivoTipo?.startsWith('image/')
      || /\.(pdf|png|jpe?g|gif|webp|bmp)$/i.test(documento.archivoNombre ?? '');

    this.colaboradoresService.downloadDocument(documento.archivoUrl).subscribe((blob) => {
      const objectUrl = URL.createObjectURL(blob);
      if (isPreviewable) {
        this.revokePreviewUrl();
        this.previewObjectUrl = objectUrl;
        this.previewDocument = { ...documento, archivoUrl: objectUrl };
        return;
      }
      window.open(objectUrl, '_blank', 'noopener,noreferrer');
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
    });
  }

  protected closeDocumentPreview(): void {
    this.previewDocument = null;
    this.revokePreviewUrl();
  }

  protected shareDocument(documento: DocumentoColaborador): void {
    if (!documento.archivoUrl) return;
    this.shareFeedback = '';
    this.sharePlatformSelection = null;
    this.shareDocumentSelection = documento;
  }

  protected closeShareModal(): void {
    this.shareDocumentSelection = null;
    this.sharePlatformSelection = null;
  }

  protected selectSharePlatform(platform: SharePlatform): void {
    this.sharePlatformSelection = platform;
  }

  protected backToSharePlatforms(): void {
    this.sharePlatformSelection = null;
  }

  protected selectedPlatformLabel(): string {
    return this.sharePlatformSelection ? this.platformLabel(this.sharePlatformSelection) : '';
  }

  protected shareViaWeb(platform: SharePlatform): void {
    const documento = this.shareDocumentSelection;
    if (!documento) return;

    const publicUrl = this.publicDocumentUrl(documento);
    const message = this.shareMessage(documento, publicUrl);
    const webUrls: Record<SharePlatform, string> = {
      whatsapp: `https://web.whatsapp.com/send?text=${encodeURIComponent(message)}`,
      messenger: 'https://www.messenger.com/',
      instagram: 'https://www.instagram.com/direct/inbox/'
    };

    const opened = window.open(webUrls[platform], `ayni-${platform}-web`);
    if (!opened) {
      this.openPlatformApp(platform, message, publicUrl);
      return;
    }
    try { opened.opener = null; } catch { /* La pestaña reutilizada puede pertenecer a otro origen. */ }
    opened.focus();

    const downloaded = !publicUrl && this.downloadDocument(documento);
    void this.copyShareMessage(message);
    this.closeShareModal();
    this.showShareFeedback(downloaded
      ? `Se abrió ${this.platformLabel(platform)} Web y se preparó el archivo para adjuntarlo.`
      : `Se abrió ${this.platformLabel(platform)} Web con los datos del documento.`);
  }

  protected shareViaApp(platform: SharePlatform): void {
    const documento = this.shareDocumentSelection;
    if (!documento) return;

    const publicUrl = this.publicDocumentUrl(documento);
    const message = this.shareMessage(documento, publicUrl);
    if (!publicUrl) this.downloadDocument(documento);
    this.openPlatformApp(platform, message, publicUrl);
    this.closeShareModal();
  }

  @HostListener('document:keydown.escape')
  protected closeShareModalWithEscape(): void {
    if (this.shareDocumentSelection) this.closeShareModal();
  }

  @HostListener('document:mouseup')
  protected finishRowSelection(): void {
    this.rowSelectionActive = false;
    this.dragStartId = null;
    window.setTimeout(() => this.ignoreNextRowAction = false, 0);
  }

  @HostListener('document:click', ['$event'])
  protected clearSelectionOutsideTable(event: MouseEvent): void {
    if (!this.selectionTable?.nativeElement.contains(event.target as Node) && this.selectedIds.size) {
      this.selectedIds.clear();
      this.emitSelectedIds();
    }
  }

  private setRowSelection(colaboradorId: string, isSelected: boolean): void {
    if (this.isSelected(colaboradorId) === isSelected) return;
    this.toggleRowSelection(colaboradorId, isSelected);
  }

  private isInteractiveTarget(target: EventTarget | null): boolean {
    return target instanceof Element && Boolean(target.closest('button, input, a, select, textarea, label, [data-no-row-selection]'));
  }

  private downloadDocument(documento: DocumentoColaborador): boolean {
    if (!documento.archivoUrl) return false;
    this.colaboradoresService.downloadDocument(documento.archivoUrl).subscribe((blob) => {
      const objectUrl = URL.createObjectURL(blob);
      const anchor = window.document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = documento.archivoNombre || documento.nombre;
      anchor.click();
      URL.revokeObjectURL(objectUrl);
    });
    return true;
  }

  private revokePreviewUrl(): void {
    if (!this.previewObjectUrl) return;
    URL.revokeObjectURL(this.previewObjectUrl);
    this.previewObjectUrl = '';
  }

  private publicDocumentUrl(documento: DocumentoColaborador): string {
    const url = documento.archivoUrl || '';
    return /^https?:\/\//i.test(url) ? url : '';
  }

  private shareMessage(documento: DocumentoColaborador, publicUrl: string): string {
    const fileName = documento.archivoNombre || documento.nombre;
    return [`Documento: ${documento.nombre}`, `Archivo: ${fileName}`, publicUrl].filter(Boolean).join('\n');
  }

  private openPlatformApp(platform: SharePlatform, message: string, publicUrl: string): void {
    const appUrls: Record<SharePlatform, string> = {
      whatsapp: `whatsapp://send?text=${encodeURIComponent(message)}`,
      messenger: publicUrl ? `fb-messenger://share/?link=${encodeURIComponent(publicUrl)}` : 'fb-messenger://',
      instagram: 'instagram://direct-inbox'
    };
    window.location.href = appUrls[platform];
  }

  private platformLabel(platform: SharePlatform): string {
    return platform === 'whatsapp' ? 'WhatsApp' : platform === 'messenger' ? 'Messenger' : 'Instagram';
  }

  private async copyShareMessage(message: string): Promise<void> {
    try {
      await navigator.clipboard?.writeText(message);
    } catch {
      // El portapapeles puede estar bloqueado por la configuración del navegador.
    }
  }

  private showShareFeedback(message: string): void {
    this.shareFeedback = message;
    window.setTimeout(() => {
      if (this.shareFeedback === message) this.shareFeedback = '';
    }, 5000);
  }
}
