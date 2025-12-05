import { Schema, model, Document } from 'mongoose';

export type ReservationStatus = 'reservado' | 'ocupado' | 'finalizado' | 'cancelado';

export interface IReservation extends Document {
  clientName: string;      
  clientContact: string;   
  tableNumber: number;   
  pax: number;           
  startTime: Date;         
  durationMinutes: number; 
  notes?: string;         
  status: ReservationStatus; 
}

const ReservationSchema = new Schema<IReservation>({
  clientName: { type: String, required: true },
  clientContact: { type: String, required: true },
  tableNumber: { type: Number, required: true, ref: 'Table' },
  pax: { type: Number, required: true, min: 1 },
  startTime: { type: Date, required: true },
  durationMinutes: { type: Number, default: 90 }, 
  notes: { type: String },
  status: { 
    type: String, 
    enum: ['reservado', 'ocupado', 'finalizado', 'cancelado'], 
    default: 'reservado',
    required: true 
  },
}, { timestamps: true });

export default model<IReservation>('Reservation', ReservationSchema);