export * from './database';

// Application specific types
export interface User {
  id: number;
  name: string;
  email: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'date' | 'textarea' | 'select';
  required?: boolean;
  options?: { value: any; label: string }[];
  placeholder?: string;
}

export interface TableColumn {
  key: string;
  title: string;
  width?: number;
  sortable?: boolean;
  render?: (value: any, record: any) => React.ReactNode;
}

export interface MenuItem {
  key: string;
  title: string;
  icon: React.ReactNode;
  path: string;
  children?: MenuItem[];
}

// Field types enum
export enum FieldType {
  TEXT = 'text',
  NUMBER = 'number', 
  BOOLEAN = 'boolean',
  DATE = 'date',
  DESCRIPTION = 'description',
  ID = 'id'
}

// Entity status enum
export enum EntityStatus {
  ACTIVE = 1,
  INACTIVE = 0
}

// Form mode enum
export enum FormMode {
  CREATE = 'create',
  EDIT = 'edit',
  VIEW = 'view'
}

// Extended interfaces with relations
export interface CodeDefinitionWithGroups extends CodeDefinition {
  groups?: DimensionalGroup[];
}

export interface DimensionalGroupWithDetails extends DimensionalGroup {
  code_definition?: CodeDefinition;
  dimensionals?: Dimensional[];
  fields?: (DimensionalGroupField & {
    field?: Field;
    list_dimensional_group?: DimensionalGroup;
  })[];
  system_dimensional?: Dimensional;
  father_group?: DimensionalGroup;
  children_groups?: DimensionalGroup[];
}

export interface DimensionalWithDetails extends Dimensional {
  group?: DimensionalGroup;
  father?: Dimensional;
  children?: Dimensional[];
  boolean_follows?: DimensionalBooleanFollow[];
  date_follows?: DimensionalDateFollow[];
  description_follows?: DimensionalDescriptionFollow[];
  number_follows?: DimensionalNumberFollow[];
  text_follows?: DimensionalTextFollow[];
  id_follows?: DimensionalIdFollow[];
}

export interface FieldWithDetails extends Field {
  field_type?: Dimensional;
  dimensional_group_fields?: (DimensionalGroupField & {
    dimensional_group?: DimensionalGroup;
  })[];
}