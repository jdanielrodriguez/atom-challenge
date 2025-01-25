export interface Task {
  id?: string;
  title: string;
  description: string;
  createdAt: {
    _nanoseconds: number;
    _seconds: number;
  } | Date;
  completed: boolean;
  status: TaskStatus;
}
export enum TaskStatus {
  Creado = 'Creado',
  EnProceso = 'En proceso',
  EnPruebas = 'En pruebas',
  Completado = 'Completado',
}
