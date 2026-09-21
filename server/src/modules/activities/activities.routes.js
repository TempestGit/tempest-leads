import { Router } from 'express';

import { authenticate } from '../../middleware/authenticate.js';

import {
  index,
  create,
  show,
} from './activities.controller.js';

const router = Router();

router.use(authenticate);

router.get('/', index);
router.post('/', create);
router.get('/:id', show);

export default router;