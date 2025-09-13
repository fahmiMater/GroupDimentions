import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Field, FormMode } from '@/types';
import { useDimensionals } from '@/hooks/useDimensionals';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

interface FieldFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Field>) => void;
  initialData?: Field | null;
  mode: FormMode;
  loading?: boolean;
}

const validationSchema = yup.object({
  field_code: yup
    .string()
    .required('كود الحقل مطلوب')
    .max(20, 'كود الحقل يجب ألا يزيد عن 20 حرف'),
  field_name: yup
    .string()
    .required('اسم الحقل مطلوب')
    .max(50, 'اسم الحقل يجب ألا يزيد عن 50 حرف'),
  field_type_dimensional_id: yup
    .number()
    .nullable()
    .required('نوع الحقل مطلوب')
});

type FormData = yup.InferType<typeof validationSchema>;

const FieldForm: React.FC<FieldFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
  loading = false
}) => {
  const { data: dimensionals } = useDimensionals();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<FormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      field_code: initialData?.field_code || '',
      field_name: initialData?.field_name || '',
      field_type_dimensional_id: initialData?.field_type_dimensional_id || null
    }
  });

  React.useEffect(() => {
    if (isOpen && initialData) {
      reset({
        field_code: initialData.field_code || '',
        field_name: initialData.field_name || '',
        field_type_dimensional_id: initialData.field_type_dimensional_id || null
      });
    } else if (isOpen && mode === FormMode.CREATE) {
      reset({
        field_code: '',
        field_name: '',
        field_type_dimensional_id: null
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
        return 'إضافة حقل جديد';
      case FormMode.EDIT:
        return 'تعديل الحقل';
      case FormMode.VIEW:
        return 'عرض الحقل';
      default:
        return 'الحقل';
    }
  };

  // Group dimensionals by field types (assuming we have predefined field type dimensionals)
  const fieldTypeDimensionals = dimensionals?.filter(d => 
    d.dimensional_name && [
      'نص', 'text', 'رقم', 'number', 'منطقي', 'boolean', 
      'تاريخ', 'date', 'وصف', 'description', 'مرجع', 'id'
    ].some(type => 
      d.dimensional_name.toLowerCase().includes(type.toLowerCase())
    )
  ) || [];

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={getTitle()} size="md">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <Input
          label="كود الحقل *"
          placeholder="أدخل كود الحقل (مثل: FLD001)"
          {...register('field_code')}
          error={errors.field_code?.message}
          disabled={isReadOnly}
          helperText="كود فريد للحقل باللغة الإنجليزية"
        />

        <Input
          label="اسم الحقل *"
          placeholder="أدخل اسم الحقل"
          {...register('field_name')}
          error={errors.field_name?.message}
          disabled={isReadOnly}
          helperText="الاسم الذي سيظهر للمستخدم"
        />

        <Select
          label="نوع الحقل *"
          {...register('field_type_dimensional_id')}
          options={
            fieldTypeDimensionals.map(dim => ({
              value: dim.dimensional_id,
              label: dim.dimensional_name || `نوع ${dim.dimensional_id}`
            }))
          }
          error={errors.field_type_dimensional_id?.message}
          disabled={isReadOnly}
          helperText="نوع البيانات للحقل"
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

export default FieldForm;