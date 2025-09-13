import { SupabaseService } from './supabase';
import {
  CodeDefinition,
  DimensionalGroup,
  Dimensional,
  Field,
  DimensionalGroupField,
  DimensionalBooleanFollow,
  DimensionalDateFollow,
  DimensionalDescriptionFollow,
  DimensionalNumberFollow,
  DimensionalTextFollow,
  DimensionalIdFollow,
  DimensionalGroupBooleanFollow,
  DimensionalGroupDateFollow,
  DimensionalGroupIdFollow,
  DimensionalGroupNumberFollow,
  DimensionalGroupTextFollow,
  CodeDefinitionWithGroups,
  DimensionalGroupWithDetails,
  DimensionalWithDetails,
  FieldWithDetails,
  PaginatedResponse
} from '@/types';
import { supabase } from './supabase';

// Service instances
export const codeDefinitionService = new SupabaseService<CodeDefinition>('gc_code_definition');
export const dimensionalGroupService = new SupabaseService<DimensionalGroup>('gc_dimensional_groups');
export const dimensionalService = new SupabaseService<Dimensional>('gc_dimensionals');
export const fieldService = new SupabaseService<Field>('gc_field');
export const dimensionalGroupFieldService = new SupabaseService<DimensionalGroupField>('gc_dimensional_group_field');

// Follow services
export const dimensionalBooleanFollowService = new SupabaseService<DimensionalBooleanFollow>('gc_dimensional_boolean_follows');
export const dimensionalDateFollowService = new SupabaseService<DimensionalDateFollow>('gc_dimensional_date_follows');
export const dimensionalDescriptionFollowService = new SupabaseService<DimensionalDescriptionFollow>('gc_dimensional_description_follows');
export const dimensionalNumberFollowService = new SupabaseService<DimensionalNumberFollow>('gc_dimensional_number_follows');
export const dimensionalTextFollowService = new SupabaseService<DimensionalTextFollow>('gc_dimensional_text_follows');
export const dimensionalIdFollowService = new SupabaseService<DimensionalIdFollow>('gc_dimensional_id_follows');

// Group follow services
export const dimensionalGroupBooleanFollowService = new SupabaseService<DimensionalGroupBooleanFollow>('gc_dimensional_group_boolean_follows');
export const dimensionalGroupDateFollowService = new SupabaseService<DimensionalGroupDateFollow>('gc_dimensional_group_date_follows');
export const dimensionalGroupIdFollowService = new SupabaseService<DimensionalGroupIdFollow>('gc_dimensional_group_id_follows');
export const dimensionalGroupNumberFollowService = new SupabaseService<DimensionalGroupNumberFollow>('gc_dimensional_group_number_follows');
export const dimensionalGroupTextFollowService = new SupabaseService<DimensionalGroupTextFollow>('gc_dimensional_group_text_follows');

// Extended API functions with joins and relations
export class ApiService {
  // Code Definition API
  static async getCodeDefinitionsWithGroups(): Promise<CodeDefinitionWithGroups[]> {
    try {
      const { data, error } = await supabase
        .from('gc_code_definition')
        .select(`
          *,
          groups:gc_dimensional_groups(*)
        `);

      if (error) throw error;
      return (data as CodeDefinitionWithGroups[]) || [];
    } catch (error) {
      console.error('Error in getCodeDefinitionsWithGroups:', error);
      return [];
    }
  }

  // Helper function لجلب تعريف الكود
  private static async getCodeDefinitionById(id: number): Promise<CodeDefinition | null> {
    try {
      const { data, error } = await supabase
        .from('gc_code_definition')
        .select('*')
        .eq('code_definition_id', id)
        .single();
      
      if (error) return null;
      return data as CodeDefinition;
    } catch {
      return null;
    }
  }

  // Helper function لجلب الأبعاد حسب المجموعة
  private static async getDimensionalsByGroupId(groupId: number): Promise<Dimensional[]> {
    try {
      const { data, error } = await supabase
        .from('gc_dimensionals')
        .select('*')
        .eq('dimensional_group_id', groupId);
      
      if (error) return [];
      return (data as Dimensional[]) || [];
    } catch {
      return [];
    }
  }

