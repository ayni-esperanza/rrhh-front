import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PaginatedResponse } from '../../../core/models/api.models';
import { Colaborador, ColaboradorMetric } from '../models/colaborador.model';

interface CatalogItem { id: string; nombre: string; }
interface CargoCatalogItem extends CatalogItem { areaId: string; area?: CatalogItem; }
interface ApiContrato { cargo: CatalogItem & { area: CatalogItem }; jornada: CatalogItem; tipoContrato: string; fechaInicio: string; sueldoBasico: number; }
interface ApiDocumento { id: string; nombre: string; fechaVencimiento?: string; archivoNombre: string; archivoTipo?: string; archivoUrl: string; archivoTamano?: string; }
interface ApiColaborador { id: string; dni: string; nombres: string; apellidoPaterno: string; apellidoMaterno?: string; sexo?: string; numeroHijos?: number; fechaNacimiento: string; lugarNacimiento?: string; estadoCivil?: string; gradoInstruccion?: string; tipoSangre?: string; telefono?: string; correo?: string; direccion?: string; fotoUrl?: string; epsSeguro?: string; estado: string; tallaCamisa?: string; tallaPantalon?: string; tallaCalzado?: string; contratoActual?: ApiContrato; contactosEmergencia?: Array<{ nombre: string; parentesco?: string; telefono: string }>; cuentasBancarias?: Array<{ entidadBancaria: string; numeroCuenta: string; cci?: string; principal: boolean }>; documentos?: ApiDocumento[] }
interface ApiMetrics { total: number; activos: number; inactivos: number; minutos_extras: number; asistencia_promedio: number; costo_planilla: number; }

