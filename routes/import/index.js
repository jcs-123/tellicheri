import express from 'express';
import parishRoutes from './parishRoutes.js';
import priestRoutes from './priestRoutes.js';
import priestOthersRoutes from './priestOthersRoutes.js';
import administrationRoutes from './administrationRoutes.js';
import institutionRoutes from './institutionRoutes.js';
import foraneRoutes from './foraneRoutes.js';


const router = express.Router();

// Test endpoint
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'Import API is working!',
        timestamp: new Date().toISOString()
    });
});

router.post('/test', (req, res) => {
    res.json({
        success: true,
        message: 'POST request received!',
        data: req.body,
        timestamp: new Date().toISOString()
    });
});

// Mount all route modules
router.use('/', parishRoutes);
router.use('/', priestRoutes);
router.use('/', priestOthersRoutes);
router.use('/', administrationRoutes);
router.use('/', institutionRoutes);
router.use('/', foraneRoutes);


export default router;