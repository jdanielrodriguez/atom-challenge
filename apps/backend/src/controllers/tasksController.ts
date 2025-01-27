import { Request, Response } from 'express';
import FirebaseService from '../services/firebaseService';
import { Task } from '../interfaces/task.interface';

export const getTasks = async (req: Request, res: Response): Promise<void> => {
   try {
      const db = FirebaseService.getFirestore();
      const userId = (req as any).user.id;

      const { status, search, page = 1, pageSize = 50, startDate, endDate } = req.query;

      let query = db.collection('tasks')
         .where('userId', '==', userId)
         .orderBy('createdAt', 'desc');

      if (status) {
         query = query.where('status', '==', status);
      }

      if (search) {
         query = query.where('title', '>=', search).where('title', '<=', search + '\uf8ff');
      }

      if (startDate && endDate) {
         const { start, end } = FirebaseService.formatDateRangeToTimestamps(
            startDate as string,
            endDate as string
         );

         query = query.where('createdAt', '>=', start.toMillis()).where('createdAt', '<=', end.toMillis());
      }


      const snapshot = await query.get();

      const tasks = snapshot.docs.map((doc) => ({
         id: doc.id,
         ...doc.data(),
      })) as Task[];

      const total = tasks.length;
      const paginatedTasks = tasks.slice((+page - 1) * +pageSize, +page * +pageSize);

      res.status(200).json({ tasks: paginatedTasks, total });
   } catch (error) {
      console.error('Error fetching tasks:', error);
      res.status(500).json({ error: 'Failed to fetch tasks' });
   }
};

export const createTask = async (req: Request, res: Response): Promise<void> => {
   try {
      const db = FirebaseService.getFirestore();
      const userId = (req as any).user.id;
      const task: Task = {
         ...req.body,
         createdAt: FirebaseService.formatTimestamp(new Date()),
         completed: false,
         userId,
      };

      const newTask = await db.collection('tasks').add(task);

      res.status(201).json({ id: newTask.id });
   } catch (error) {
      res.status(500).json({ error: 'Failed to create task' + error });
   }
};

export const updateTask = async (req: Request, res: Response): Promise<void> => {
   try {
      const db = FirebaseService.getFirestore();
      const userId = (req as any).user.id;
      const taskId = req.params.id;
      const { id, ...updatedTaskData } = req.body;

      if (!id) {
         res.status(400).json({ error: 'Task ID is required' });
         return;
      }

      const taskRef = db.collection('tasks').doc(taskId);
      const taskSnapshot = await taskRef.get();

      if (!taskSnapshot.exists) {
         res.status(404).json({ error: 'Task not found' });
         return;
      }

      const task = taskSnapshot.data();
      if (task?.userId !== userId) {
         res.status(403).json({ error: 'Unauthorized to update this task' });
         return;
      }

      await taskRef.update({
         ...updatedTaskData,
         updatedAt: new Date(),
      });

      res.status(200).json({ message: 'Task updated successfully' });
   } catch (error) {
      res.status(500).json({ error: 'Failed to update task: ' + error });
   }
};

export const deleteTask = async (req: Request, res: Response): Promise<void> => {
   try {
      const db = FirebaseService.getFirestore();
      const userId = (req as any).user.id;
      const taskId = req.params.id;

      const taskRef = db.collection('tasks').doc(taskId);
      const taskSnapshot = await taskRef.get();

      if (!taskSnapshot.exists) {
         res.status(404).json({ error: 'Task not found' });
         return;
      }

      const task = taskSnapshot.data();
      if (task?.userId !== userId) {
         res.status(403).json({ error: 'Unauthorized to delete this task' });
         return;
      }

      await taskRef.delete();
      res.status(200).json({ message: 'Task deleted successfully' });
   } catch (error) {
      res.status(500).json({ error: 'Failed to delete task: ' + error });
   }
};

