import React, { useState } from 'react';
import { Plus, Edit, Eye, Trash2 } from 'lucide-react';
import { CodeDefinition, FormMode, TableColumn } from '@/types';
import {
  useCodeDefinitions,
  useCreateCodeDefinition,
  useUpdateCodeDefinition,
  useDeleteCodeDefinition
} from '@/hooks/useCodeDefinitions';
import Button from '@/components/ui/Button';
import Table from '@/components/ui/Table';
import CodeDefinitionForm from './CodeDefinitionForm';

const CodeDefinitions: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CodeDefinition | null>(null);
  const [formMode, setFormMode] = useState<FormMode>(FormMode.CREATE);

  // Hooks
  const { data: codeDefinitions, isLoading, error } = useCodeDefinitions();
  const createMutation = useCreateCodeDefinition();
  const updateMutation = useUpdateCodeDefinition();
  const deleteMutation = useDeleteCodeDefinition();

  // Debug info
  console.log('CodeDefinitions data:', codeDefinitions);
  console.log('Loading:', isLoading);
  console.log('Error:', error);

  // Handlers
  const handleCreate = () => {
    console.log('Button clicked!'); // للتشخيص
    setSelectedItem(null);
    setFormMode(FormMode.CREATE);
    setIsModalOpen(true);
    console.log('Modal should be open:', true); // للتشخيص
  };

  const handleEdit = (item: CodeDefinition) => {
    setSelectedItem(item);
    setFormMode(FormMode.EDIT);
    setIsModalOpen(true);
  };

  const handleView = (item: CodeDefinition) => {
    setSelectedItem(item);
    setFormMode(FormMode.VIEW);
    setIsModalOpen(true);
  };

  const handleDelete = (item: CodeDefinition) => {
    if (window.confirm('هل أنت متأكد من حذف هذا التعريف؟')) {
      deleteMutation.mutate(item.code_definition_id);
    }
  };

  const handleFormSubmit = async (data: Partial<CodeDefinition>) => {
    try {
      if (formMode === FormMode.CREATE) {
        await createMutation.mutateAsync(data as Omit<CodeDefinition, 'code_definition_id'>);
      } else if (formMode === FormMode.EDIT && selectedItem) {
        await updateMutation.mutateAsync({
          id: selectedItem.code_definition_id,
          data
        });
      }
      setIsModalOpen(false);
      setSelectedItem(null);
    } catch (error) {
      // Error handling is done in the hooks
    }
  };

  // Table configuration
  const columns: TableColumn[] = [
    {
      key: 'code_definition_id',
      title: 'المعرف',
      width: 80
    },
    {
      key: 'code_definition_code',
      title: 'كود التعريف',
      width: 150
    },
    {
      key: 'system_config_level',
      title: 'مستوى التكوين',
      width: 120,
      render: (value) => value ?? '-'
    },
    {
      key: 'is_available',
      title: 'حالة الإتاحة',
      width: 100,
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          value 
            ? 'bg-success text-white' 
            : 'bg-gray-300 text-gray-700'
        }`}>
          {value ? 'متاح' : 'غير متاح'}
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
      width: 120,
      render: (_, record: CodeDefinition) => (
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleView(record)}
            className="p-1"
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleEdit(record)}
            className="p-1"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleDelete(record)}
            className="p-1 text-error hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">تعريف الأكواد</h1>
          <p className="text-gray-600 mt-1">إدارة تعريفات الأكواد ومستويات التكوين</p>
        </div>
        <Button
          variant="primary"
          onClick={handleCreate}
          className="flex items-center gap-2"
          style={{ backgroundColor: '#2563eb', color: 'white', padding: '8px 16px' }}
        >
          <Plus className="w-4 h-4" />
          إضافة تعريف جديد
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">إجمالي التعريفات</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {codeDefinitions?.length || 0}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">التعريفات المتاحة</h3>
          <p className="text-2xl font-bold text-success mt-1">
            {codeDefinitions?.filter(cd => cd.is_available).length || 0}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">التعريفات غير المتاحة</h3>
          <p className="text-2xl font-bold text-error mt-1">
            {codeDefinitions?.filter(cd => !cd.is_available).length || 0}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <Table
          columns={columns}
          data={codeDefinitions || []}
          loading={isLoading}
          emptyText="لا توجد تعريفات أكواد"
        />
      </div>

      {/* Form Modal */}
      <CodeDefinitionForm
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

export default CodeDefinitions;
