// Re-export all database types
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

// Import types from database to use in extended interfaces
import type {
  CodeDefinition as BaseCodeDefinition,
  DimensionalGroup as BaseDimensionalGroup,
  Dimensional as BaseDimensional,
  Field as BaseField,
  DimensionalGroupField as BaseDimensionalGroupField,
  DimensionalBooleanFollow,
  DimensionalDateFollow,
  DimensionalDescriptionFollow,
  DimensionalNumberFollow,
  DimensionalTextFollow,
  DimensionalIdFollow
} from './database';

// Extended interfaces with relations
export interface CodeDefinitionWithGroups extends BaseCodeDefinition {
  groups?: BaseDimensionalGroup[];
}

export interface DimensionalGroupWithDetails extends BaseDimensionalGroup {
  code_definition?: BaseCodeDefinition;
  dimensionals?: BaseDimensional[];
  fields?: (BaseDimensionalGroupField & {
    field?: BaseField;
    list_dimensional_group?: BaseDimensionalGroup;
  })[];
  system_dimensional?: BaseDimensional;
  father_group?: BaseDimensionalGroup;
  children_groups?: BaseDimensionalGroup[];
}

export interface DimensionalWithDetails extends BaseDimensional {
  group?: BaseDimensionalGroup;
  father?: BaseDimensional;
  children?: BaseDimensional[];
  boolean_follows?: DimensionalBooleanFollow[];
  date_follows?: DimensionalDateFollow[];
  description_follows?: DimensionalDescriptionFollow[];
  number_follows?: DimensionalNumberFollow[];
  text_follows?: DimensionalTextFollow[];
  id_follows?: DimensionalIdFollow[];
}

export interface FieldWithDetails extends BaseField {
  field_type?: BaseDimensional;
  dimensional_group_fields?: (BaseDimensionalGroupField & {
    dimensional_group?: BaseDimensionalGroup;
  })[];
}
