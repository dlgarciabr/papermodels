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

  const categories = [
    {
      name: 'Service buildings',
      items: [
        {
          name: 'Vet clinic',
          description: 'A tiny and nice vet clinic building',
          dificulty: 1,
          assemblyTime: 0.5,
          licenseType: 'MIT',
          licenseTypeLink: 'https://opensource.org/licenses/MIT',
          files: [
            {
              index: 0,
              storagePath: '1/vet_clinic_scheme_1.jpg',
              artifactType: FileType.scheme
            },
            {
              index: 0,
              storagePath: '1/vet_clinic_thumbnail_2.png',
              artifactType: FileType.thumbnail
            }
          ]
        }
      ]
    },
    {
      name: 'Emergency services',
      items: [
        {
          name: 'Hospital',
          description: 'A big and cool hospital, perfect to play with kids. It also contains some doctors to be made',
          dificulty: 1,
          assemblyTime: 1,
          licenseType: 'MIT',
          files: [
            {
              index: 0,
              storagePath: '2/hospital_preview_1.jpg',
              artifactType: FileType.preview
            }
          ]
        }
      ]
    },
    {
      name: 'Boats & Ships',
      items: [
        {
          name: 'Speedboat',
          description: 'A fast racing speed boat',
          dificulty: 2,
          assemblyTime: 3,
          licenseTypeLink: 'https://opensource.org/licenses/MIT',
          files: []
        }
      ]
    },
    {
      name: 'Wagons',
      items: [
        {
          name: 'Oporto Metro',
          description: 'A two wagon metro of Oporto city',
          dificulty: 1,
          assemblyTime: 1,
          files: []
        }
      ]
    },
    {
      name: 'Aircrafts',
      items: [
        {
          name: 'F-14 Tomcat',
          description: 'The classic US Navy fighter jet from 80s. Used to fly from aircraft carriers',
          dificulty: 1,
          assemblyTime: 1,
          files: []
        }
      ]
    },
    {
      name: 'Automobiles',
      items: [
        {
          name: 'Mercedes Class A',
          description: 'The small solution of a city car presented by Mercedes',
          dificulty: 1,
          assemblyTime: 1,
          files: []
        }
      ]
    },
    {
      name: 'Houses & residential apartments',
      items: [
        {
          name: 'Farm House',
          description: 'A nice farm house',
          dificulty: 1,
          assemblyTime: 1,
          files: []
        }
      ]
    },
    {
      name: 'Realistic Animals',
      items: [
        {
          name: 'Jaguar',
          description: '',
          dificulty: 1,
          assemblyTime: 1,
          files: []
        }
      ]
    },
    {
      name: 'Stores',
      items: [
        {
          name: 'Pharmacy',
          description: '',
          dificulty: 1,
          assemblyTime: 1,
          files: []
        },
        {
          name: 'Market',
          description: '',
          dificulty: 1,
          assemblyTime: 1,
          files: []
        }
      ]
    },
    {
      name: 'Plants & trees',
      items: [
        {
          name: 'Oak',
          description: '',
          dificulty: 1,
          assemblyTime: 1,
          files: []
        }
      ]
    },
    {
      name: 'Miscelaneus',
      items: [
        {
          name: 'Origami bird',
          description: '',
          dificulty: 1,
          assemblyTime: 1,
          files: []
        }
      ]
    }
  ];

  const category1 = await db.category.create({ data: { name: categories[0]!.name, description: categories[0]!.name } });
  categories[0]!.items?.forEach(async (item) => {
    await db.item.create({
      data: {
        ...item,
        categoryId: category1.id,
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

  const category2 = await db.category.create({ data: { name: categories[1]!.name, description: categories[1]!.name } });
  categories[1]!.items?.forEach(async (item) => {
    await db.item.create({
      data: {
        ...item,
        categoryId: category2.id,
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

  categories.slice(2).forEach(async (category) => {
    const categoryCreated = await db.category.create({ data: { name: category.name, description: category.name } });
    category.items?.forEach(async (item) => {
      await db.item.create({
        data: {
          ...item,
          categoryId: categoryCreated.id,
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
