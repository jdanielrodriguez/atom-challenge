import { Request, Response } from 'express';
import db from '../services/firebase';

export const getTasks = async (req: Request, res: Response) => {
   try {
      const tasksSnapshot = await db.collection('tasks').get();
      const tasks = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(tasks);
   } catch (error) {
      res.status(500).json({ error: 'Failed to fetch tasks' });
   }
};

export const createTask = async (req: Request, res: Response) => {
   try {
      const task = req.body;
      const newTask = await db.collection('tasks').add(task);
      res.json({ id: newTask.id });
   } catch (error) {
      res.status(500).json({ error: 'Failed to create task' });
   }
};
