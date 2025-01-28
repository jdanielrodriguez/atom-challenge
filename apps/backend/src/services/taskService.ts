import FirebaseService from './firebaseService';
import { Task, TaskStatus } from '../interfaces/task.interface';

class TaskService {
  static async getTasks(userId: string, filters: any): Promise<{ tasks: Task[]; total: number }> {
    const db = FirebaseService.getFirestore();
    let query = db.collection('tasks')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc');

    if (filters.status) {
      query = query.where('status', '==', filters.status);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      query = query
        .where('titleLower', '>=', searchLower)
        .where('titleLower', '<=', searchLower + '\uf8ff');
    }

    if (filters.startDate && filters.endDate) {
      const { start, end } = FirebaseService.formatDateRangeToTimestamps(filters.startDate, filters.endDate);
      query = query.where('createdAt', '>=', start).where('createdAt', '<=', end);
    }

    const snapshot = await query.get();
    const tasks = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Task[];

    const total = tasks.length;
    const paginatedTasks = tasks.slice((filters.page - 1) * filters.pageSize, filters.page * filters.pageSize);

    return { tasks: paginatedTasks, total };
  }

  static async createTask(userId: string, taskData: Partial<Task>): Promise<string> {
    const db = FirebaseService.getFirestore();
    const task: Task = {
      ...taskData,
      title: taskData.title || 'Sin título',
      titleLower: taskData.title? taskData.title.toLowerCase() : '',
      description: taskData.description || 'Sin descripción',
      createdAt: FirebaseService.formatTimestamp(new Date()),
      completed: false,
      userId,
      status: taskData.status || TaskStatus.Creado
    };

    const newTask = await db.collection('tasks').add(task);
    return newTask.id;
  }

  static async updateTask(userId: string, taskId: string, updatedTaskData: Partial<Task>): Promise<boolean> {
    const db = FirebaseService.getFirestore();
    const taskRef = db.collection('tasks').doc(taskId);
    const taskSnapshot = await taskRef.get();

    if (!taskSnapshot.exists) {
      return false;
    }

    const task = taskSnapshot.data();
    if (task?.userId !== userId) {
      return false;
    }

    const { createdAt, ...updatedData } = updatedTaskData;
    await taskRef.update({
      ...updatedData,
      titleLower: updatedTaskData.title? updatedTaskData.title.toLowerCase() : '',
      updatedAt: FirebaseService.formatTimestamp(new Date()),
    });

    return true;
  }

  static async deleteTask(userId: string, taskId: string): Promise<boolean> {
    const db = FirebaseService.getFirestore();
    const taskRef = db.collection('tasks').doc(taskId);
    const taskSnapshot = await taskRef.get();

    if (!taskSnapshot.exists) {
      return false;
    }

    const task = taskSnapshot.data();
    if (task?.userId !== userId) {
      return false;
    }

    await taskRef.delete();
    return true;
  }
}

export default TaskService;
