import { Decimal } from '@prisma/client/runtime';
import db, { FileType, ItemStatus } from 'db';
import { IntegrationSelectorType } from 'types';

/*
 * This seed function is executed when you run `blitz db seed`.
 *
 * Probably you want to use a library like https://chancejs.com
 * to easily generate realistic data.
 */
const seed = async () => {
  await db.$queryRaw`ALTER SEQUENCE \"public\".\"ItemFile_id_seq\" RESTART WITH 1`;
  await db.$queryRaw`ALTER SEQUENCE \"public\".\"Category_id_seq\" RESTART WITH 1`;
  await db.$queryRaw`ALTER SEQUENCE \"public\".\"Item_id_seq\" RESTART WITH 1`;
  await db.$queryRaw`ALTER SEQUENCE \"public\".\"IntegrationSetup_id_seq\" RESTART WITH 1`;
  await db.$queryRaw`ALTER SEQUENCE \"public\".\"ItemIntegration_id_seq\" RESTART WITH 1`;
  await db.$queryRaw`ALTER SEQUENCE \"public\".\"FileIntegration_id_seq\" RESTART WITH 1`;
  await db.$queryRaw`ALTER SEQUENCE \"public\".\"IntegrationLog_id_seq\" RESTART WITH 1`;
  await db.$queryRaw`ALTER SEQUENCE \"public\".\"UrlIntegration_id_seq\" RESTART WITH 1`;

  await db.$queryRaw`TRUNCATE TABLE \"public\".\"ItemFile\" CASCADE;`;
  await db.$queryRaw`TRUNCATE TABLE \"public\".\"Category\" CASCADE;`;
  await db.$queryRaw`TRUNCATE TABLE \"public\".\"IntegrationSetup\" CASCADE;`;
  await db.$queryRaw`TRUNCATE TABLE \"public\".\"ItemIntegration\" CASCADE;`;
  await db.$queryRaw`TRUNCATE TABLE \"public\".\"FileIntegration\" CASCADE;`;
  await db.$queryRaw`TRUNCATE TABLE \"public\".\"IntegrationLog\" CASCADE;`;
  await db.$queryRaw`TRUNCATE TABLE \"public\".\"UrlIntegration\" CASCADE;`;

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
              storagePath: '1/vet_clinic_scheme_1.jpg',
              artifactType: FileType.scheme
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
          licenseType: '',
          files: [
            {
              storagePath: 'papermodel_test/4/jxt34bqa1edbjchtotkd.pdf',
              artifactType: FileType.scheme
            },
            {
              storagePath: 'papermodel_test/4/zhoznsqsiqcbdsl2pfta.jpg',
              artifactType: FileType.preview
            },
            {
              storagePath: 'papermodel_test/4/ptkzjkeagc9wsus0s8jy.jpg',
              artifactType: FileType.preview
            },
            {
              storagePath: 'papermodel_test/4/gepqjo1blhjycliynppk.jpg',
              artifactType: FileType.preview
            },
            {
              storagePath: 'papermodel_test/4/u1sd8jwko61icvfdjrzn.pdf',
              artifactType: FileType.instruction
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
            // {
            //   storagePath: '3/alcazar_of_segovia_preview_1.jpg',
            //   artifactType: FileType.preview
            // },
            // {
            //   storagePath: '3/alcazar_of_segovia_preview_2.jpg',
            //   artifactType: FileType.preview
            // },
            // {
            //   storagePath: '3/alcazar_of_segovia_preview_3.jpg',
            //   artifactType: FileType.preview
            // },
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
      name: 'Buses',
      items: []
    },
    {
      name: 'Trains',
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
    },
    {
      name: 'Trucks',
      items: []
    },
    {
      name: 'Military Vehicles',
      items: []
    },
    {
      name: 'Games',
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
      key: '',
      domain: 'https://papermau.blogspot.com/search/label/exclusive',
      itemUrlSelector: 'div > b > a',
      categorySelector: '',
      categoryBinding: '',
      previewImagesSelector: '',
      schemesSelector: ''
    },
    {
      name: 'Paperdiorama',
      key: 'paperdiorama',
      domain: 'https://www.paperdiorama.com',
      itemUrlSelector: `[
        {
          "type":"${IntegrationSelectorType.LINK}",
          "value": "article > div > h2 > a"
        }
      ]`,
      categorySelector: `[
        {
          "type":"${IntegrationSelectorType.TEXT}",
          "value": "p.post-category > a"
        },
        {
          "type":"${IntegrationSelectorType.TEXT}",
          "value": "div > p.post-category > a:nth-child(2)"
        }
      ]`,
      categoryBinding: `[
        {
          "systemCategoryName": "Automobiles",
          "pageCategoryName": "Cars"
        },
        {
          "systemCategoryName": "Boats & Ships",
          "pageCategoryName": "Ships"
        },
        {
          "systemCategoryName": "Military Vehicles",
          "pageCategoryName": "Army"
        },
        {
          "systemCategoryName": "Games",
          "pageCategoryName": "Toys"
        }
      ]`,
      descriptionSelector: `[
        {
          "type":"${IntegrationSelectorType.TEXT}",
          "value": "article > div> div > div > p"
        },
        {
          "type":"${IntegrationSelectorType.TEXT}",
          "value": "div.entry > div.entry-inner > p:nth-child(3)"
        },
        {
          "type":"${IntegrationSelectorType.TEXT}",
          "value": "div.entry > div.entry-inner > p:nth-child(4)"
        }
      ]`,
      previewImagesSelector: `[
        {
          "type":"${IntegrationSelectorType.IMG}",
          "value": "div > div > div > img.caption"
        },
        {
          "type":"${IntegrationSelectorType.IMG}",
          "value": "div.entry-inner > p > img"
        },
        {
          "type":"${IntegrationSelectorType.IMG}",
          "value": "div.entry-inner > h2 > a > img"
        },
        {
          "type":"${IntegrationSelectorType.IMG}",
          "value": "div.entry > div.entry-inner > p > a > img"
        },
        {
          "type":"${IntegrationSelectorType.IMG}",
          "value": "div.entry > div.entry-inner > div.wp-caption > a > img"
        }
      ]`,
      schemesSelector: `[
        {
          "type":"${IntegrationSelectorType.CLICK}",
          "value": "div.card-body > div > div > a.download-on-click"
        },
        {
          "type":"${IntegrationSelectorType.LINK}",
          "value": "div.entry > div.entry-inner > h2 > a"
        },
        {
          "type":"${IntegrationSelectorType.LINK}",
          "value": "div.entry > div.entry-inner > h3 > a"
        },
        {
          "type":"${IntegrationSelectorType.LINK}",
          "value": "div.entry > div.entry-inner > h4 > a"
        },
        {
          "type":"${IntegrationSelectorType.LINK}",
          "value": "div.entry > div.entry-inner > p > a"
        }
      ]`,
      ignoreExpressions: `["Paper Diorama"]`
    }
  ];

  await db.integrationSetup.createMany({
    data: integrationSetups
  });
};

export default seed;
