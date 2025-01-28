import { Request, Response } from 'express';
import TaskService from '../services/taskService';

export const getTasks = async (req: Request, res: Response): Promise<void> => {
   try {
      const userId = (req as any).user.id;
      const { status, search, page = 1, pageSize = 50, startDate, endDate } = req.query;

      const { tasks, total } = await TaskService.getTasks(userId, {
         status,
         search,
         page: Number(page),
         pageSize: Number(pageSize),
         startDate: startDate as string,
         endDate: endDate as string,
      });

      res.status(200).json({ tasks, total });
   } catch (error) {
      console.error('Error fetching tasks:', error);
      res.status(500).json({ error: 'Failed to fetch tasks' });
   }
};

export const createTask = async (req: Request, res: Response): Promise<void> => {
   try {
      const userId = (req as any).user.id;
      const taskId = await TaskService.createTask(userId, req.body);
      res.status(201).json({ id: taskId });
   } catch (error) {
      res.status(500).json({ error: 'Failed to create task: ' + error });
   }
};

export const updateTask = async (req: Request, res: Response): Promise<void> => {
   try {
      const userId = (req as any).user.id;
      const taskId = req.params.id;
      const updatedTaskData = req.body;
      if (!updatedTaskData.id) {
         res.status(400).json({ error: 'Task ID is required' });
         return;
      }
      const success = await TaskService.updateTask(userId, taskId, updatedTaskData);
      if (!success) {
         res.status(404).json({ error: 'Task not found or unauthorized' });
         return;
      }

      res.status(200).json({ message: 'Task updated successfully' });
   } catch (error) {
      res.status(500).json({ error: 'Failed to update task: ' + error });
   }
};

export const deleteTask = async (req: Request, res: Response): Promise<void> => {
   try {
      const userId = (req as any).user.id;
      const taskId = req.params.id;

      const success = await TaskService.deleteTask(userId, taskId);
      if (!success) {
         res.status(404).json({ error: 'Task not found or unauthorized' });
         return;
      }

      res.status(200).json({ message: 'Task deleted successfully' });
   } catch (error) {
      res.status(500).json({ error: 'Failed to delete task: ' + error });
   }
};
