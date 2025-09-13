import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { CodeDefinition, FormMode } from '@/types';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

interface CodeDefinitionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<CodeDefinition>) => void;
  initialData?: CodeDefinition | null;
  mode: FormMode;
  loading?: boolean;
}

const validationSchema = yup.object({
  code_definition_code: yup
    .string()
    .required('كود التعريف مطلوب')
    .max(15, 'كود التعريف يجب ألا يزيد عن 15 حرف'),
  system_config_level: yup
    .number()
    .nullable()
    .min(1, 'مستوى التكوين يجب أن يكون أكبر من 0'),
  is_available: yup.boolean().nullable()
});

type FormData = yup.InferType<typeof validationSchema>;

const CodeDefinitionForm: React.FC<CodeDefinitionFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
  loading = false
}) => {
  console.log('CodeDefinitionForm isOpen:', isOpen);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<FormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      code_definition_code: initialData?.code_definition_code || '',
      system_config_level: initialData?.system_config_level || null,
      is_available: initialData?.is_available ?? true
    }
  });

  React.useEffect(() => {
    if (isOpen && initialData) {
      reset({
        code_definition_code: initialData.code_definition_code || '',
        system_config_level: initialData.system_config_level || null,
        is_available: initialData.is_available ?? true
      });
    } else if (isOpen && mode === FormMode.CREATE) {
      reset({
        code_definition_code: '',
        system_config_level: null,
        is_available: true
      });
    }
  }, [isOpen, initialData, mode, reset]);

  const handleFormSubmit = (data: FormData) => {
    console.log('Form submitted:', data);
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
        return 'إضافة تعريف كود جديد';
      case FormMode.EDIT:
        return 'تعديل تعريف الكود';
      case FormMode.VIEW:
        return 'عرض تعريف الكود';
      default:
        return 'تعريف الكود';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={getTitle()} size="md">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <Input
          label="كود التعريف *"
          placeholder="أدخل كود التعريف"
          {...register('code_definition_code')}
          error={errors.code_definition_code?.message}
          disabled={isReadOnly}
        />

        <Input
          label="مستوى تكوين النظام"
          type="number"
          placeholder="أدخل مستوى التكوين"
          {...register('system_config_level')}
          error={errors.system_config_level?.message}
          disabled={isReadOnly}
        />

        <Select
          label="حالة الإتاحة"
          {...register('is_available')}
          options={[
            { value: true, label: 'متاح' },
            { value: false, label: 'غير متاح' }
          ]}
          disabled={isReadOnly}
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

export default CodeDefinitionForm;
