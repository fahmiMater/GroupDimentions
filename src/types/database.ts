// Database Types based on the provided SQL schema
export interface Database {
  public: {
    Tables: {
      gc_code_definition: {
        Row: CodeDefinition;
        Insert: Omit<CodeDefinition, 'code_definition_id'> & { code_definition_id?: number };
        Update: Partial<Omit<CodeDefinition, 'code_definition_id'>>;
      };
      gc_dimensional_groups: {
        Row: DimensionalGroup;
        Insert: Omit<DimensionalGroup, 'dimensional_group_id'> & { dimensional_group_id?: number };
        Update: Partial<Omit<DimensionalGroup, 'dimensional_group_id'>>;
      };
      gc_dimensionals: {
        Row: Dimensional;
        Insert: Omit<Dimensional, 'dimensional_id'> & { dimensional_id?: number };
        Update: Partial<Omit<Dimensional, 'dimensional_id'>>;
      };
      gc_field: {
        Row: Field;
        Insert: Omit<Field, 'field_id'> & { field_id?: number };
        Update: Partial<Omit<Field, 'field_id'>>;
      };
      gc_dimensional_group_field: {
        Row: DimensionalGroupField;
        Insert: Omit<DimensionalGroupField, 'dimensional_group_field_id'> & { dimensional_group_field_id?: number };
        Update: Partial<Omit<DimensionalGroupField, 'dimensional_group_field_id'>>;
      };
      // Follow tables
      gc_dimensional_boolean_follows: {
        Row: DimensionalBooleanFollow;
        Insert: Omit<DimensionalBooleanFollow, 'dimensional_boolean_follow_id'> & { dimensional_boolean_follow_id?: number };
        Update: Partial<Omit<DimensionalBooleanFollow, 'dimensional_boolean_follow_id'>>;
      };
      gc_dimensional_date_follows: {
        Row: DimensionalDateFollow;
        Insert: Omit<DimensionalDateFollow, 'dimensional_date_follow_id'> & { dimensional_date_follow_id?: number };
        Update: Partial<Omit<DimensionalDateFollow, 'dimensional_date_follow_id'>>;
      };
      gc_dimensional_description_follows: {
        Row: DimensionalDescriptionFollow;
        Insert: Omit<DimensionalDescriptionFollow, 'dimensional_description_follow_id'> & { dimensional_description_follow_id?: number };
        Update: Partial<Omit<DimensionalDescriptionFollow, 'dimensional_description_follow_id'>>;
      };
      gc_dimensional_number_follows: {
        Row: DimensionalNumberFollow;
        Insert: Omit<DimensionalNumberFollow, 'dimensional_number_follow_id'> & { dimensional_number_follow_id?: number };
        Update: Partial<Omit<DimensionalNumberFollow, 'dimensional_number_follow_id'>>;
      };
      gc_dimensional_text_follows: {
        Row: DimensionalTextFollow;
        Insert: Omit<DimensionalTextFollow, 'dimensional_text_follow_id'> & { dimensional_text_follow_id?: number };
        Update: Partial<Omit<DimensionalTextFollow, 'dimensional_text_follow_id'>>;
      };
      gc_dimensional_id_follows: {
        Row: DimensionalIdFollow;
        Insert: Omit<DimensionalIdFollow, 'dimensional_id_follow_id'> & { dimensional_id_follow_id?: number };
        Update: Partial<Omit<DimensionalIdFollow, 'dimensional_id_follow_id'>>;
      };
      // Group follow tables
      gc_dimensional_group_boolean_follows: {
        Row: DimensionalGroupBooleanFollow;
        Insert: Omit<DimensionalGroupBooleanFollow, 'dimensional_group_boolean_follow_id'> & { dimensional_group_boolean_follow_id?: number };
        Update: Partial<Omit<DimensionalGroupBooleanFollow, 'dimensional_group_boolean_follow_id'>>;
      };
      gc_dimensional_group_date_follows: {
        Row: DimensionalGroupDateFollow;
        Insert: Omit<DimensionalGroupDateFollow, 'dimensional_group_date_follow_id'> & { dimensional_group_date_follow_id?: number };
        Update: Partial<Omit<DimensionalGroupDateFollow, 'dimensional_group_date_follow_id'>>;
      };
      gc_dimensional_group_id_follows: {
        Row: DimensionalGroupIdFollow;
        Insert: Omit<DimensionalGroupIdFollow, 'dimensional_group_id_follow_id'> & { dimensional_group_id_follow_id?: number };
        Update: Partial<Omit<DimensionalGroupIdFollow, 'dimensional_group_id_follow_id'>>;
      };
      gc_dimensional_group_number_follows: {
        Row: DimensionalGroupNumberFollow;
        Insert: Omit<DimensionalGroupNumberFollow, 'dimensional_group_number_follow_id'> & { dimensional_group_number_follow_id?: number };
        Update: Partial<Omit<DimensionalGroupNumberFollow, 'dimensional_group_number_follow_id'>>;
      };
      gc_dimensional_group_text_follows: {
        Row: DimensionalGroupTextFollow;
        Insert: Omit<DimensionalGroupTextFollow, 'dimensional_group_text_follow_id'> & { dimensional_group_text_follow_id?: number };
        Update: Partial<Omit<DimensionalGroupTextFollow, 'dimensional_group_text_follow_id'>>;
      };
    };
  };
}

