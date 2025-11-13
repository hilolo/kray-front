/**
 * User permissions model from backend
 */
export interface ModulePermissions {
  view: boolean;
  edit: boolean;
  delete: boolean;
}

export interface UserPermissions {
  id: string;
  userId: string;
  permissions: {
    dashboard?: ModulePermissions;
    properties?: ModulePermissions;
    buildings?: ModulePermissions;
    leasing?: ModulePermissions;
    reservations?: ModulePermissions;
    maintenance?: ModulePermissions;
    contacts?: ModulePermissions;
    keys?: ModulePermissions;
    banks?: ModulePermissions;
    payments?: ModulePermissions;
    'file-manager'?: ModulePermissions;
    reports?: ModulePermissions;
    settings?: ModulePermissions;
  };
}

