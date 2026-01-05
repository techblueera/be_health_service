import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

import seedModules from './module.seeder.js';
import seedCatalogNodes from './catalogNode.seeder.js';

const runSeed = async () => {
  // await mongoose.connect(process.env.MONGO_URI_HEALTH_CARE_SERVICE); 
  await mongoose.connect('mongodb+srv://user:gBRn8BztnvLcMatV@healthcare-service.xhpng05.mongodb.net/?appName=HealthCare-service')

  const modules = JSON.parse(
    fs.readFileSync('src/seeders/seed-data/modules.json', 'utf-8')
  );

  const pharmacyCatalog = JSON.parse(
    fs.readFileSync('src/seeders/seed-data/catalogNodes.pharmacy.json', 'utf-8')
  );

  await seedModules(modules);
  await seedCatalogNodes(pharmacyCatalog);

  await mongoose.disconnect();
};

runSeed();
