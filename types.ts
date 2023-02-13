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

export interface IntegrationSelector {
  type: IntegrationSelectorType;
  value: string;
}
