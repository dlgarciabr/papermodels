// import db from "./index"

import db from 'db';

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

  const categories = [
    { name: 'Emergency services' },
    {
      name: 'Service buildings',
      items: [
        {
          name: 'Vet clinic',
          files: [
            {
              id: 'images/vet_clinic.jpg',
              type: 'scheme'
            }
          ]
        }
      ]
    },
    { name: 'Ships & boats' }
  ];

  categories.forEach(async (category) => {
    const categoryCreated = await db.category.create({ data: { name: category.name, description: category.name } });
    category.items?.forEach(async (item) => {
      await db.item.create({
        data: {
          name: item.name,
          description: item.name,
          categoryId: categoryCreated.id,
          files: {
            create: item.files.map(({ id, type }) => ({
              id,
              type
            }))
          }
        }
      });
    });
  });
};

export default seed;
