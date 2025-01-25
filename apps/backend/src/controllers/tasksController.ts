import { Request, Response } from 'express';
import FirebaseService from '../services/firebaseService';
import { Task } from '../interfaces/task.interface';

export const getTasks = async (req: Request, res: Response): Promise<void> => {
   try {
      const db = FirebaseService.getFirestore();
      const userId = (req as any).user.id;
      const userTasksSnapshot = await db.collection('tasks').where('userId', '==', userId).get();

      const tasks = userTasksSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      res.status(200).json(tasks);
   } catch (error) {
      res.status(500).json({ error: 'Failed to fetch tasks' + error });
   }
};

export const createTask = async (req: Request, res: Response): Promise<void> => {
   try {
      const db = FirebaseService.getFirestore();
      const userId = (req as any).user.id;
      const task: Task = {
         ...req.body,
         createdAt: new Date(),
         completed: false,
         userId
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
      const updatedTaskData = req.body;

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

