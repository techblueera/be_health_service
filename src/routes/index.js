import express from 'express';

import helloRouter from './hello.route.js';
import catalogAggregationRouter from './catalogAggregation.routes.js';
import catalogNodeRouter from './catalogNode.routes.js';
import offeringRouter from './offering.routes.js';
import packageRouter from './package.routes.js';
import moduleRouter from './module.routes.js';
import locationRouter from './location.routes.js';

const router = express.Router();

router.use('/hello', helloRouter);
router.use('/catalog', catalogAggregationRouter);
router.use('/catalog-nodes', catalogNodeRouter);
router.use('/offerings', offeringRouter);
router.use('/packages', packageRouter);
router.use('/modules', moduleRouter);
router.use('/locations', locationRouter);

export default router;
