import { Schema, model, Document } from 'mongoose';

export interface ITable extends Document {
  number: number;
  capacity: number; 
  location: string; 
}

const TableSchema = new Schema<ITable>({
  number: { type: Number, required: true, unique: true }, 
  capacity: { type: Number, required: true, min: 1 },   
  location: { type: String, required: true },         
});

export default model<ITable>('Table', TableSchema);