export interface DimensionalGroup {
  dimensional_group_id: number;
  code_definition_id?: number;
  dimensional_group_name?: string;
  dimensional_group_description?: string;
  
  // حقول العد للمجموعة
  boolean_flows_count?: number;
  text_flows_count?: number;
  number_flows_count?: number;
  date_flows_count?: number;
  id_flows_count?: number;
  
  // حقول العد للأبعاد
  dimensional_boolean_flows_count?: number;
  dimensional_text_flows_count?: number;
  dimensional_number_flows_count?: number;
  dimensional_date_flows_count?: number;
  dimensional_description_flows_count?: number;
  dimensional_id_flows_count?: number;
  
  // حقول التحكم
  system_dimensional_id?: number;
  is_need_permission?: boolean;
  is_constant?: boolean;
  is_active?: boolean;
  level?: number;
  dimensional_group_father_id?: number;
  dimensional_group_sort?: number;
  
  // حقول المتابعة
  created_by?: number;
  created_at?: string;
  updated_by?: number;
}

export interface GroupFieldsUsage {
  text: number;
  number: number;
  date: number;
  boolean: number;
  id: number;
  dimensional_text: number;
  dimensional_number: number;
  dimensional_date: number;
  dimensional_boolean: number;
  dimensional_description: number;
  dimensional_id: number;
}
