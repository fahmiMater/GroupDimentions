import React, { useState } from 'react';
import { Plus, Edit, Eye, Trash2, Filter } from 'lucide-react';
import { Dimensional, FormMode, TableColumn } from '@/types';
import {
  useDimensionals,
  useCreateDimensional,
  useUpdateDimensional,
  useDeleteDimensional
} from '@/hooks/useDimensionals';
import { useDimensionalGroups } from '@/hooks/useDimensionalGroups';
import Button from '@/components/ui/Button';
import Table from '@/components/ui/Table';
import Select from '@/components/ui/Select';
import DimensionalForm from './DimensionalForm';

const Dimensionals: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Dimensional | null>(null);
  const [formMode, setFormMode] = useState<FormMode>(FormMode.CREATE);
  const [selectedGroupId, setSelectedGroupId] = useState<number | undefined>(undefined);

  // Hooks
  const { data: dimensionals, isLoading } = useDimensionals(
    selectedGroupId ? { dimensional_group_id: selectedGroupId } : undefined
  );
  const { data: dimensionalGroups } = useDimensionalGroups();
  const createMutation = useCreateDimensional();
  const updateMutation = useUpdateDimensional();
  const deleteMutation = useDeleteDimensional();

  // Handlers
  const handleCreate = () => {
    setSelectedItem(null);
    setFormMode(FormMode.CREATE);
    setIsModalOpen(true);
  };

  const handleEdit = (item: Dimensional) => {
    setSelectedItem(item);
    setFormMode(FormMode.EDIT);
    setIsModalOpen(true);
  };

  const handleView = (item: Dimensional) => {
    setSelectedItem(item);
    setFormMode(FormMode.VIEW);
    setIsModalOpen(true);
  };

  const handleDelete = (item: Dimensional) => {
    if (window.confirm('هل أنت متأكد من حذف هذا البعد؟\nملاحظة: قد يؤثر ذلك على البيانات المرتبطة.')) {
      deleteMutation.mutate(item.dimensional_id);
    }
  };

  const handleFormSubmit = async (data: Partial<Dimensional>) => {
    try {
      if (formMode === FormMode.CREATE) {
        await createMutation.mutateAsync(data as Omit<Dimensional, 'dimensional_id'>);
      } else if (formMode === FormMode.EDIT && selectedItem) {
        await updateMutation.mutateAsync({
          id: selectedItem.dimensional_id,
          data
        });
      }
      setIsModalOpen(false);
      setSelectedItem(null);
    } catch (error) {
      // Error handling is done in the hooks
    }
  };

  // Get group name by ID
  const getGroupName = (groupId: number | null | undefined) => {
    if (!groupId) return '-';
    const group = dimensionalGroups?.find(g => g.dimensional_group_id === groupId);
    return group?.dimensional_group_name || `مجموعة ${groupId}`;
  };

  // Get dimensional name by ID
  const getDimensionalName = (dimensionalId: number | null | undefined) => {
    if (!dimensionalId) return '-';
    const dimensional = dimensionals?.find(d => d.dimensional_id === dimensionalId);
    return dimensional?.dimensional_name || `بعد ${dimensionalId}`;
  };

  // Table configuration
  const columns: TableColumn[] = [
    {
      key: 'dimensional_id',
      title: 'المعرف',
      width: 80
    },
    {
      key: 'dimensional_name',
      title: 'اسم البعد',
      width: 200
    },
    {
      key: 'dimensional_group_id',
      title: 'المجموعة',
      width: 180,
      render: (value) => getGroupName(value)
    },
    {
      key: 'dimensional_father_id',
      title: 'البعد الأب',
      width: 150,
      render: (value) => getDimensionalName(value)
    },
    {
      key: 'level',
      title: 'المستوى',
      width: 80,
      render: (value) => value ?? '-'
    },
    {
      key: 'dimensional_sort',
      title: 'الترتيب',
      width: 80,
      render: (value) => value ?? '-'
    },
    {
      key: 'is_active',
      title: 'حالة النشاط',
      width: 100,
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          value 
            ? 'bg-success text-white' 
            : 'bg-gray-300 text-gray-700'
        }`}>
          {value ? 'نشط' : 'غير نشط'}
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
      render: (_, record: Dimensional) => (
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

  // Statistics
  const activeDimensionals = dimensionals?.filter(d => d.is_active).length || 0;
  const dimensionalsWithParent = dimensionals?.filter(d => d.dimensional_father_id).length || 0;
  const topLevelDimensionals = dimensionals?.filter(d => !d.dimensional_father_id).length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">الأبعاد</h1>
          <p className="text-gray-600 mt-1">إدارة الأبعاد والعناصر الفردية</p>
        </div>
        <Button
          variant="primary"
          onClick={handleCreate}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          إضافة بعد جديد
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <div className="flex-1 max-w-xs">
            <Select
              options={[
                { value: '', label: 'جميع المجموعات' },
                ...(dimensionalGroups?.map(group => ({
                  value: group.dimensional_group_id,
                  label: group.dimensional_group_name || `مجموعة ${group.dimensional_group_id}`
                })) || [])
              ]}
              value={selectedGroupId || ''}
              onChange={(e) => setSelectedGroupId(e.target.value ? Number(e.target.value) : undefined)}
              placeholder="فلترة بمجموعة الأبعاد"
            />
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">إجمالي الأبعاد</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {dimensionals?.length || 0}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">الأبعاد النشطة</h3>
          <p className="text-2xl font-bold text-success mt-1">
            {activeDimensionals}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">الأبعاد الرئيسية</h3>
          <p className="text-2xl font-bold text-primary mt-1">
            {topLevelDimensionals}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">الأبعاد الفرعية</h3>
          <p className="text-2xl font-bold text-warning mt-1">
            {dimensionalsWithParent}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <Table
          columns={columns}
          data={dimensionals || []}
          loading={isLoading}
          emptyText={selectedGroupId ? "لا توجد أبعاد في هذه المجموعة" : "لا توجد أبعاد"}
        />
      </div>

      {/* Form Modal */}
      <DimensionalForm
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

export default Dimensionals;