@Injectable({ providedIn: 'root' })
export class ColaboradoresService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/colaboradores`;
  getMetrics(): Observable<ColaboradorMetric[]> {
    return this.http.get<ApiMetrics>(`${this.url}/metricas`).pipe(map((m) => [
      { label: 'Total colaboradores', value: String(m.total), detail: `Activos: ${m.activos} | Inactivos: ${m.inactivos}`, icon: 'users', tone: 'blue' },
      { label: 'Asistencia promedio (mes)', value: `${Number(m.asistencia_promedio).toFixed(1)}%`, detail: 'Periodo actual', icon: 'calendar', tone: 'purple' },
      { label: 'Horas extras (mes)', value: `${(m.minutos_extras / 60).toFixed(1)} h`, detail: 'Periodo actual', icon: 'clock', tone: 'amber' },
      { label: 'Costo de planilla (mes)', value: this.money(m.costo_planilla), detail: 'Periodo actual', icon: 'money', tone: 'emerald' }
    ] as ColaboradorMetric[]));
  }
  getColaboradores(): Observable<Colaborador[]> { return this.http.get<PaginatedResponse<ApiColaborador>>(this.url, { params: { page: 1, limit: 100 } }).pipe(map(({ data }) => data.map((x) => this.toView(x)))); }
  getColaborador(id: string): Observable<Colaborador> { return this.http.get<ApiColaborador>(`${this.url}/${id}`).pipe(map((x) => this.toView(x))); }
  saveColaborador(item: Colaborador): Observable<Colaborador> {
    return forkJoin({ areas: this.catalog<CatalogItem>('areas'), cargos: this.catalog<CargoCatalogItem>('cargos'), jornadas: this.catalog<CatalogItem>('jornadas') }).pipe(switchMap(({ areas, cargos, jornadas }) => {
      const area = areas.find((x) => x.nombre === item.area);
      const cargo = cargos.find((x) => x.nombre === item.cargo && (x.areaId === area?.id || x.area?.id === area?.id)); const jornada = jornadas.find((x) => x.nombre === item.jornada);
      if (!area || !cargo || !jornada) throw new Error('El área, cargo o jornada seleccionados no existen en el backend');
      const payload = this.toPayload(item, cargo.id, jornada.id);
      const creating = !item.id || item.id.startsWith('nuevo-');
      return (creating ? this.http.post<ApiColaborador>(this.url, payload) : this.http.patch<ApiColaborador>(`${this.url}/${item.id}`, payload)).pipe(
        switchMap((saved) => this.syncDocuments(saved.id, item.documentos).pipe(
          switchMap(() => this.getColaborador(saved.id))
        ))
      );
    }));
  }
  updateEstado(ids: ReadonlySet<string>, estado: Colaborador['estado']): Observable<void> { return this.http.patch<void>(`${this.url}/estado-lote`, { ids: [...ids], estado: estado.toUpperCase() }); }
  deleteColaboradores(ids: ReadonlySet<string>): Observable<void> { return this.http.request<void>('DELETE', `${this.url}/lote`, { body: { ids: [...ids] } }); }
  deleteColaborador(id: string): Observable<void> { return this.http.delete<void>(`${this.url}/${id}`); }
  listDocuments(id: string): Observable<ApiDocumento[]> { return this.http.get<ApiDocumento[]>(`${this.url}/${id}/documentos`); }
  createDocument(id: string, value: Omit<ApiDocumento, 'id'>): Observable<ApiDocumento> { return this.http.post<ApiDocumento>(`${this.url}/${id}/documentos`, value); }
  updateDocument(id: string, documentId: string, value: Partial<ApiDocumento>): Observable<ApiDocumento> { return this.http.patch<ApiDocumento>(`${this.url}/${id}/documentos/${documentId}`, value); }
  deleteDocument(id: string, documentId: string): Observable<void> { return this.http.delete<void>(`${this.url}/${id}/documentos/${documentId}`); }
  uploadDocument(id: string, document: Colaborador['documentos'][number]): Observable<ApiDocumento> {
    const formData = new FormData();
    formData.append('nombre', document.nombre);
    if (document.fechaVencimiento) formData.append('fechaVencimiento', this.iso(document.fechaVencimiento));
    formData.append('archivo', this.dataUrlFile(document), document.archivoNombre ?? document.nombre);
    return this.http.post<ApiDocumento>(`${this.url}/${id}/documentos/archivo`, formData);
  }
  downloadDocument(url: string): Observable<Blob> { return this.http.get(url.startsWith('http') ? url : `${environment.apiUrl.replace(/\/api$/, '')}${url}`, { responseType: 'blob' }); }
  private catalog<T extends CatalogItem>(type: string): Observable<T[]> { return this.http.get<PaginatedResponse<T>>(`${environment.apiUrl}/catalogos/${type}`, { params: { page: 1, limit: 100, activo: true } }).pipe(map((x) => x.data)); }
  private syncDocuments(id: string, documents: Colaborador['documentos']): Observable<unknown> {
    return this.listDocuments(id).pipe(switchMap((existing) => {
      const submittedIds = new Set(documents.map((document) => document.id).filter((value): value is string => Boolean(value)));
      const operations: Observable<unknown>[] = existing
        .filter((document) => !submittedIds.has(document.id))
        .map((document) => this.deleteDocument(id, document.id));

      for (const document of documents) {
        if (document.archivoUrl?.startsWith('data:')) {
          const upload = this.uploadDocument(id, document);
          operations.push(document.id
            ? this.deleteDocument(id, document.id).pipe(switchMap(() => upload))
            : upload);
        } else if (document.id) {
          operations.push(this.updateDocument(id, document.id, {
            nombre: document.nombre,
            fechaVencimiento: document.fechaVencimiento ? this.iso(document.fechaVencimiento) : undefined
          }));
        } else if (document.archivoUrl) {
          operations.push(this.createDocument(id, {
            nombre: document.nombre,
            fechaVencimiento: document.fechaVencimiento ? this.iso(document.fechaVencimiento) : undefined,
            archivoNombre: document.archivoNombre ?? document.nombre,
            archivoTipo: document.archivoTipo,
            archivoUrl: document.archivoUrl,
            archivoTamano: String(document.archivoTamano ?? 0)
          }));
        }
      }

      return operations.length ? forkJoin(operations) : of([]);
    }));
  }

  private dataUrlFile(document: Colaborador['documentos'][number]): File {
    const source = document.archivoUrl ?? '';
    const match = source.match(/^data:([^;,]+)?(?:;base64)?,(.*)$/);
    if (!match) throw new Error('El documento seleccionado no contiene un archivo válido');
    const mimeType = match[1] || document.archivoTipo || 'application/octet-stream';
    const binary = source.includes(';base64,') ? atob(match[2]) : decodeURIComponent(match[2]);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    return new File([bytes], document.archivoNombre ?? document.nombre, { type: mimeType });
  }
  private toPayload(x: Colaborador, cargoId: string, jornadaId: string) { return { dni: x.dni, nombres: x.nombre, apellidoPaterno: x.apellidoPaterno || x.apellido.split(' ')[0], apellidoMaterno: x.apellidoMaterno || x.apellido.split(' ').slice(1).join(' ') || undefined, sexo: ({ Masculino: 'MASCULINO', Femenino: 'FEMENINO', 'No binario': 'NO_BINARIO' } as Record<string, string>)[x.sexo ?? ''] || undefined, fechaNacimiento: this.iso(x.fechaNacimiento), lugarNacimiento: x.lugarNacimiento || undefined, estadoCivil: x.estadoCivil || undefined, numeroHijos: Number(x.hijos || 0), gradoInstruccion: x.gradoInstruccion || undefined, tipoSangre: x.tipoSangre || undefined, telefono: x.telefono || undefined, correo: x.correo || undefined, direccion: x.direccion || undefined, fotoUrl: x.imagen || undefined, epsSeguro: x.epsSeguro || undefined, tallas: { camisa: x.tallas.camisa || undefined, pantalon: x.tallas.pantalon || undefined, calzado: x.tallas.calzado || undefined }, estado: x.estado.toUpperCase(), contrato: { cargoId, jornadaId, tipoContrato: x.tipoContrato, fechaInicio: this.iso(x.fechaIngreso), sueldoBasico: Number(x.sueldoBasico) }, cuentasBancarias: (x.datosBancarios ?? []).map((b) => ({ entidadBancaria: b.entidadBancaria, numeroCuenta: b.cuentaBancaria, cci: b.cci || undefined, principal: Boolean(b.esPrincipal) })), contactosEmergencia: (x.contactosEmergencia ?? []).map((c, index) => ({ nombre: c.nombre, parentesco: c.parentesco || undefined, telefono: c.telefono, principal: index === 0 })) }; }
  private toView(x: ApiColaborador): Colaborador { const contract = x.contratoActual; const accounts = (x.cuentasBancarias ?? []).map((b) => ({ entidadBancaria: b.entidadBancaria, cuentaBancaria: b.numeroCuenta, cci: b.cci ?? '', esPrincipal: b.principal })); const principal = accounts.find((b) => b.esPrincipal) ?? accounts[0]; const contacts = (x.contactosEmergencia ?? []).map((contact) => ({ nombre: contact.nombre, parentesco: contact.parentesco, telefono: contact.telefono })); return { id: x.id, imagen: x.fotoUrl ?? '', nombre: x.nombres, apellido: [x.apellidoPaterno, x.apellidoMaterno].filter(Boolean).join(' '), apellidoPaterno: x.apellidoPaterno, apellidoMaterno: x.apellidoMaterno, dni: x.dni, sexo: ({ MASCULINO: 'Masculino', FEMENINO: 'Femenino', NO_BINARIO: 'No binario' } as Record<string, Colaborador['sexo']>)[x.sexo ?? ''], hijos: String(x.numeroHijos ?? 0), cargo: contract?.cargo?.nombre ?? '', area: contract?.cargo?.area?.nombre ?? '', telefono: x.telefono ?? '', telefonoEmergencia: contacts[0]?.telefono ?? '', contactosEmergencia: contacts, estadoCivil: x.estadoCivil ?? '', tallas: { camisa: x.tallaCamisa ?? '', pantalon: x.tallaPantalon ?? '', calzado: x.tallaCalzado ?? '' }, estado: x.estado === 'ACTIVO' ? 'Activo' : 'Inactivo', fechaNacimiento: this.displayDate(x.fechaNacimiento), direccion: x.direccion ?? '', correo: x.correo ?? '', fechaIngreso: this.displayDate(contract?.fechaInicio ?? ''), tipoContrato: contract?.tipoContrato ?? '', jornada: contract?.jornada?.nombre ?? '', sueldoBasico: String(contract?.sueldoBasico ?? ''), gradoInstruccion: x.gradoInstruccion ?? '', lugarNacimiento: x.lugarNacimiento ?? '', tipoSangre: x.tipoSangre ?? '', cuentaBancaria: principal?.cuentaBancaria ?? '', cci: principal?.cci ?? '', entidadBancaria: principal?.entidadBancaria ?? '', datosBancarios: accounts, epsSeguro: x.epsSeguro ?? '', contactoEmergencia: contacts[0] ? `${contacts[0].nombre} - ${contacts[0].telefono}` : '', documentos: (x.documentos ?? []).map((d) => ({ id: d.id, nombre: d.nombre, archivoNombre: d.archivoNombre, archivoTipo: d.archivoTipo, archivoUrl: d.archivoUrl, archivoTamano: Number(d.archivoTamano ?? 0), fechaVencimiento: d.fechaVencimiento, estado: this.documentStatus(d.fechaVencimiento) })) }; }
  private iso(value: string): string { if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value; const [d, m, y] = value.split('/'); return y && m && d ? `${y}-${m}-${d}` : value; }
  private displayDate(value: string): string { if (!value) return ''; const [y, m, d] = value.slice(0, 10).split('-'); return `${d}/${m}/${y}`; }
  private documentStatus(value?: string): 'Vigente' | 'Por vencer' | 'Vencido' { if (!value) return 'Vigente'; const days = (new Date(value).getTime() - Date.now()) / 86400000; return days < 0 ? 'Vencido' : days <= 30 ? 'Por vencer' : 'Vigente'; }
  private money(value: number): string { return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(Number(value) || 0); }
}