// Base entity interfaces
export interface CodeDefinition {
  code_definition_id: number;
  code_definition_code?: string | null;
  system_config_level?: number | null;
  is_available?: boolean | null;
  created_by?: number | null;
  created_at?: string | null;
  updated_by?: number | null;
}

export interface DimensionalGroup {
  dimensional_group_id: number;
  code_definition_id?: number | null;
  dimensional_group_name?: string | null;
  dimensional_group_description?: string | null;
  boolean_flows_count?: number | null;
  text_flows_count?: number | null;
  number_flows_count?: number | null;
  date_flows_count?: number | null;
  id_flows_count?: number | null;
  dimensional_boolean_flows_count?: number | null;
  dimensional_text_flows_count?: number | null;
  dimensional_number_flows_count?: number | null;
  dimensional_date_flows_count?: number | null;
  dimensional_description_flows_count?: number | null;
  dimensional_id_flows_count?: number | null;
  system_dimensional_id?: number | null;
  is_need_permission?: boolean | null;
  is_constant?: boolean | null;
  is_active?: boolean | null;
  level?: number | null;
  dimensional_group_father_id?: number | null;
  dimensional_group_sort?: number | null;
  created_by?: number | null;
  created_at?: string | null;
  updated_by?: number | null;
}

export interface Dimensional {
  dimensional_id: number;
  dimensional_group_id?: number | null;
  dimensional_name?: string | null;
  is_active?: boolean | null;
  level?: number | null;
  dimensional_father_id?: number | null;
  dimensional_sort?: number | null;
  created_by?: number | null;
  created_at?: string | null;
  updated_by?: number | null;
}

export interface Field {
  field_id: number;
  field_code?: string | null;
  field_name?: string | null;
  field_type_dimensional_id?: number | null;
  created_by?: number | null;
  created_at?: string | null;
  updated_by?: number | null;
}

export interface DimensionalGroupField {
  dimensional_group_field_id: number;
  dimensional_group_id?: number | null;
  field_id?: number | null;
  list_dimensional_group_id?: number | null;
  is_for_group?: boolean | null;
  field_sort?: number | null;
  created_by?: number | null;
  created_at?: string | null;
  updated_by?: number | null;
}

// Follow tables interfaces
export interface DimensionalBooleanFollow {
  dimensional_boolean_follow_id: number;
  dimensional_id?: number | null;
  field_id?: number | null;
  dimensional_boolean_follow_stat?: boolean | null;
  created_by?: number | null;
  created_at?: string | null;
  updated_by?: number | null;
}

export interface DimensionalDateFollow {
  dimensional_date_follow_id: number;
  dimensional_id?: number | null;
  field_id?: number | null;
  date_value?: string | null;
  created_by?: number | null;
  created_at?: string | null;
  updated_by?: number | null;
}

export interface DimensionalDescriptionFollow {
  dimensional_description_follow_id: number;
  dimensional_id?: number | null;
  field_id?: number | null;
  description_value?: string | null;
  created_by?: number | null;
  created_at?: string | null;
  updated_by?: number | null;
}

export interface DimensionalNumberFollow {
  dimensional_number_follow_id: number;
  dimensional_id?: number | null;
  field_id?: number | null;
  dimensional_number_follow_value?: number | null;
  created_by?: number | null;
  created_at?: string | null;
  updated_by?: number | null;
}

export interface DimensionalTextFollow {
  dimensional_text_follow_id: number;
  dimensional_id?: number | null;
  field_id?: number | null;
  dimensional_text_follow_value?: string | null;
  created_by?: number | null;
  created_at?: string | null;
  updated_by?: number | null;
}

export interface DimensionalIdFollow {
  dimensional_id_follow_id: number;
  dimensional_id?: number | null;
  field_id?: number | null;
  follow_dimensional_id?: number | null;
  created_by?: number | null;
  created_at?: string | null;
  updated_by?: number | null;
}

// Group follow tables interfaces
export interface DimensionalGroupBooleanFollow {
  dimensional_group_boolean_follow_id: number;
  dimensional_group_id?: number | null;
  field_id?: number | null;
  dimensional_group_boolean_follow_stat?: boolean | null;
  created_by?: number | null;
  created_at?: string | null;
  updated_by?: number | null;
}

export interface DimensionalGroupDateFollow {
  dimensional_group_date_follow_id: number;
  dimensional_group_id?: number | null;
  field_id?: number | null;
  date_value?: string | null;
  created_by?: number | null;
  created_at?: string | null;
  updated_by?: number | null;
}

export interface DimensionalGroupIdFollow {
  dimensional_group_id_follow_id: number;
  dimensional_group_id?: number | null;
  field_id?: number | null;
  dimensional_id?: number | null;
  created_by?: number | null;
  created_at?: string | null;
  updated_by?: number | null;
}

export interface DimensionalGroupNumberFollow {
  dimensional_group_number_follow_id: number;
  dimensional_group_id?: number | null;
  field_id?: number | null;
  dimensional_group_number_follow_value?: number | null;
  created_by?: number | null;
  created_at?: string | null;
  updated_by?: number | null;
}

export interface DimensionalGroupTextFollow {
  dimensional_group_text_follow_id: number;
  dimensional_group_id?: number | null;
  field_id?: number | null;
  dimensional_group_text_follow_value?: string | null;
  created_by?: number | null;
  created_at?: string | null;
  updated_by?: number | null;
}