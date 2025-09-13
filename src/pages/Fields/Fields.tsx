import React, { useState } from 'react';
import { Plus, Edit, Eye, Trash2 } from 'lucide-react';
import { Field, FormMode, TableColumn } from '@/types';
import {
  useFields,
  useCreateField,
  useUpdateField,
  useDeleteField
} from '@/hooks/useFields';
import { useDimensionals } from '@/hooks/useDimensionals';
import Button from '@/components/ui/Button';
import Table from '@/components/ui/Table';
import FieldForm from './FieldForm';

const Fields: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Field | null>(null);
  const [formMode, setFormMode] = useState<FormMode>(FormMode.CREATE);

  // Hooks
  const { data: fields, isLoading } = useFields();
  const { data: dimensionals } = useDimensionals();
  const createMutation = useCreateField();
  const updateMutation = useUpdateField();
  const deleteMutation = useDeleteField();

  // Handlers
  const handleCreate = () => {
    setSelectedItem(null);
    setFormMode(FormMode.CREATE);
    setIsModalOpen(true);
  };

  const handleEdit = (item: Field) => {
    setSelectedItem(item);
    setFormMode(FormMode.EDIT);
    setIsModalOpen(true);
  };

  const handleView = (item: Field) => {
    setSelectedItem(item);
    setFormMode(FormMode.VIEW);
    setIsModalOpen(true);
  };

  const handleDelete = (item: Field) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الحقل؟\nملاحظة: قد يؤثر ذلك على البيانات المرتبطة.')) {
      deleteMutation.mutate(item.field_id);
    }
  };

  const handleFormSubmit = async (data: Partial<Field>) => {
    try {
      if (formMode === FormMode.CREATE) {
        await createMutation.mutateAsync(data as Omit<Field, 'field_id'>);
      } else if (formMode === FormMode.EDIT && selectedItem) {
        await updateMutation.mutateAsync({
          id: selectedItem.field_id,
          data
        });
      }
      setIsModalOpen(false);
      setSelectedItem(null);
    } catch (error) {
      // Error handling is done in the hooks
    }
  };

  // Get dimensional name by ID
  const getDimensionalName = (dimensionalId: number | null | undefined) => {
    if (!dimensionalId) return '-';
    const dimensional = dimensionals?.find(d => d.dimensional_id === dimensionalId);
    return dimensional?.dimensional_name || `نوع ${dimensionalId}`;
  };

  // Table configuration
  const columns: TableColumn[] = [
    {
      key: 'field_id',
      title: 'المعرف',
      width: 80
    },
    {
      key: 'field_code',
      title: 'كود الحقل',
      width: 150
    },
    {
      key: 'field_name',
      title: 'اسم الحقل',
      width: 200
    },
    {
      key: 'field_type_dimensional_id',
      title: 'نوع الحقل',
      width: 150,
      render: (value) => (
        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
          {getDimensionalName(value)}
        </span>
      )
    },
    {
      key: 'created_at',
      title: 'تاريخ الإضافة',
      width: 120,
      render: (value) => value ? new Date(value).toLocaleDateString('ar-SA') : '-'
    },
    {
      key: 'actions',
      title: 'الإجراءات',
      width: 140,
      render: (_, record: Field) => (
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleView(record)}
            className="p-1"
            title="عرض"
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleEdit(record)}
            className="p-1"
            title="تعديل"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleDelete(record)}
            className="p-1 text-error hover:bg-red-50"
            title="حذف"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ];

  // Get field type statistics
  const fieldTypeStats = dimensionals?.reduce((acc, dim) => {
    const fieldsOfType = fields?.filter(f => f.field_type_dimensional_id === dim.dimensional_id).length || 0;
    if (fieldsOfType > 0) {
      acc[dim.dimensional_name || 'غير محدد'] = fieldsOfType;
    }
    return acc;
  }, {} as Record<string, number>) || {};

  const mostUsedType = Object.entries(fieldTypeStats).sort(([,a], [,b]) => b - a)[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">الحقول</h1>
          <p className="text-gray-600 mt-1">إدارة حقول البيانات وأنواعها</p>
        </div>
        <Button
          variant="primary"
          onClick={handleCreate}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          إضافة حقل جديد
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">إجمالي الحقول</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {fields?.length || 0}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">أنواع الحقول المختلفة</h3>
          <p className="text-2xl font-bold text-primary mt-1">
            {Object.keys(fieldTypeStats).length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">النوع الأكثر استخداماً</h3>
          <p className="text-sm font-bold text-success mt-1">
            {mostUsedType ? mostUsedType[0] : 'لا يوجد'}
          </p>
          <p className="text-xs text-gray-500">
            {mostUsedType ? `${mostUsedType[1]} حقل` : ''}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">الحقول النشطة</h3>
          <p className="text-2xl font-bold text-success mt-1">
            {fields?.length || 0}
          </p>
        </div>
      </div>

      {/* Field Types Distribution */}
      {Object.keys(fieldTypeStats).length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">توزيع أنواع الحقول</h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {Object.entries(fieldTypeStats).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{type}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ 
                          width: `${Math.max((count / (fields?.length || 1)) * 100, 10)}%` 
                        }}
                      />
                    </div>
                    <span className="text-sm text-gray-500 min-w-[2rem] text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <Table
          columns={columns}
          data={fields || []}
          loading={isLoading}
          emptyText="لا توجد حقول"
        />
      </div>

      {/* Form Modal */}
      <FieldForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedItem}
        mode={formMode}
        loading={createMutation.isLoading || updateMutation.isLoading}
      />
    </div>
  );
};

export default Fields;