  // Helper function لجلب حقول المجموعة
  private static async getDimensionalGroupFields(groupId: number): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('gc_dimensional_group_field')
        .select(`
          *,
          field:gc_field(*)
        `)
        .eq('dimensional_group_id', groupId);
      
      if (error) return [];
      return data || [];
    } catch {
      return [];
    }
  }

  // Helper function لجلب مجموعة حسب ID
  private static async getDimensionalGroupById_Internal(id: number): Promise<DimensionalGroup | null> {
    try {
      const { data, error } = await supabase
        .from('gc_dimensional_groups')
        .select('*')
        .eq('dimensional_group_id', id).single();
      
      if (error) return null;
      return data as DimensionalGroup;
    } catch {
      return null;
    }
  }

  // Helper function لجلب بُعد حسب ID
  private static async getDimensionalById(id: number): Promise<Dimensional | null> {
    try {
      const { data, error } = await supabase
        .from('gc_dimensionals')
        .select('*')
        .eq('dimensional_id', id)
        .single();
      
      if (error) return null;
      return data as Dimensional;
    } catch {
      return null;
    }
  }

  // Dimensional Group API
  static async getDimensionalGroupsWithDetails(filters?: {
    code_definition_id?: number;
    is_active?: boolean;
  }): Promise<DimensionalGroupWithDetails[]> {
    try {
      let query = supabase.from('gc_dimensional_groups').select('*');

      if (filters?.code_definition_id) {
        query = query.eq('code_definition_id', filters.code_definition_id);
      }
      if (filters?.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      }

      const { data: groups, error } = await query;
      if (error) throw error;
      if (!groups || groups.length === 0) return [];

      const typedGroups = groups as DimensionalGroup[];

      const enrichedGroups: DimensionalGroupWithDetails[] = [];

      for (const group of typedGroups) {
        try {
          const codeDefinition = group.code_definition_id 
            ? await ApiService.getCodeDefinitionById(group.code_definition_id)
            : null;

          const dimensionals = await ApiService.getDimensionalsByGroupId(group.dimensional_group_id);
          const fields = await ApiService.getDimensionalGroupFields(group.dimensional_group_id);

          enrichedGroups.push({
            ...group,
            code_definition: codeDefinition,
            dimensionals: dimensionals,
            fields: fields
          } as DimensionalGroupWithDetails);
        } catch (error) {
          console.error(`Error enriching group ${group.dimensional_group_id}:`, error);
          enrichedGroups.push({
            ...group,
            code_definition: null,
            dimensionals: [],
            fields: []
          } as DimensionalGroupWithDetails);
        }
      }

      return enrichedGroups;
    } catch (error) {
      console.error('Error in getDimensionalGroupsWithDetails:', error);
      return [];
    }
  }

  static async getDimensionalGroupById(id: number): Promise<DimensionalGroupWithDetails | null> {
    try {
      const { data: group, error } = await supabase
        .from('gc_dimensional_groups')
        .select('*')
        .eq('dimensional_group_id', id)
        .single();

      if (error) throw error;
      if (!group) return null;

      const typedGroup = group as DimensionalGroup;

      const codeDefinition = typedGroup.code_definition_id 
        ? await ApiService.getCodeDefinitionById(typedGroup.code_definition_id)
        : null;

      const dimensionals = await ApiService.getDimensionalsByGroupId(typedGroup.dimensional_group_id);
      const fields = await ApiService.getDimensionalGroupFields(typedGroup.dimensional_group_id);

      return {
        ...typedGroup,
        code_definition: codeDefinition,
        dimensionals: dimensionals,
        fields: fields
      } as DimensionalGroupWithDetails;
    } catch (error) {
      console.error('Error in getDimensionalGroupById:', error);
      return null;
    }
  }

  // Dimensional API
  static async getDimensionalsWithDetails(groupId?: number): Promise<DimensionalWithDetails[]> {
    try {
      let query = supabase.from('gc_dimensionals').select('*');

      if (groupId) {
        query = query.eq('dimensional_group_id', groupId);
      }

      const { data: dimensionals, error } = await query;
      if (error) throw error;
      if (!dimensionals || dimensionals.length === 0) return [];

      const typedDimensionals = dimensionals as Dimensional[];
      const enrichedDimensionals: DimensionalWithDetails[] = [];

      for (const dimensional of typedDimensionals) {
        try {
          const group = dimensional.dimensional_group_id
            ? await ApiService.getDimensionalGroupById_Internal(dimensional.dimensional_group_id)
            : null;

          const followData = await ApiService.getDimensionalFollowData(dimensional.dimensional_id);

          enrichedDimensionals.push({
            ...dimensional,
            group: group,
            ...followData
          } as DimensionalWithDetails);
        } catch (error) {
          console.error(`Error enriching dimensional ${dimensional.dimensional_id}:`, error);
          enrichedDimensionals.push({
            ...dimensional,
            group: null,
            boolean_follows: [],
            date_follows: [],
            description_follows: [],
            number_follows: [],
            text_follows: [],
            id_follows: []
          } as DimensionalWithDetails);
        }
      }

      return enrichedDimensionals;
    } catch (error) {
      console.error('Error in getDimensionalsWithDetails:', error);
      return [];
    }
  }

  // Field API
  static async getFieldsWithDetails(): Promise<FieldWithDetails[]> {
    try {
      const { data: fields, error } = await supabase
        .from('gc_field')
        .select('*');

      if (error) throw error;
      if (!fields || fields.length === 0) return [];

      const typedFields = fields as Field[];
      const enrichedFields: FieldWithDetails[] = [];

      for (const field of typedFields) {
        try {
          const fieldType = field.field_type_dimensional_id
            ? await ApiService.getDimensionalById(field.field_type_dimensional_id)
            : null;

          const { data: dimensionalGroupFields } = await supabase
            .from('gc_dimensional_group_field')
            .select(`
              *,
              dimensional_group:gc_dimensional_groups(*)
            `)
            .eq('field_id', field.field_id);

          enrichedFields.push({
            ...field,
            field_type: fieldType,
            dimensional_group_fields: dimensionalGroupFields || []
          } as FieldWithDetails);
        } catch (error) {
          console.error(`Error enriching field ${field.field_id}:`, error);
          enrichedFields.push({
            ...field,
            field_type: null,
            dimensional_group_fields: []
          } as FieldWithDetails);
        }
      }

      return enrichedFields;
    } catch (error) {
      console.error('Error in getFieldsWithDetails:', error);
      return [];
    }
  }

  // Follow data management
  static async getDimensionalFollowData(dimensionalId: number) {
    try {
      const results = await Promise.allSettled([
        dimensionalBooleanFollowService.getAll({ filters: { dimensional_id: dimensionalId } }),
        dimensionalDateFollowService.getAll({ filters: { dimensional_id: dimensionalId } }),
        dimensionalDescriptionFollowService.getAll({ filters: { dimensional_id: dimensionalId } }),
        dimensionalNumberFollowService.getAll({ filters: { dimensional_id: dimensionalId } }),
        dimensionalTextFollowService.getAll({ filters: { dimensional_id: dimensionalId } }),
        dimensionalIdFollowService.getAll({ filters: { dimensional_id: dimensionalId } })
      ]);

      return {
        booleanFollows: results[0].status === 'fulfilled' ? results[0].value : [],
        dateFollows: results[1].status === 'fulfilled' ? results[1].value : [],
        descriptionFollows: results[2].status === 'fulfilled' ? results[2].value : [],
        numberFollows: results[3].status === 'fulfilled' ? results[3].value : [],
        textFollows: results[4].status === 'fulfilled' ? results[4].value : [],
        idFollows: results[5].status === 'fulfilled' ? results[5].value : []
      };
    } catch (error) {
      console.error('Error fetching dimensional follow data:', error);
      return {
        booleanFollows: [],
        dateFollows: [],
        descriptionFollows: [],
        numberFollows: [],
        textFollows: [],
        idFollows: []
      };
    }
  }

  static async getDimensionalGroupFollowData(dimensionalGroupId: number) {
    try {
      const results = await Promise.allSettled([
        dimensionalGroupBooleanFollowService.getAll({ filters: { dimensional_group_id: dimensionalGroupId } }),
        dimensionalGroupDateFollowService.getAll({ filters: { dimensional_group_id: dimensionalGroupId } }),
        dimensionalGroupIdFollowService.getAll({ filters: { dimensional_group_id: dimensionalGroupId } }),
        dimensionalGroupNumberFollowService.getAll({ filters: { dimensional_group_id: dimensionalGroupId } }),
        dimensionalGroupTextFollowService.getAll({ filters: { dimensional_group_id: dimensionalGroupId } })
      ]);

      return {
        booleanFollows: results[0].status === 'fulfilled' ? results[0].value : [],
        dateFollows: results[1].status === 'fulfilled' ? results[1].value : [],
        idFollows: results[2].status === 'fulfilled' ? results[2].value : [],
        numberFollows: results[3].status === 'fulfilled' ? results[3].value : [],
        textFollows: results[4].status === 'fulfilled' ? results[4].value : []
      };
    } catch (error) {
      console.error('Error fetching dimensional group follow data:', error);
      return {
        booleanFollows: [],
        dateFollows: [],
        idFollows: [],
        numberFollows: [],
        textFollows: []
      };
    }
  }

  // Pagination helper
  static async getPaginatedData<T extends Record<string, any>>(
    service: SupabaseService<T>,
    page: number = 1,
    pageSize: number = 10,
    options?: {
      select?: string;
      orderBy?: string;
      ascending?: boolean;
      filters?: Record<string, any>;
    }
  ): Promise<PaginatedResponse<T>> {
    const offset = (page - 1) * pageSize;
    
    try {
      const [data, total] = await Promise.all([
        service.getAll({
          ...options,
          limit: pageSize,
          offset
        }),
        service.count(options?.filters)
      ]);

      return {
        data,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      };
    } catch (error) {
      console.error('Error in pagination:', error);
      return {
        data: [],
        total: 0,
        page,
        pageSize,
        totalPages: 0
      };
    }
  }
}
// في src/services/api.ts

