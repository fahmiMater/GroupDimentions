// في src/pages/DataManagement/DataEntryForm.tsx

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import  Input  from '../../components/ui/Input';
import  Select  from '@/components/ui/Select';
import Button  from '@/components/ui/Button';
import  Modal from '@/components/ui/Modal';
import { 
  ApiService, 
  submitFormData, 
  getFieldDataType 
} from '../../services/api';
import toast from 'react-hot-toast';

interface DataEntryFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DataEntryForm: React.FC<DataEntryFormProps> = ({ isOpen, onClose }) => {
  const [groups, setGroups] = useState<any[]>([]);
  const [dimensionals, setDimensionals] = useState<any[]>([]);
  const [fields, setFields] = useState<any[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [selectedDimensionalId, setSelectedDimensionalId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();

  // جلب المجموعات عند فتح النموذج
  useEffect(() => {
    if (isOpen) {
      loadGroups();
    }
  }, [isOpen]);

  // جلب الأبعاد عند اختيار المجموعة
  useEffect(() => {
    if (selectedGroupId) {
      loadDimensionals(selectedGroupId);
      loadGroupFields(selectedGroupId);
    }
  }, [selectedGroupId]);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getDimensionalGroupsWithDetails({ is_active: true });
      setGroups(data);
    } catch (error) {
      toast.error('خطأ في جلب المجموعات');
      console.error('Error loading groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDimensionals = async (groupId: number) => {
    try {
      const data = await ApiService.getDimensionalsWithDetails(groupId);
      setDimensionals(data);
    } catch (error) {
      toast.error('خطأ في جلب الأبعاد');
      console.error('Error loading dimensionals:', error);
    }
  };

  const loadGroupFields = async (groupId: number) => {
    try {
      const group = await ApiService.getDimensionalGroupById(groupId);
      if (group?.fields) {
        setFields(group.fields);
      }
    } catch (error) {
      toast.error('خطأ في جلب الحقول');
      console.error('Error loading fields:', error);
    }
  };

  const onSubmit = async (formData: any) => {
    if (!selectedGroupId) {
      toast.error('يرجى اختيار المجموعة');
      return;
    }

    if (!selectedDimensionalId) {
      toast.error('يرجى اختيار البُعد');
      return;
    }

    try {
      setSubmitting(true);
      
      // استخدام الدالة الجديدة لحفظ البيانات
      const result = await submitFormData(
        formData,
        fields,
        selectedGroupId,
        selectedDimensionalId,
        1 // userId - يجب الحصول عليه من السيشن
      );

      if (result.success) {
        toast.success(`تم حفظ ${result.savedFields} حقل بنجاح`);
        reset();
        onClose();
      } else {
        toast.error(`فشل في حفظ ${result.failedFields} حقل من أصل ${result.totalFields}`);
        
        // إظهار تفاصيل الأخطاء
        result.errors.forEach((error: any) => {
          toast.error(`خطأ في ${error.fieldName}: ${error.error}`);
        });
      }
      
    } catch (error) {
      toast.error('حدث خطأ أثناء حفظ البيانات');
      console.error('Error submitting form:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const renderFieldInput = (field: any) => {
    const fieldType = getFieldDataType(field.field?.field_type_dimensional_id);
    const fieldId = field.field_id.toString();
    const fieldName = field.field?.field_name || `Field ${field.field_id}`;

    switch (fieldType) {
      case 'text':
        return (
          <Input
            key={fieldId}
            label={fieldName}
            {...register(fieldId, { 
              required: field.is_required ? `${fieldName} مطلوب` : false 
            })}
            error={errors[fieldId]?.message as string}
            placeholder={`أدخل ${fieldName}`}
          />
        );

      case 'number':
        return (
          <Input
            key={fieldId}
            label={fieldName}
            type="number"
            {...register(fieldId, { 
              required: field.is_required ? `${fieldName} مطلوب` : false,
              valueAsNumber: true
            })}
            error={errors[fieldId]?.message as string}
            placeholder={`أدخل ${fieldName}`}
          />
        );

      case 'boolean':
        return (
          <div key={fieldId} className="form-group">
            <label className="form-label">{fieldName}</label>
            <Select
          key={fieldId}
          label={fieldName}
          {...register(fieldId, { 
            required: field.is_required ? `${fieldName} مطلوب` : false 
          })}
          error={errors[fieldId]?.message as string}
          options={[
            { value: "", label: "اختر القيمة" },
            { value: "true", label: "نعم" },
            { value: "false", label: "لا" }
          ]}
        />
          </div>
        );

      case 'date':
        return (
          <Input
            key={fieldId}
            label={fieldName}
            type="date"
            {...register(fieldId, { 
              required: field.is_required ? `${fieldName} مطلوب` : false 
            })}
            error={errors[fieldId]?.message as string}
          />
        );

      case 'description':
        return (
          <div key={fieldId} className="form-group">
            <label className="form-label">{fieldName}</label>
            <textarea
              {...register(fieldId, { 
                required: field.is_required ? `${fieldName} مطلوب` : false 
              })}
              className="form-input"
              rows={4}
              placeholder={`أدخل ${fieldName}`}
            />
            {errors[fieldId] && (
              <span className="error-message">{errors[fieldId]?.message as string}</span>
            )}
          </div>
        );

      case 'id':
        return (
          <div key={fieldId} className="form-group">
            <label className="form-label">{fieldName}</label>
          <Select
  {...register(fieldId, { 
    required: field.is_required ? `${fieldName} مطلوب` : false 
  })}
  error={errors[fieldId]?.message as string}
  options={[
    { value: "", label: `اختر ${fieldName}` },
    ...(field.list_dimensional_group ? [{
      value: field.list_dimensional_group.dimensional_group_id.toString(),
      label: field.list_dimensional_group.dimensional_group_name
    }] : [])
  ]}
/>

          </div>
        );

      default:
        return (
          <Input
            key={fieldId}
            label={fieldName}
            {...register(fieldId)}
            placeholder={`أدخل ${fieldName}`}
          />
        );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="إدخال البيانات">
      <div className="data-entry-form">
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* اختيار المجموعة */}
          <div className="form-group">
            <label className="form-label">المجموعة الأبعادية</label>
      <Select
  label="المجموعة الأبعادية"
  value={selectedGroupId || ''}
  onChange={(e) => {
    setSelectedGroupId(e.target.value ? parseInt(e.target.value) : null);
    setSelectedDimensionalId(null);
  }}
  disabled={loading}
  options={[
    { value: "", label: "اختر المجموعة" },
    ...groups.map(group => ({
      value: group.dimensional_group_id.toString(),
      label: group.dimensional_group_name
    }))
  ]}
/>


          </div>

          {/* اختيار البُعد */}
          {selectedGroupId && (
            <div className="form-group">
              <label className="form-label">البُعد</label>
            {selectedGroupId && (
  <Select
    label="البُعد"
    value={selectedDimensionalId || ''}
    onChange={(e) => setSelectedDimensionalId(e.target.value ? parseInt(e.target.value) : null)}
    options={[
      { value: "", label: "اختر البُعد" },
      ...dimensionals.map(dimensional => ({
        value: dimensional.dimensional_id.toString(),
        label: dimensional.dimensional_name
      }))
    ]}
  />
)}

            </div>
          )}

          {/* إظهار الحقول */}
          {selectedGroupId && fields.length > 0 && (
            <div className="fields-section">
              <h3>الحقول المطلوبة:</h3>
              {fields.map((field) => renderFieldInput(field))}
            </div>
          )}

          {/* أزرار التحكم */}
          <div className="form-actions">
            <Button type="button" variant="secondary" onClick={onClose}>
              إلغاء
            </Button>
            <Button 
              type="submit" 
              disabled={!selectedGroupId || !selectedDimensionalId || submitting || fields.length === 0}
              loading={submitting}
            >
              {submitting ? 'جاري الحفظ...' : 'حفظ البيانات'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
