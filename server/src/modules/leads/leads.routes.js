import { Router } from 'express';

import { authenticate } from '../../middleware/authenticate.js';

import {
  index,
  create,
  show,
  owners,
} from './leads.controller.js';

const router = Router();

router.use(authenticate);

// Static routes must come before /:id.
router.get('/owners', owners);

router.get('/', index);
router.post('/', create);
router.get('/:id', show);

export default router;