// Field data type mapping function
export const getFieldDataType = (fieldTypeDimensionalId: number): string => {
  // هذه القيم يجب أن تكون مطابقة لما في قاعدة البيانات
  const fieldTypeMap: Record<number, string> = {
    1: 'text',
    2: 'number', 
    3: 'boolean',
    4: 'date',
    5: 'description',
    6: 'id'
  };
  
  return fieldTypeMap[fieldTypeDimensionalId] || 'text';
};

// دالة حفظ البيانات على مستوى البُعد
export const saveDimensionalFieldValue = async (
  dimensionalId: number,
  fieldId: number, 
  value: any,
  fieldType: string,
  userId: number = 1
) => {
  try {
    switch(fieldType) {
      case 'text':
        return await dimensionalTextFollowService.create({
          dimensional_id: dimensionalId,
          field_id: fieldId,
          dimensional_text_follow_value: value?.toString() || '',
          created_by: userId
        });
        
      case 'number':
        return await dimensionalNumberFollowService.create({
          dimensional_id: dimensionalId,
          field_id: fieldId,
          dimensional_number_follow_value: parseFloat(value) || 0,
          created_by: userId
        });
        
      case 'boolean':
        return await dimensionalBooleanFollowService.create({
          dimensional_id: dimensionalId,
          field_id: fieldId,
          dimensional_boolean_follow_stat: Boolean(value),
          created_by: userId
        });
        
      case 'date':
        return await dimensionalDateFollowService.create({
          dimensional_id: dimensionalId,
          field_id: fieldId,
          date_value: value,
          created_by: userId
        });
        
      case 'description':
        return await dimensionalDescriptionFollowService.create({
          dimensional_id: dimensionalId,
          field_id: fieldId,
          description_value: value?.toString() || '',
          created_by: userId
        });
        
      case 'id':
        return await dimensionalIdFollowService.create({
          dimensional_id: dimensionalId,
          field_id: fieldId,
          follow_dimensional_id: parseInt(value) || null,
          created_by: userId
        });
      
      default:
        throw new Error(`Unsupported field type: ${fieldType}`);
    }
  } catch (error) {
    console.error('Error saving dimensional field value:', error);
    throw error;
  }
};

