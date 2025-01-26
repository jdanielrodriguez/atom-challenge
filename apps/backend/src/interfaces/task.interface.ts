export interface Task {
   id?: string;
   title: string;
   description: string;
   createdAt: Date;
   completed: boolean;
   status: TaskStatus;
}
export enum TaskStatus {
   Creado = 'Creado',
   EnProceso = 'En proceso',
   EnPruebas = 'En pruebas',
   Completado = 'Completado',
}
