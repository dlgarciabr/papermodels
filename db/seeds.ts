// import db from "./index"

import db, { FileType } from 'db';

/*
 * This seed function is executed when you run `blitz db seed`.
 *
 * Probably you want to use a library like https://chancejs.com
 * to easily generate realistic data.
 */
const seed = async () => {
  await db.$queryRaw`ALTER SEQUENCE \"public\".\"Category_id_seq\" RESTART WITH 1`;
  await db.$queryRaw`ALTER SEQUENCE \"public\".\"Item_id_seq\" RESTART WITH 1`;
  await db.$queryRaw`TRUNCATE TABLE \"public\".\"Category\" CASCADE;`;

  const serviceBuildingCategory = {
    name: 'Service buildings',
    items: [
      {
        name: 'Vet clinic',
        description: 'Vet clinic',
        dificulty: 1,
        assemblyTime: 0.5,
        files: [
          {
            index: 0,
            storagePath: '1/vet_clinic_scheme_1.jpg',
            artifactType: FileType.scheme
          }
        ]
      }
    ]
  };

  const categories = [
    {
      name: 'Emergency services',
      items: [
        {
          name: 'Hospital',
          description: 'Hospital',
          dificulty: 1,
          assemblyTime: 1,
          files: []
        }
      ]
    },
    { name: 'Boats & Ships' },
    { name: 'Wagons' },
    { name: 'Aircrafts' },
    { name: 'Automobiles' },
    { name: 'Houses & residential apartments' },
    { name: 'Realistic Animals' },
    { name: 'Stores' },
    { name: 'Plants & trees' },
    { name: 'Miscelaneus' }
  ];

  const categoryCreated = await db.category.create({
    data: {
      name: serviceBuildingCategory.name,
      description: serviceBuildingCategory.name
    }
  });

  serviceBuildingCategory.items?.forEach(async (item) => {
    await db.item.create({
      data: {
        name: item.name,
        description: item.description,
        categoryId: categoryCreated.id,
        dificulty: item.dificulty,
        assemblyTime: item.assemblyTime,
        files: {
          create: item.files.map(({ storagePath, artifactType, index }) => ({
            storagePath,
            artifactType,
            index
          }))
        }
      }
    });
  });

  categories.forEach(async (category) => {
    const categoryCreated = await db.category.create({ data: { name: category.name, description: category.name } });
    category.items?.forEach(async (item) => {
      await db.item.create({
        data: {
          name: item.name,
          description: item.description,
          categoryId: categoryCreated.id,
          dificulty: item.dificulty,
          assemblyTime: item.assemblyTime,
          files: {
            create: item.files.map(({ storagePath, artifactType, index }) => ({
              storagePath,
              artifactType,
              index
            }))
          }
        }
      });
    });
  });
};

export default seed;