// دالة حفظ البيانات على مستوى المجموعة
export const saveGroupFieldValue = async (
  dimensionalGroupId: number,
  fieldId: number,
  value: any, 
  fieldType: string,
  userId: number = 1
) => {
  try {
    switch(fieldType) {
      case 'text':
        return await dimensionalGroupTextFollowService.create({
          dimensional_group_id: dimensionalGroupId,
          field_id: fieldId,
          dimensional_group_text_follow_value: value?.toString() || '',
          created_by: userId
        });
        
      case 'number':
        return await dimensionalGroupNumberFollowService.create({
          dimensional_group_id: dimensionalGroupId,
          field_id: fieldId,
          dimensional_group_number_follow_value: parseFloat(value) || 0,
          created_by: userId
        });
        
      case 'boolean':
        return await dimensionalGroupBooleanFollowService.create({
          dimensional_group_id: dimensionalGroupId,
          field_id: fieldId,
          dimensional_group_boolean_follow_stat: Boolean(value),
          created_by: userId
        });
        
      case 'date':
        return await dimensionalGroupDateFollowService.create({
          dimensional_group_id: dimensionalGroupId,
          field_id: fieldId,
          date_value: value,
          created_by: userId
        });
        
      case 'id':
        return await dimensionalGroupIdFollowService.create({
          dimensional_group_id: dimensionalGroupId,
          field_id: fieldId,
          dimensional_id: parseInt(value) || null,
          created_by: userId
        });
      
      default:
        throw new Error(`Unsupported field type for group: ${fieldType}`);
    }
  } catch (error) {
    console.error('Error saving group field value:', error);
    throw error;
  }
};

