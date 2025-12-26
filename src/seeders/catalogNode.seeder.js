import CatalogNode from '../models/catalogNode.model.js';
import Module from '../models/module.model.js';
import logger from '../utils/appLogger.js';

const insertNode = async (
  node,
  moduleId,
  parentId = null,
  level = 0
) => {
  logger.debug(
    `➡️ Processing node "${node.key}" (level ${level})`,
    'CatalogNodeSeeder'
  );

  if (!node.type) {
    logger.error(
      `❌ Missing type for node: ${node.key}`,
      'CatalogNodeSeeder'
    );
    throw new Error(`Missing type for node: ${node.key}`);
  }

  const exists = await CatalogNode.findOne({
    moduleId,
    key: node.key,
  });

  if (exists) {
    logger.warn(
      `⏭️ CatalogNode "${node.key}" already exists. Skipping.`,
      'CatalogNodeSeeder'
    );
    return exists;
  }

  const created = await CatalogNode.create({
    moduleId,
    name: node.name,
    key: node.key,
    type: node.type,
    description: node.description,
    parentId,
    level,
    order: node.order ?? 0,
    ui: node.ui,
    rules: node.rules,
    isActive: true,
  });

  logger.info(
    `✅ Created CatalogNode "${node.key}" (level ${level})`,
    'CatalogNodeSeeder'
  );

  if (node.children?.length) {
    logger.info(
      `🔽 "${node.key}" has ${node.children.length} children`,
      'CatalogNodeSeeder'
    );

    for (const child of node.children) {
      await insertNode(child, moduleId, created._id, level + 1);
    }
  }

  return created;
};

const seedCatalogNodes = async (catalogTree) => {
  logger.info(
    '🌱 Seeding catalog nodes...',
    'CatalogNodeSeeder'
  );

  for (const root of catalogTree) {
    logger.info(
      `📦 Resolving module "${root.moduleCode}" for root "${root.key}"`,
      'CatalogNodeSeeder'
    );

    const module = await Module.findOne({ code: root.moduleCode });

    if (!module) {
      logger.error(
        `❌ Module "${root.moduleCode}" not found`,
        'CatalogNodeSeeder'
      );
      throw new Error(`Module ${root.moduleCode} not found`);
    }

    logger.info(
      `📌 Module "${root.moduleCode}" resolved (${module._id})`,
      'CatalogNodeSeeder'
    );

    await insertNode(root, module._id);
  }

  logger.info(
    '✅ Catalog node seeding completed.',
    'CatalogNodeSeeder'
  );
};

export default seedCatalogNodes;
