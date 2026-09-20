import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { index, create } from './contacts.controller.js';

const router = Router();

router.use(authenticate);

router.get('/', index);
router.post('/', create);

export default router;