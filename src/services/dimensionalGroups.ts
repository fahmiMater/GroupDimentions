import { supabase } from './supabase'
import { DimensionalGroup, GroupFieldsUsage } from '../types/dimensionalGroups';

export class DimensionalGroupService {
  
  // جلب جميع المجموعات مع التسلسل الهرمي
  static async getAll(): Promise<DimensionalGroup[]> {
    const { data, error } = await supabase
      .from('gc_dimensional_groups')
      .select(`
        *,
        code_definition:gc_code_definition(code_definition_code),
        system_dimensional:gc_dimensionals(dimensional_name),
        parent_group:dimensional_group_father_id(dimensional_group_name),
        children_groups:gc_dimensional_groups!dimensional_group_father_id(*)
      `)
      .order('level', { ascending: true })
      .order('dimensional_group_sort', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }

  // جلب المجموعات حسب المستوى
  static async getByLevel(level: number): Promise<DimensionalGroup[]> {
    const { data, error } = await supabase
      .from('gc_dimensional_groups')
      .select('*')
      .eq('level', level)
      .eq('is_active', true)
      .order('dimensional_group_sort');
    
    if (error) throw error;
    return data || [];
  }

  // جلب المجموعات الفرعية
  static async getChildren(parentId: number): Promise<DimensionalGroup[]> {
    const { data, error } = await supabase
      .from('gc_dimensional_groups')
      .select('*')
      .eq('dimensional_group_father_id', parentId)
      .order('dimensional_group_sort');
    
    if (error) throw error;
    return data || [];
  }

  // حساب استخدام الحقول الحالي
  static async getFieldsUsage(groupId: number): Promise<GroupFieldsUsage> {
    // حساب الحقول على مستوى المجموعة
    const [groupTextCount, groupNumberCount, groupDateCount, groupBooleanCount, groupIdCount] = 
      await Promise.all([
        this.getGroupFieldCount(groupId, 'text'),
        this.getGroupFieldCount(groupId, 'number'),
        this.getGroupFieldCount(groupId, 'date'),
        this.getGroupFieldCount(groupId, 'boolean'),
        this.getGroupFieldCount(groupId, 'id')
      ]);

    // حساب الحقول على مستوى الأبعاد
    const [dimTextCount, dimNumberCount, dimDateCount, dimBooleanCount, dimDescCount, dimIdCount] = 
      await Promise.all([
        this.getDimensionalFieldCount(groupId, 'text'),
        this.getDimensionalFieldCount(groupId, 'number'),
        this.getDimensionalFieldCount(groupId, 'date'),
        this.getDimensionalFieldCount(groupId, 'boolean'),
        this.getDimensionalFieldCount(groupId, 'description'),
        this.getDimensionalFieldCount(groupId, 'id')
      ]);

    return {
      text: groupTextCount,
      number: groupNumberCount,
      date: groupDateCount,
      boolean: groupBooleanCount,
      id: groupIdCount,
      dimensional_text: dimTextCount,
      dimensional_number: dimNumberCount,
      dimensional_date: dimDateCount,
      dimensional_boolean: dimBooleanCount,
      dimensional_description: dimDescCount,
      dimensional_id: dimIdCount
    };
  }

  private static async getGroupFieldCount(groupId: number, fieldType: string): Promise<number> {
    const { count } = await supabase
      .from('gc_dimensional_group_field')
      .select('*', { count: 'exact', head: true })
      .eq('dimensional_group_id', groupId)
      .eq('is_for_group', true);
    
    return count || 0;
  }

 private static async getDimensionalFieldCount(groupId: number, fieldType: string): Promise<number> {
  const tableMap: Record<string, string> = {
    'text': 'gc_dimensional_text_follows',
    'number': 'gc_dimensional_number_follows',
    'date': 'gc_dimensional_date_follows',
    'boolean': 'gc_dimensional_boolean_follows',
    'description': 'gc_dimensional_description_follows',
    'id': 'gc_dimensional_id_follows'
  };

  const tableName = tableMap[fieldType];
  if (!tableName) {
    return 0;
  }

  const { count } = await supabase
    .from(tableName)
    .select('dimensional_id', { count: 'exact', head: true });
  
  return count || 0;
}


// إنشاء مجموعة جديدة
static async create(group: Omit<DimensionalGroup, 'dimensional_group_id'>): Promise<DimensionalGroup> {
  const supabaseAny = supabase as any;
  const { data, error } = await supabaseAny
    .from('gc_dimensional_groups')
    .insert(group)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// تحديث مجموعة
static async update(id: number, group: Partial<DimensionalGroup>): Promise<DimensionalGroup> {
  const supabaseAny = supabase as any;
  const { data, error } = await supabaseAny
    .from('gc_dimensional_groups')
    .update(group)
    .eq('dimensional_group_id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// حذف مجموعة
static async delete(id: number): Promise<void> {
  const supabaseAny = supabase as any;
  const { error } = await supabaseAny
    .from('gc_dimensional_groups')
    .delete()
    .eq('dimensional_group_id', id);
  
  if (error) throw error;
}


  

  // التحقق من إمكانية إضافة حقل جديد
  static async canAddField(groupId: number, fieldType: string, forDimensional = false): Promise<boolean> {
    const group = await this.getById(groupId);
    const usage = await this.getFieldsUsage(groupId);
    
    if (!group) return false;

    const limitField = forDimensional 
      ? `dimensional_${fieldType}_flows_count`
      : `${fieldType}_flows_count`;
    
    const currentUsage = forDimensional 
      ? usage[`dimensional_${fieldType}` as keyof GroupFieldsUsage]
      : usage[fieldType as keyof GroupFieldsUsage];

    return (currentUsage as number) < (group[limitField as keyof DimensionalGroup] as number || 0);
  }

  private static async getById(id: number): Promise<DimensionalGroup | null> {
    const { data, error } = await supabase
      .from('gc_dimensional_groups')
      .select('*')
      .eq('dimensional_group_id', id)
      .single();
    
    if (error) return null;
    return data;
  }
}
