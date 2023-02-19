import { SimpleRolesIsAuthorized } from '@blitzjs/auth';
import { Item, ItemFile, User } from 'db';

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

export interface ItemWithFiles extends Item {
  files: ItemFile[];
}

export enum IntegrationSelectorType {
  LINK = 'LINK',
  TEXT = 'TEXT',
  IMG = 'IMG',
  CLICK = 'CLICK'
}

export enum IntegrationProcessingType {
  INTEGRATION,
  READ_URLS,
  SIMULATION
}

export interface IntegrationSelector {
  type: IntegrationSelectorType;
  value: string;
}

export enum ItemSimulationReference {
  initialQuantity = '  Initial Quantity',
  url = '  Url',
  descriptionPencentage = ' Description %',
  previewImagesPencentage = ' Preview images %',
  categoryPercentage = ' Categories %',
  hasPreviewImages = 'Has preview images',
  hasDescription = 'Has description',
  hasCategory = 'Has category'
}

export enum FileSimulationReference {
  hasSchemeFiles = 'Has scheme files',
  schemePercentage = ' Scheme %',
  error = 'File Error'
}
