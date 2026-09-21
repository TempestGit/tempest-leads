import { Router } from 'express';

import { authenticate } from '../../middleware/authenticate.js';

import {
  index,
  complete,
  reschedule,
  show,
} from './followUps.controller.js';

const router = Router();

router.use(authenticate);

router.get('/', index);
router.get('/:id', show);

router.post('/:id/complete', complete);
router.post('/:id/reschedule', reschedule);

export default router;