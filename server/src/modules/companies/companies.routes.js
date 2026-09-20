import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import {
  index,
  create,
  show,
  update,
} from './companies.controller.js';

const router = Router();

router.use(authenticate);

router.get('/', index);
router.post('/', create);
router.get('/:id', show);
router.put('/:id', update);

export default router;