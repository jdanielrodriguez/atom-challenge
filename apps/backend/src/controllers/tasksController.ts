import { Request, Response } from 'express';
import FirebaseService from '../services/firebaseService';

export const getTasks = async (req: Request, res: Response): Promise<void> => {
   try {
      const db = FirebaseService.getFirestore();
      const tasksSnapshot = await db.collection('tasks').get();
      const tasks = tasksSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      res.status(200).json(tasks);
   } catch (error) {
      res.status(500).json({ error: 'Failed to fetch tasks' + error });
   }
};

export const createTask = async (req: Request, res: Response): Promise<void> => {
   try {
      const db = FirebaseService.getFirestore();
      const task = req.body;

      const newTask = await db.collection('tasks').add(task);

      res.status(201).json({ id: newTask.id });
   } catch (error) {
      res.status(500).json({ error: 'Failed to create task' + error });
   }
};
