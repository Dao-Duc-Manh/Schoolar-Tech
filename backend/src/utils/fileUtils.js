const cron = require('cron');
const fs = require('fs').promises;
const path = require('path');
const Document = require('../models/Document');
const logger = require('./logger');
const sequelize = require('../config/database');

// Cleanup orphans daily at 2AM
const cleanupOrphans = cron.CronJob.from({
  cronTime: '0 2 * * *',
  onTick: async () => {
    try {
      logger.info('Starting orphan file cleanup');
      
      const orphans = await Document.findAll({
        where: {
          filePath: {
            [sequelize.Op.not]: null
          }
        }
      });

      let deletedCount = 0;
      for (const doc of orphans) {
        try {
          await fs.access(doc.filePath);
        } catch {
          await doc.destroy();
          deletedCount++;
        }
      }

      logger.info(`Orphan cleanup complete: ${deletedCount} documents deleted`);
    } catch (error) {
      logger.error(`Cleanup error:`, error);
    }
  },
  runOnInit: false,
  start: true,
});

module.exports = { cleanupOrphans };
