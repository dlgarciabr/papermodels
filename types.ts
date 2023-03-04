import { SimpleRolesIsAuthorized } from '@blitzjs/auth';
import { Category, IntegrationSetup, Item, ItemFile, ItemIntegrationLog, User } from 'db';

export type Role = 'ADMIN' | 'USER';

declare module '@blitzjs/auth' {
  export interface Session {
    isAuthorized: SimpleRolesIsAuthorized<Role>;
    PublicData: {
      userId: User['id'];
      role: Role;
    };
  }
}

export interface ItemWithChildren extends Item {
  files: ItemFile[];
  setup: IntegrationSetup;
  itemIntegrationLogs: ItemIntegrationLog[];
  category: Category;
}

export enum IntegrationSelectorType {
  LINK = 'LINK',
  TEXT = 'TEXT',
  IMG = 'IMG',
  CLICK = 'CLICK'
}

export enum IntegrationProcessingType {
  INTEGRATION = 'INTEGRATION',
  READ_URLS = 'READ_URLS',
  SIMULATION = 'SIMULATION'
}

export interface IntegrationSelector {
  type: IntegrationSelectorType;
  value: string;
}

export interface IntegrationCategoryBinding {
  systemCategoryName: string;
  pageCategoryName: string;
}

export enum ItemSimulationReference {
  percentage = '    Percentage',
  initialQuantity = '   Initial Quantity',
  totalTime = '   Total time',
  url = '  Url',
  descriptionPencentage = ' Description %',
  previewImagesPencentage = ' Preview images %',
  categoryPercentage = ' Categories %',
  hasPreviewImages = 'Has preview images',
  hasDescription = 'Has description',
  hasCategory = 'Has category',
  error = 'Item Error'
}

export enum FileSimulationReference {
  hasSchemeFiles = 'Has scheme files',
  schemePercentage = ' Scheme %',
  error = 'File Error'
}

export enum IntegrationProcessingQtyType {
  FEW = 'FEW',
  INTERMEDIATE = 'INTERMEDIATE',
  FULL = 'FULL'
}

export enum SystemParameterType {
  INTEGRATION_TYPE = 'INTEGRATION_TYPE',
  INTEGRATION_QUANTITY = 'INTEGRATION_QUANTITY',
  INTEGRATION_REINTEGRATE_ITEM_ID = 'INTEGRATION_REINTEGRATE_ITEM_ID',
  INTEGRATION_ITEM_NAME = 'INTEGRATION_ITEM_NAME',
  INTEGRATION_START_TIME = 'INTEGRATION_START_TIME'
}
