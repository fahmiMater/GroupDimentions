import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Dimensional, FormMode } from '@/types';
import { useDimensionalGroups } from '@/hooks/useDimensionalGroups';
import { useDimensionals } from '@/hooks/useDimensionals';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

interface DimensionalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Dimensional>) => void;
  initialData?: Dimensional | null;
  mode: FormMode;
  loading?: boolean;
}

const validationSchema = yup.object({
  dimensional_group_id: yup
    .number()
    .nullable()
    .required('مجموعة الأبعاد مطلوبة'),
  dimensional_name: yup
    .string()
    .required('اسم البعد مطلوب')
    .max(50, 'اسم البعد يجب ألا يزيد عن 50 حرف'),
  is_active: yup.boolean().nullable(),
  level: yup.number().nullable().min(1, 'المستوى يجب أن يكون أكبر من 0'),
  dimensional_father_id: yup.number().nullable(),
  dimensional_sort: yup.number().nullable().min(0, 'الترتيب لا يمكن أن يكون سالب')
});

type FormData = yup.InferType<typeof validationSchema>;

const DimensionalForm: React.FC<DimensionalFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
  loading = false
}) => {
  const { data: dimensionalGroups } = useDimensionalGroups();
  const { data: dimensionals } = useDimensionals();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<FormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      dimensional_group_id: initialData?.dimensional_group_id || null,
      dimensional_name: initialData?.dimensional_name || '',
      is_active: initialData?.is_active ?? true,
      level: initialData?.level || null,
      dimensional_father_id: initialData?.dimensional_father_id || null,
      dimensional_sort: initialData?.dimensional_sort || null
    }
  });

  const selectedGroupId = watch('dimensional_group_id');

  React.useEffect(() => {
    if (isOpen && initialData) {
      reset({
        dimensional_group_id: initialData.dimensional_group_id || null,
        dimensional_name: initialData.dimensional_name || '',
        is_active: initialData.is_active ?? true,
        level: initialData.level || null,
        dimensional_father_id: initialData.dimensional_father_id || null,
        dimensional_sort: initialData.dimensional_sort || null
      });
    } else if (isOpen && mode === FormMode.CREATE) {
      reset({
        dimensional_group_id: null,
        dimensional_name: '',
        is_active: true,
        level: null,
        dimensional_father_id: null,
        dimensional_sort: null
      });
    }
  }, [isOpen, initialData, mode, reset]);

  const handleFormSubmit = (data: FormData) => {
    onSubmit(data);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const isReadOnly = mode === FormMode.VIEW;

  const getTitle = () => {
    switch (mode) {
      case FormMode.CREATE:
        return 'إضافة بعد جديد';
      case FormMode.EDIT:
        return 'تعديل البعد';
      case FormMode.VIEW:
        return 'عرض البعد';
      default:
        return 'البعد';
    }
  };

  // Filter parent dimensionals (exclude current dimensional and its children, and same group only)
  const availableParentDimensionals = dimensionals?.filter(dim => 
    dim.dimensional_id !== initialData?.dimensional_id &&
    dim.dimensional_father_id !== initialData?.dimensional_id &&
    dim.dimensional_group_id === selectedGroupId
  ) || [];

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={getTitle()} size="lg">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="مجموعة الأبعاد *"
            {...register('dimensional_group_id')}
            options={
              dimensionalGroups?.map(group => ({
                value: group.dimensional_group_id,
                label: group.dimensional_group_name || `مجموعة ${group.dimensional_group_id}`
              })) || []
            }
            error={errors.dimensional_group_id?.message}
            disabled={isReadOnly}
          />

          <Input
            label="اسم البعد *"
            placeholder="أدخل اسم البعد"
            {...register('dimensional_name')}
            error={errors.dimensional_name?.message}
            disabled={isReadOnly}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="المستوى"
            type="number"
            placeholder="أدخل المستوى"
            {...register('level')}
            error={errors.level?.message}
            disabled={isReadOnly}
          />

          <Input
            label="ترتيب البعد"
            type="number"
            placeholder="أدخل الترتيب"
            {...register('dimensional_sort')}
            error={errors.dimensional_sort?.message}
            disabled={isReadOnly}
          />

          <Select
            label="حالة النشاط"
            {...register('is_active')}
            options={[
              { value: true, label: 'نشط' },
              { value: false, label: 'غير نشط' }
            ]}
            disabled={isReadOnly}
          />
        </div>

        <Select
          label="البعد الأب"
          {...register('dimensional_father_id')}
          options={
            availableParentDimensionals.map(dim => ({
              value: dim.dimensional_id,
              label: dim.dimensional_name || `بعد ${dim.dimensional_id}`
            }))
          }
          disabled={isReadOnly || !selectedGroupId}
          helperText={!selectedGroupId ? 'يجب اختيار مجموعة الأبعاد أولاً' : undefined}
        />

        <div className="flex gap-3 pt-4">
          {!isReadOnly && (
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              disabled={loading}
            >
              {mode === FormMode.CREATE ? 'إضافة' : 'حفظ التغييرات'}
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

export default DimensionalForm;