import { Injectable } from '@angular/core';

export type ExportCell = string | number | boolean | null | undefined;

export interface ExportColumn {
  key: string;
  header: string;
}

export interface ExportTable {
  title: string;
  fileName: string;
  sheetName?: string;
  columns: ExportColumn[];
  rows: Array<Record<string, ExportCell>>;
  pdfSections?: ExportPdfSection[];
}

export interface ExportPdfSection {
  title?: string;
  columns: ExportColumn[];
  rows: Array<Record<string, ExportCell>>;
}

@Injectable({ providedIn: 'root' })
export class TableExportService {
  async toExcel(table: ExportTable): Promise<void> {
    const { Workbook } = await import('exceljs');
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet(this.safeSheetName(table.sheetName || table.title));
    worksheet.columns = table.columns.map((column) => ({ header: column.header, key: column.key, width: Math.max(column.header.length + 2, 14) }));
    table.rows.forEach((row) => worksheet.addRow(Object.fromEntries(table.columns.map((column) => [column.key, row[column.key] ?? '']))));
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF22C55E' } };
    worksheet.views = [{ state: 'frozen', ySplit: 1 }];
    worksheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: Math.max(1, worksheet.rowCount), column: table.columns.length } };
    const buffer = await workbook.xlsx.writeBuffer();
    const url = URL.createObjectURL(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${this.safeFileName(table.fileName)}.xlsx`;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async toPdf(table: ExportTable): Promise<void> {
    const [{ jsPDF }, { default: autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')]);
    const sections = table.pdfSections?.length ? table.pdfSections : [{ columns: table.columns, rows: table.rows }];
    const landscape = Math.max(...sections.map((section) => section.columns.length)) > 6;
    const document = new jsPDF({ orientation: landscape ? 'landscape' : 'portrait', unit: 'pt', format: 'a4' });
    const generatedAt = new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date());

    sections.forEach((section, sectionIndex) => {
      if (sectionIndex) document.addPage();
      document.setTextColor(0);
      document.setFontSize(14);
      document.text(table.title, 40, 36);
      document.setFontSize(8);
      document.setTextColor(100);
      document.text(`Generado: ${generatedAt}`, 40, 51);
      if (section.title) {
        document.setFontSize(9);
        document.setTextColor(51, 65, 85);
        document.text(section.title, 40, 66);
      }

      autoTable(document, {
        startY: section.title ? 76 : 62,
        head: [section.columns.map((column) => column.header)],
        body: section.rows.map((row) => section.columns.map((column) => String(row[column.key] ?? ''))),
        styles: { fontSize: section.columns.length > 10 ? 6 : 8, cellPadding: 3, overflow: 'linebreak', valign: 'middle' },
        headStyles: { fillColor: [34, 197, 94], textColor: 255, halign: 'center', valign: 'middle' },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: table.pdfSections?.length ? this.pdfColumnStyles(section.columns) : {},
        margin: { left: 30, right: 30 }
      });
    });
    document.save(`${this.safeFileName(table.fileName)}.pdf`);
  }

  private pdfColumnStyles(columns: ExportColumn[]): Record<number, { cellWidth?: number; halign?: 'left' | 'center' | 'right' }> {
    return Object.fromEntries(columns.map((column, index) => {
      if (column.key === 'colaborador') return [index, { cellWidth: 90, halign: 'left' as const }];
      if (column.key === 'cargo') return [index, { cellWidth: 65, halign: 'left' as const }];
      if (column.key === 'total') return [index, { cellWidth: 55, halign: 'center' as const }];
      return [index, { halign: 'center' as const }];
    }));
  }

  private safeFileName(value: string): string {
    return value.trim().replace(/[^a-z0-9áéíóúñü_-]+/gi, '-').replace(/^-+|-+$/g, '') || 'reporte';
  }

  private safeSheetName(value: string): string {
    return value.replace(/[\\/?*\[\]:]/g, '').slice(0, 31) || 'Datos';
  }
}
