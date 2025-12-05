import { Request, Response } from 'express';
import Table from '../models/Table';

export const createTable = async (req: Request, res: Response) => {
  try {
    const { number, capacity, location } = req.body;
    const table = await Table.create({ number, capacity, location });
    return res.status(201).json(table);
  } catch (error) {
    return res.status(400).json({ message: 'Erro: Número da mesa já existe ou dados inválidos.' });
  }
};

export const listTables = async (req: Request, res: Response) => {
  const tables = await Table.find().sort({ number: 1 });
  return res.json(tables);
};

export const initTables = async (req: Request, res: Response) => {
  await Table.deleteMany({});
  await Table.insertMany([
    { number: 1, capacity: 2, location: 'Janela' },
    { number: 2, capacity: 4, location: 'Centro' },
    { number: 3, capacity: 4, location: 'Centro' },
    { number: 4, capacity: 6, location: 'Varanda' },
    { number: 5, capacity: 8, location: 'VIP' }
  ]);
  return res.json({ message: 'Mesas padrão criadas!' });
};