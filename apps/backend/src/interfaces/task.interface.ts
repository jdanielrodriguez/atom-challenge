import * as admin from 'firebase-admin';
export interface Task {
   id?: string;
   title?: string;
   description?: string;
   createdAt: Date | admin.firestore.Timestamp;
   updatedAt?: Date | admin.firestore.Timestamp;
   completed: boolean;
   userId: string;
   status: TaskStatus;
}
export enum TaskStatus {
   Creado = 'Creado',
   EnProceso = 'En proceso',
   EnPruebas = 'En pruebas',
   Completado = 'Completado',
}
