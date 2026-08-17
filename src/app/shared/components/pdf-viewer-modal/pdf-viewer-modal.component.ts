import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild } from '@angular/core';
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist';
import type { PDFDocumentLoadingTask, PDFDocumentProxy, RenderTask } from 'pdfjs-dist';

GlobalWorkerOptions.workerSrc = 'assets/pdfjs/pdf.worker.min.mjs?v=4.10.38';

@Component({
  selector: 'app-pdf-viewer-modal',
  templateUrl: './pdf-viewer-modal.component.html',
  styleUrl: './pdf-viewer-modal.component.css'
})
export class PdfViewerModalComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('pdfCanvas') private canvasRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('viewerContainer') private viewerContainer?: ElementRef<HTMLElement>;

  @Input({ required: true }) src = '';
  @Input() fileName = 'Documento PDF';
  @Output() closeModal = new EventEmitter<void>();

  protected currentPage = 1;
  protected totalPages = 0;
  protected zoom = 1;
  protected isLoading = true;
  protected errorMessage = '';
  protected searchQuery = '';
  protected searchMessage = '';

  protected get zoomPercent(): number {
    return Math.round(this.zoom * 100);
  }

  private pdf?: PDFDocumentProxy;
  private loadingTask?: PDFDocumentLoadingTask;
  private renderTask?: RenderTask;
  private viewInitialized = false;
  private loadVersion = 0;

  ngAfterViewInit(): void {
    this.viewInitialized = true;
    void this.loadPdf();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['src'] && !changes['src'].firstChange && this.viewInitialized) void this.loadPdf();
  }

  ngOnDestroy(): void {
    this.renderTask?.cancel();
    void this.loadingTask?.destroy();
  }

  @HostListener('document:keydown.escape')
  protected closeOnEscape(): void {
    this.closeModal.emit();
  }

  protected previousPage(): void {
    if (this.currentPage <= 1) return;
    this.currentPage--;
    void this.renderPage();
  }

  protected nextPage(): void {
    if (this.currentPage >= this.totalPages) return;
    this.currentPage++;
    void this.renderPage();
  }

  protected setPage(rawValue: string): void {
    const page = Math.min(this.totalPages, Math.max(1, Number(rawValue) || 1));
    if (page === this.currentPage) return;
    this.currentPage = page;
    void this.renderPage();
  }

  protected zoomIn(): void {
    this.zoom = Math.min(3, Number((this.zoom + 0.2).toFixed(1)));
    void this.renderPage();
  }

  protected zoomOut(): void {
    this.zoom = Math.max(0.4, Number((this.zoom - 0.2).toFixed(1)));
    void this.renderPage();
  }

  protected async fitWidth(): Promise<void> {
    if (!this.pdf || !this.viewerContainer) return;
    const page = await this.pdf.getPage(this.currentPage);
    const viewport = page.getViewport({ scale: 1 });
    const availableWidth = Math.max(240, this.viewerContainer.nativeElement.clientWidth - 32);
    this.zoom = Math.min(3, Math.max(0.4, availableWidth / viewport.width));
    await this.renderPage();
  }

  protected async findNext(): Promise<void> {
    const query = this.normalizeText(this.searchQuery);
    if (!this.pdf || !query) {
      this.searchMessage = '';
      return;
    }

    this.searchMessage = 'Buscando…';
    for (let offset = 1; offset <= this.totalPages; offset++) {
      const pageNumber = ((this.currentPage - 1 + offset) % this.totalPages) + 1;
      const page = await this.pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      const pageText = content.items.map((item) => ('str' in item ? item.str : '')).join(' ');

      if (this.normalizeText(pageText).includes(query)) {
        this.currentPage = pageNumber;
        this.searchMessage = `Coincidencia en la página ${pageNumber}`;
        await this.renderPage();
        return;
      }
    }

    this.searchMessage = 'No se encontraron coincidencias';
  }

  protected download(): void {
    const anchor = document.createElement('a');
    anchor.href = this.src;
    anchor.download = this.fileName;
    anchor.click();
  }

  protected print(): void {
    const frame = document.createElement('iframe');
    frame.className = 'fixed h-0 w-0 opacity-0';
    frame.src = this.src;
    frame.onload = () => {
      frame.contentWindow?.print();
      window.setTimeout(() => frame.remove(), 1000);
    };
    document.body.appendChild(frame);
  }

  private async loadPdf(): Promise<void> {
    if (!this.src) return;
    const version = ++this.loadVersion;
    this.isLoading = true;
    this.errorMessage = '';
    this.searchMessage = '';

    try {
      this.renderTask?.cancel();
      await this.loadingTask?.destroy();
      const loadingTask = getDocument({ url: this.src });
      this.loadingTask = loadingTask;
      const pdf = await loadingTask.promise;
      if (version !== this.loadVersion) {
        await loadingTask.destroy();
        return;
      }

      this.pdf = pdf;
      this.totalPages = pdf.numPages;
      this.currentPage = 1;
      await this.fitWidth();
    } catch (error) {
      console.error('No se pudo cargar el PDF.', error);
      this.errorMessage = 'No se pudo mostrar el documento PDF.';
    } finally {
      if (version === this.loadVersion) this.isLoading = false;
    }
  }

  private async renderPage(): Promise<void> {
    if (!this.pdf || !this.canvasRef) return;

    this.renderTask?.cancel();
    const page = await this.pdf.getPage(this.currentPage);
    const viewport = page.getViewport({ scale: this.zoom });
    const canvas = this.canvasRef.nativeElement;
    const context = canvas.getContext('2d');
    if (!context) return;

    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = Math.floor(viewport.width * pixelRatio);
    canvas.height = Math.floor(viewport.height * pixelRatio);
    canvas.style.width = `${Math.floor(viewport.width)}px`;
    canvas.style.height = `${Math.floor(viewport.height)}px`;

    this.renderTask = page.render({
      canvasContext: context,
      viewport,
      transform: pixelRatio === 1 ? undefined : [pixelRatio, 0, 0, pixelRatio, 0, 0]
    });

    try {
      await this.renderTask.promise;
    } catch (error) {
      if (!(error instanceof Error) || error.name !== 'RenderingCancelledException') throw error;
    }
  }

  private normalizeText(value: string): string {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es');
  }
}