// الدالة الرئيسية لحفظ النموذج
export const submitFormData = async (
  formData: Record<string, any>,
  fields: any[],
  selectedGroupId: number,
  selectedDimensionalId: number,
  userId: number = 1
) => {
  const results = [];
  const errors = [];
  
  for (const [fieldId, value] of Object.entries(formData)) {
    if (value === undefined || value === null || value === '') continue;
    
    const field = fields.find(f => f.field_id == fieldId);
    if (!field) {
      console.warn(`Field with ID ${fieldId} not found`);
      continue;
    }
    
    const fieldType = getFieldDataType(field.field?.field_type_dimensional_id);
    
    try {
      if (field.is_for_group) {
        // حفظ على مستوى المجموعة
        const result = await saveGroupFieldValue(
          selectedGroupId, 
          parseInt(fieldId), 
          value, 
          fieldType, 
          userId
        );
        results.push({ 
          fieldId, 
          fieldName: field.field?.field_name || `Field ${fieldId}`,
          type: 'group', 
          success: true, 
          data: result 
        });
      } else {
        // حفظ على مستوى البُعد
        const result = await saveDimensionalFieldValue(
          selectedDimensionalId, 
          parseInt(fieldId), 
          value, 
          fieldType, 
          userId
        );
        results.push({ 
          fieldId, 
          fieldName: field.field?.field_name || `Field ${fieldId}`,
          type: 'dimensional', 
          success: true, 
          data: result 
        });
      }
    } catch (error) {
      console.error(`Error saving field ${fieldId}:`, error);
      errors.push({ 
        fieldId, 
        fieldName: field.field?.field_name || `Field ${fieldId}`,
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }
  
  return {
    success: errors.length === 0,
    totalFields: Object.keys(formData).length,
    savedFields: results.length,
    failedFields: errors.length,
    results,
    errors
  };
};



export default ApiService;
