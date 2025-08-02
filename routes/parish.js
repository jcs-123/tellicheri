// backend/routes/parishes.js
import express from 'express';
import { Parishes, Priests } from '../models/importModels.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const parishes = await Parishes.find();

    const enrichedParishes = await Promise.all(
      parishes.map(async (parish) => {
        let vicarName = '';
        if (parish.vicar_id) {
          const priest = await Priests.findById(parish.vicar_id);
          if (priest) {
            vicarName = priest.name_title + ' ' + priest.name;
          }
        }

        let foraneName = '';
        const forane = await Parishes.findById(parish.forane_id);
        if (forane) {
          foraneName = forane.name;
        }

        return {
          _id: parish._id,
          name: parish.name,
          place: parish.place,
          type: parish.type,
          status: parish.status,
          forane: foraneName,
          vicar: vicarName,
        };
      })
    );

    res.json(enrichedParishes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
