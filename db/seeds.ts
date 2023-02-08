import { Decimal } from '@prisma/client/runtime';
import db, { FileType, ItemStatus } from 'db';

/*
 * This seed function is executed when you run `blitz db seed`.
 *
 * Probably you want to use a library like https://chancejs.com
 * to easily generate realistic data.
 */
const seed = async () => {
  await db.$queryRaw`ALTER SEQUENCE \"public\".\"Category_id_seq\" RESTART WITH 1`;
  await db.$queryRaw`ALTER SEQUENCE \"public\".\"Item_id_seq\" RESTART WITH 1`;
  await db.$queryRaw`ALTER SEQUENCE \"public\".\"IntegrationItem_id_seq\" RESTART WITH 1`;
  await db.$queryRaw`ALTER SEQUENCE \"public\".\"IntegrationSetup_id_seq\" RESTART WITH 1`;
  await db.$queryRaw`TRUNCATE TABLE \"public\".\"Category\" CASCADE;`;
  await db.$queryRaw`TRUNCATE TABLE \"public\".\"IntegrationItem\" CASCADE;`;
  await db.$queryRaw`TRUNCATE TABLE \"public\".\"IntegrationSetup\" CASCADE;`;

  const categories = [
    {
      name: 'Misc.',
      items: []
    },
    {
      name: 'Buildings',
      items: [
        {
          name: 'Veterinary  clinic',
          description: 'A tiny and nice vet clinic building',
          dificulty: 1,
          assemblyTime: new Decimal(0.5),
          licenseType: 'MIT',
          status: ItemStatus.enable,
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
        },
        {
          name: 'Pharmacy',
          description: '',
          dificulty: 1,
          status: ItemStatus.enable,
          assemblyTime: new Decimal(1),
          files: []
        },
        {
          name: 'Market',
          description: '',
          dificulty: 1,
          status: ItemStatus.enable,
          assemblyTime: new Decimal(1),
          files: []
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
          status: ItemStatus.enable,
          assemblyTime: new Decimal(1),
          licenseType: 'MIT',
          files: [
            {
              index: 0,
              storagePath: '2/hospital_preview_1.jpg',
              artifactType: FileType.preview
            },
            {
              index: 0,
              storagePath: '2/hospital_preview_1_thumb.jpg',
              artifactType: FileType.preview
            }
          ]
        }
      ]
    },
    {
      name: 'Architecture',
      items: [
        {
          name: 'Alcázar of Segovia',
          description:
            'The Alcázar of Segovia is a medieval castle located in the city of Segovia, in Castile and León, Spain',
          dificulty: 5,
          status: ItemStatus.enable,
          assemblyTime: new Decimal(12),
          licenseType: 'MIT',
          licenseTypeLink: 'https://opensource.org/licenses/MIT',
          author: 'Tod Jason',
          authorLink: 'https://google.com',
          files: [
            {
              index: 0,
              storagePath: '3/alcazar_of_segovia_preview_1.jpg',
              artifactType: FileType.preview
            },
            {
              index: 0,
              storagePath: '3/alcazar_of_segovia_preview_1_thumb.jpg',
              artifactType: FileType.thumbnail
            },
            {
              index: 1,
              storagePath: '3/alcazar_of_segovia_preview_2.jpg',
              artifactType: FileType.preview
            },
            {
              index: 1,
              storagePath: '3/alcazar_of_segovia_preview_2_thumb.jpg',
              artifactType: FileType.thumbnail
            },
            {
              index: 2,
              storagePath: '3/alcazar_of_segovia_preview_3.jpg',
              artifactType: FileType.preview
            },
            {
              index: 2,
              storagePath: '3/alcazar_of_segovia_preview_3_thumb.jpg',
              artifactType: FileType.thumbnail
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
          status: ItemStatus.enable,
          assemblyTime: new Decimal(3),
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
          status: ItemStatus.enable,
          assemblyTime: new Decimal(1),
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
          status: ItemStatus.disable,
          assemblyTime: new Decimal(1),
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
          status: ItemStatus.enable,
          assemblyTime: new Decimal(1),
          files: []
        }
      ]
    },
    {
      name: 'Houses & Apartments',
      items: [
        {
          name: 'Farm House',
          description: 'A nice farm house',
          dificulty: 1,
          status: ItemStatus.enable,
          assemblyTime: new Decimal(1),
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
          status: ItemStatus.enable,
          assemblyTime: new Decimal(1),
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
          status: ItemStatus.enable,
          assemblyTime: new Decimal(1),
          files: []
        }
      ]
    },
    {
      name: 'Origami',
      items: [
        {
          name: 'Origami bird',
          description: '',
          dificulty: 1,
          status: ItemStatus.enable,
          assemblyTime: new Decimal(1),
          files: []
        }
      ]
    },
    {
      name: 'Work Machines',
      items: []
    }
  ];

  for await (const { name, items } of categories) {
    await db.category.create({
      data: {
        name,
        description: name,
        items: {
          create: items!.map((item) => ({
            ...item,
            files: {
              create: item.files.map((file) => ({
                ...file
              }))
            }
          }))
        }
      }
    });
  }

  const integrationSetups = [
    {
      name: 'Papermau Exclusive',
      domain: 'https://papermau.blogspot.com/search/label/exclusive',
      itemUrlSelector: 'div > b > a',
      categorySelector: '',
      categoryBinding: '',
      previewImagesSelector: ''
    },
    {
      name: 'Paperdiorama machines',
      domain: 'https://www.paperdiorama.com/category/paper-models/work-machines',
      itemUrlSelector: 'article > div > h2 > a',
      categorySelector: 'p.post-category > a',
      categoryBinding: `[
        {
          "systemCategoryName": "Work Machines",
          "pageCategoryName": "Work Machines"
        }
      ]`,
      descriptionSelector: 'article > div> div > div > p',
      previewImagesSelector: 'div > div > div > img.caption'
    }
  ];

  await db.integrationSetup.createMany({
    data: integrationSetups
  });
};

export default seed;
