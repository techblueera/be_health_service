import Module from '../models/module.model.js';
import logger from '../utils/appLogger.js';

const seedModules = async (modules) => {
  logger.info('🌱 Seeding modules...', 'ModuleSeeder');

  for (const moduleData of modules) {
    if (!moduleData.code) {
      throw new Error(`Invalid module entry: ${JSON.stringify(moduleData)}`);
    }

    const { code } = moduleData;

    const result = await Module.updateOne(
      { code },
      { $set: moduleData },
      { upsert: true }
    );

    if (result.upsertedCount > 0) {
      logger.info(`Created module: ${code}`, 'ModuleSeeder');
    } else {
      logger.info(`Updated module: ${code}`, 'ModuleSeeder');
    }
  }

  logger.info('✅ Module seeding completed.', 'ModuleSeeder');
};

export default seedModules;
