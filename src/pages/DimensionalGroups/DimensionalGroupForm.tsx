import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { DimensionalGroup } from '../../types/dimensionalGroups';
import { FormMode } from '../../types';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { useQuery } from 'react-query';
import { DimensionalGroupService } from '../../services/dimensionalGroups';

// Interfaces
interface CodeDefinition {
  code_definition_id: number;
  code_definition_code: string;
}

interface DimensionalGroupFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<DimensionalGroup>) => void;
  initialData?: DimensionalGroup | null;
  mode: FormMode;
  loading?: boolean;
}

// Custom hooks
const useCodeDefinitions = () => {
  return useQuery<CodeDefinition[]>('code-definitions', async () => {
    // مؤقتاً - بيانات وهمية
    return [
      { code_definition_id: 1, code_definition_code: 'SYS001' },
      { code_definition_id: 2, code_definition_code: 'SYS002' },
      { code_definition_id: 3, code_definition_code: 'SYS003' }
    ];
  });
};

const useDimensionalGroups = () => {
  return useQuery('dimensional-groups', DimensionalGroupService.getAll);
};

// Validation Schema
const validationSchema = yup.object({
  code_definition_id: yup
    .number()
    .nullable()
    .required('تعريف الكود مطلوب'),
  dimensional_group_name: yup
    .string()
    .required('اسم المجموعة مطلوب')
    .max(50, 'اسم المجموعة يجب ألا يزيد عن 50 حرف'),
  dimensional_group_description: yup
    .string()
    .nullable(),
  
  // حقول العد للمجموعة
  text_flows_count: yup.number().nullable().min(0, 'العدد لا يمكن أن يكون سالب').max(100, 'الحد الأقصى 100'),
  number_flows_count: yup.number().nullable().min(0, 'العدد لا يمكن أن يكون سالب').max(100, 'الحد الأقصى 100'),
  date_flows_count: yup.number().nullable().min(0, 'العدد لا يمكن أن يكون سالب').max(100, 'الحد الأقصى 100'),
  boolean_flows_count: yup.number().nullable().min(0, 'العدد لا يمكن أن يكون سالب').max(100, 'الحد الأقصى 100'),
  id_flows_count: yup.number().nullable().min(0, 'العدد لا يمكن أن يكون سالب').max(100, 'الحد الأقصى 100'),
  
  // حقول العد للأبعاد
  dimensional_text_flows_count: yup.number().nullable().min(0, 'العدد لا يمكن أن يكون سالب').max(100, 'الحد الأقصى 100'),
  dimensional_number_flows_count: yup.number().nullable().min(0, 'العدد لا يمكن أن يكون سالب').max(100, 'الحد الأقصى 100'),
  dimensional_date_flows_count: yup.number().nullable().min(0, 'العدد لا يمكن أن يكون سالب').max(100, 'الحد الأقصى 100'),
  dimensional_boolean_flows_count: yup.number().nullable().min(0, 'العدد لا يمكن أن يكون سالب').max(100, 'الحد الأقصى 100'),
  dimensional_description_flows_count: yup.number().nullable().min(0, 'العدد لا يمكن أن يكون سالب').max(100, 'الحد الأقصى 100'),
  dimensional_id_flows_count: yup.number().nullable().min(0, 'العدد لا يمكن أن يكون سالب').max(100, 'الحد الأقصى 100'),
  
  // باقي الحقول
  system_dimensional_id: yup.number().nullable(),
  is_need_permission: yup.boolean().nullable(),
  is_constant: yup.boolean().nullable(),
  is_active: yup.boolean().nullable(),
  level: yup.number().nullable().min(0, 'المستوى يجب أن يكون 0 أو أكثر'),
  dimensional_group_father_id: yup.number().nullable(),
  dimensional_group_sort: yup.number().nullable().min(0, 'الترتيب لا يمكن أن يكون سالب')
});

type FormData = yup.InferType<typeof validationSchema>;

