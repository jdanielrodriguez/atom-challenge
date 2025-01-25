export interface Task {
  id?: string;
  title: string;
  description: string;
  createdAt: {
    _nanoseconds: number;
    _seconds: number;
  } | Date;
  completed: boolean;
}
