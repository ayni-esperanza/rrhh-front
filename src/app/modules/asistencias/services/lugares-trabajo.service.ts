import { Injectable } from '@angular/core';

export interface LugarTrabajo {
  id: string;
  nombre: string;
  color: string;
  locked?: boolean;
}

@Injectable({ providedIn: 'root' })
export class LugaresTrabajoService {
  private lugares: LugarTrabajo[] = [
    { id: 'planta-principal', nombre: 'Planta Principal - Linea de Produccion', color: '#2563eb' },
    { id: 'oficina-principal', nombre: 'Oficina Principal', color: '#3b82f6' },
    { id: 'sucursal-norte', nombre: 'Sucursal Norte', color: '#10b981' },
    { id: 'sucursal-sur', nombre: 'Sucursal Sur', color: '#f97316' },
    { id: 'remoto', nombre: 'Remoto', color: '#a855f7' },
    { id: 'sin-registro', nombre: 'Sin registro', color: '#94a3b8', locked: true }
  ];

  getLugares(): LugarTrabajo[] {
    return [...this.lugares];
  }

  getOpciones(): string[] {
    return this.lugares.map((lugar) => lugar.nombre);
  }

  findByName(nombre: string): LugarTrabajo {
    return this.lugares.find((lugar) => lugar.nombre === nombre) ?? this.lugares[this.lugares.length - 1];
  }

  addLugar(nombre: string, color: string): void {
    const cleanName = nombre.trim();
    if (!cleanName) return;

    this.lugares = [
      ...this.lugares.filter((lugar) => lugar.nombre.toLowerCase() !== cleanName.toLowerCase()),
      { id: this.createId(cleanName), nombre: cleanName, color }
    ];
  }

  updateLugar(id: string, nombre: string, color: string): void {
    const cleanName = nombre.trim();
    if (!cleanName) return;

    this.lugares = this.lugares.map((lugar) =>
      lugar.id === id && !lugar.locked ? { ...lugar, nombre: cleanName, color } : lugar
    );
  }

  removeLugar(id: string): void {
    this.lugares = this.lugares.filter((lugar) => lugar.id !== id || lugar.locked);
  }

  private createId(nombre: string): string {
    const base = nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const existingIds = new Set(this.lugares.map((lugar) => lugar.id));
    let id = base || 'lugar';
    let suffix = 2;
    while (existingIds.has(id)) {
      id = `${base}-${suffix}`;
      suffix += 1;
    }
    return id;
  }
}
