import express from 'express';

import helloRouter from './hello.route.js';
import catalogNodeRouter from './catalogNode.routes.js';
import moduleRouter from './module.routes.js';

const router = express.Router();

router.use('/hello', helloRouter);
router.use('/catalog-nodes', catalogNodeRouter);
router.use('/modules', moduleRouter);

export default router;