const DimensionalGroupForm: React.FC<DimensionalGroupFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
  loading = false
}) => {
  const { data: codeDefinitions } = useCodeDefinitions();
  const { data: dimensionalGroups } = useDimensionalGroups();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<FormData>({
    resolver: yupResolver(validationSchema),
defaultValues: {
  code_definition_id: initialData?.code_definition_id || undefined,
  dimensional_group_name: initialData?.dimensional_group_name || '',
  dimensional_group_description: initialData?.dimensional_group_description || '',
  
      // حقول العد للمجموعة
      text_flows_count: initialData?.text_flows_count || 0,
      number_flows_count: initialData?.number_flows_count || 0,
      date_flows_count: initialData?.date_flows_count || 0,
      boolean_flows_count: initialData?.boolean_flows_count || 0,
      id_flows_count: initialData?.id_flows_count || 0,
      
      // حقول العد للأبعاد
      dimensional_text_flows_count: initialData?.dimensional_text_flows_count || 0,
      dimensional_number_flows_count: initialData?.dimensional_number_flows_count || 0,
      dimensional_date_flows_count: initialData?.dimensional_date_flows_count || 0,
      dimensional_boolean_flows_count: initialData?.dimensional_boolean_flows_count || 0,
      dimensional_description_flows_count: initialData?.dimensional_description_flows_count || 0,
      dimensional_id_flows_count: initialData?.dimensional_id_flows_count || 0,
      
      // باقي الحقول
      system_dimensional_id: initialData?.system_dimensional_id || null,
      is_need_permission: initialData?.is_need_permission ?? false,
      is_constant: initialData?.is_constant ?? false,
      is_active: initialData?.is_active ?? true,
      level: initialData?.level || null,
      dimensional_group_father_id: initialData?.dimensional_group_father_id || null,
      dimensional_group_sort: initialData?.dimensional_group_sort || null
    }
  });

  React.useEffect(() => {
    if (isOpen && initialData) {
      reset({
        code_definition_id: initialData.code_definition_id || undefined,
        dimensional_group_name: initialData.dimensional_group_name || '',
        dimensional_group_description: initialData.dimensional_group_description || '',
        
        // حقول العد للمجموعة
        text_flows_count: initialData.text_flows_count || 0,
        number_flows_count: initialData.number_flows_count || 0,
        date_flows_count: initialData.date_flows_count || 0,
        boolean_flows_count: initialData.boolean_flows_count || 0,
        id_flows_count: initialData.id_flows_count || 0,
        
        // حقول العد للأبعاد
        dimensional_text_flows_count: initialData.dimensional_text_flows_count || 0,
        dimensional_number_flows_count: initialData.dimensional_number_flows_count || 0,
        dimensional_date_flows_count: initialData.dimensional_date_flows_count || 0,
        dimensional_boolean_flows_count: initialData.dimensional_boolean_flows_count || 0,
        dimensional_description_flows_count: initialData.dimensional_description_flows_count || 0,
        dimensional_id_flows_count: initialData.dimensional_id_flows_count || 0,
        
        // باقي الحقول
        system_dimensional_id: initialData.system_dimensional_id || null,
        is_need_permission: initialData.is_need_permission ?? false,
        is_constant: initialData.is_constant ?? false,
        is_active: initialData.is_active ?? true,
        level: initialData.level || null,
        dimensional_group_father_id: initialData.dimensional_group_father_id || null,
        dimensional_group_sort: initialData.dimensional_group_sort || null
      });
    } else if (isOpen && mode === FormMode.CREATE) {
      reset({
        code_definition_id: undefined,
        dimensional_group_name: '',
        dimensional_group_description: '',
        
        // حقول العد للمجموعة - القيم الافتراضية
        text_flows_count: 0,
        number_flows_count: 0,
        date_flows_count: 0,
        boolean_flows_count: 0,
        id_flows_count: 0,
        
        // حقول العد للأبعاد - القيم الافتراضية
        dimensional_text_flows_count: 0,
        dimensional_number_flows_count: 0,
        dimensional_date_flows_count: 0,
        dimensional_boolean_flows_count: 0,
        dimensional_description_flows_count: 0,
        dimensional_id_flows_count: 0,
        
        // باقي الحقول
        system_dimensional_id: null,
        is_need_permission: false,
        is_constant: false,
        is_active: true,
        level: null,
        dimensional_group_father_id: null,
        dimensional_group_sort: null
      });
    }
  }, [isOpen, initialData, mode, reset]);

  const handleFormSubmit = (data: FormData) => {
  // تنظيف البيانات من null values
  const cleanData = Object.entries(data).reduce((acc, [key, value]) => {
    if (value !== null) {
      (acc as any)[key] = value;
    }
    return acc;
  }, {} as Partial<DimensionalGroup>);
  
  onSubmit(cleanData);
};


  const handleClose = () => {
    reset();
    onClose();
  };

  const isReadOnly = mode === FormMode.VIEW;

  const getTitle = () => {
    switch (mode) {
      case FormMode.CREATE:
        return 'إضافة مجموعة أبعاد جديدة';
      case FormMode.EDIT:
        return 'تعديل مجموعة الأبعاد';
      case FormMode.VIEW:
        return 'عرض مجموعة الأبعاد';
      default:
        return 'مجموعة الأبعاد';
    }
  };

  // Filter parent groups (exclude current group and its children)
  const availableParentGroups = dimensionalGroups?.filter(group => 
    group.dimensional_group_id !== initialData?.dimensional_group_id &&
    group.dimensional_group_father_id !== initialData?.dimensional_group_id
  ) || [];

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={getTitle()} size="xl">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* المعلومات الأساسية */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">المعلومات الأساسية</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="تعريف الكود *"
              {...register('code_definition_id')}
              options={
                codeDefinitions?.map(cd => ({
                  value: cd.code_definition_id,
                  label: cd.code_definition_code || `كود ${cd.code_definition_id}`
                })) || []
              }
              error={errors.code_definition_id?.message}
              disabled={isReadOnly}
            />

            <Input
              label="اسم المجموعة *"
              placeholder="أدخل اسم مجموعة الأبعاد"
              {...register('dimensional_group_name')}
              error={errors.dimensional_group_name?.message}
              disabled={isReadOnly}
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              وصف المجموعة
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
              rows={3}
              placeholder="أدخل وصف مجموعة الأبعاد"
              {...register('dimensional_group_description')}
              disabled={isReadOnly}
            />
          </div>
        </div>

        {/* قسم حدود حقول المجموعة */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            حدود حقول المجموعة
          </h3>
          <div className="bg-blue-50 p-3 rounded-lg mb-4">
            <p className="text-sm text-blue-800">
              حدد العدد الأقصى للحقول المسموح إنشاؤها على مستوى المجموعة
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Input
              label="الحقول النصية"
              type="number"
              placeholder="0"
              {...register('text_flows_count')}
              error={errors.text_flows_count?.message}
              disabled={isReadOnly}
            />
            
            <Input
              label="الحقول الرقمية"
              type="number"
              placeholder="0"
              {...register('number_flows_count')}
              error={errors.number_flows_count?.message}
              disabled={isReadOnly}
            />
            
            <Input
              label="حقول التاريخ"
              type="number"
              placeholder="0"
              {...register('date_flows_count')}
              error={errors.date_flows_count?.message}
              disabled={isReadOnly}
            />
            
            <Input
              label="الحقول المنطقية"
              type="number"
              placeholder="0"
              {...register('boolean_flows_count')}
              error={errors.boolean_flows_count?.message}
              disabled={isReadOnly}
            />
            
            <Input
              label="حقول المعرف"
              type="number"
              placeholder="0"
              {...register('id_flows_count')}
              error={errors.id_flows_count?.message}
              disabled={isReadOnly}
            />
          </div>
        </div>

        {/* قسم حدود حقول الأبعاد */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            حدود حقول الأبعاد
          </h3>
          <div className="bg-green-50 p-3 rounded-lg mb-4">
            <p className="text-sm text-green-800">
              حدد العدد الأقصى للحقول المسموح إنشاؤها على مستوى الأبعاد داخل هذه المجموعة
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <Input
              label="الحقول النصية"
              type="number"
              placeholder="0"
              {...register('dimensional_text_flows_count')}
              error={errors.dimensional_text_flows_count?.message}
              disabled={isReadOnly}
            />
            
            <Input
              label="الحقول الرقمية"
              type="number"
              placeholder="0"
              {...register('dimensional_number_flows_count')}
              error={errors.dimensional_number_flows_count?.message}
              disabled={isReadOnly}
            />
            
            <Input
              label="حقول التاريخ"
              type="number"
              placeholder="0"
              {...register('dimensional_date_flows_count')}
              error={errors.dimensional_date_flows_count?.message}
              disabled={isReadOnly}
            />
            
            <Input
              label="الحقول المنطقية"
              type="number"
              placeholder="0"
              {...register('dimensional_boolean_flows_count')}
              error={errors.dimensional_boolean_flows_count?.message}
              disabled={isReadOnly}
            />
            
            <Input
              label="حقول الوصف"
              type="number"
              placeholder="0"
              {...register('dimensional_description_flows_count')}
              error={errors.dimensional_description_flows_count?.message}
              disabled={isReadOnly}
            />
            
            <Input
              label="حقول المعرف"
              type="number"
              placeholder="0"
              {...register('dimensional_id_flows_count')}
              error={errors.dimensional_id_flows_count?.message}
              disabled={isReadOnly}
            />
          </div>
        </div>

        {/* إعدادات التسلسل الهرمي */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            إعدادات التسلسل الهرمي
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="المستوى"
              type="number"
              placeholder="أدخل المستوى"
              {...register('level')}
              error={errors.level?.message}
              disabled={isReadOnly}
            />

            <Input
              label="ترتيب المجموعة"
              type="number"
              placeholder="أدخل الترتيب"
              {...register('dimensional_group_sort')}
              error={errors.dimensional_group_sort?.message}
              disabled={isReadOnly}
            />
          </div>

          <div className="mt-4">
            <Select
              label="المجموعة الأب"
              {...register('dimensional_group_father_id')}
              options={
                availableParentGroups.map(group => ({
                  value: group.dimensional_group_id,
                  label: group.dimensional_group_name || `مجموعة ${group.dimensional_group_id}`
                }))
              }
              disabled={isReadOnly}
            />
          </div>

          <div className="mt-4">
            <Select
              label="البعد النظامي المرتبط"
              {...register('system_dimensional_id')}
              options={[
                { value: '', label: 'لا يوجد' }
              ]}
              disabled={isReadOnly}
              helperText="اختر البعد النظامي المرتبط بهذه المجموعة (اختياري)"
            />
          </div>
        </div>

        {/* إعدادات إضافية */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            إعدادات إضافية
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="حالة النشاط"
              {...register('is_active')}
              options={[
                { value: true, label: 'نشط' },
                { value: false, label: 'غير نشط' }
              ]}
              disabled={isReadOnly}
            />

            <Select
              label="يحتاج صلاحية"
              {...register('is_need_permission')}
              options={[
                { value: true, label: 'نعم' },
                { value: false, label: 'لا' }
              ]}
              disabled={isReadOnly}
            />

            <Select
              label="ثابت"
              {...register('is_constant')}
              options={[
                { value: true, label: 'نعم' },
                { value: false, label: 'لا' }
              ]}
              disabled={isReadOnly}
            />
          </div>
        </div>

        {/* أزرار الإجراءات */}
        <div className="flex gap-3 pt-6 border-t">
          {!isReadOnly && (
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              disabled={loading}
            >
              {mode === FormMode.CREATE ? 'إضافة المجموعة' : 'حفظ التغييرات'}
            </Button>
          )}
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={loading}
          >
            {isReadOnly ? 'إغلاق' : 'إلغاء'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default DimensionalGroupForm;
