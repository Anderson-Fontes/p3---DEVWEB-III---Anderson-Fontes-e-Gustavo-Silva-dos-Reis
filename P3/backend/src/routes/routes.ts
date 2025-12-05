import { Router } from 'express';
import { createReservation, listReservations, updateReservation, cancelReservation } from '../controllers/ReservationController';
import { listTables, initTables, createTable } from '../controllers/TableController';

const router = Router();

router.get('/tables', listTables);
router.post('/tables', createTable); 
router.post('/tables/init', initTables);

router.post('/reservations', createReservation);
router.get('/reservations', listReservations);
router.put('/reservations/:id', updateReservation);
router.delete('/reservations/:id', cancelReservation);

export default router;