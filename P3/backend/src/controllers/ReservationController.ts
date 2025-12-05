import { Request, Response } from 'express';
import Reservation from '../models/Reservation';
import Table from '../models/Table';

export const createReservation = async (req: Request, res: Response) => {
  try {
    const { clientName, clientContact, tableNumber, pax, startTime, notes } = req.body;
    
    const start = new Date(startTime);
    const duration = 90;
    const end = new Date(start.getTime() + duration * 60000);
    const now = new Date();

    if (start.getTime() < now.getTime() + 60 * 60 * 1000) {
      return res.status(400).json({ message: 'Erro: A reserva deve ser feita com 1h de antecedência.' });
    }

    const table = await Table.findOne({ number: tableNumber });
    if (!table) return res.status(404).json({ message: 'Mesa não encontrada.' });
    
    if (pax > table.capacity) {
      return res.status(400).json({ message: `Erro: A Mesa ${tableNumber} só comporta ${table.capacity} pessoas.` });
    }

    const conflict = await Reservation.findOne({
      tableNumber,
      status: { $in: ['reservado', 'ocupado'] },
      startTime: { $lt: end }
    });

    if (conflict) {
       const conflictEnd = new Date(conflict.startTime.getTime() + conflict.durationMinutes * 60000);
       if (conflictEnd > start) {
           return res.status(400).json({ message: 'Erro: Mesa indisponível neste horário.' });
       }
    }

    const reservation = await Reservation.create({
      clientName, clientContact, tableNumber, pax, startTime: start, durationMinutes: duration, notes
    });

    return res.status(201).json({ message: 'Reserva criada com sucesso!', reservation });

  } catch (error) {
    return res.status(500).json({ message: 'Erro interno ao criar reserva.' });
  }
};

export const listReservations = async (req: Request, res: Response) => {
  try {
    const reservations = await Reservation.find({ status: { $ne: 'cancelado' } }).sort({ startTime: 1 });
    return res.json(reservations);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao listar.' });
  }
};

export const updateReservation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await Reservation.findByIdAndUpdate(id, req.body);
    return res.json({ message: 'Reserva atualizada com sucesso!' });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao atualizar.' });
  }
};

export const cancelReservation = async (req: Request, res: Response) => {
  await Reservation.findByIdAndUpdate(req.params.id, { status: 'cancelado' });
  return res.json({ message: 'Reserva cancelada.' });
};