import React, { useState } from 'react';
import { Plus, Edit, Eye, Trash2, Settings, BarChart } from 'lucide-react';

import { DimensionalGroup } from '../../types/dimensionalGroups';
import { FormMode, TableColumn } from '../../types';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import GroupFieldsUsage from '../../components/ui/GroupFieldsUsage';
import { DimensionalGroupService } from '../../services/dimensionalGroups';
import { useQuery, useMutation, useQueryClient } from 'react-query';

import DimensionalGroupForm from './DimensionalGroupForm';
import toast from 'react-hot-toast';

// Custom hooks للمجموعات
const useDimensionalGroups = () => {
  return useQuery('dimensional-groups', DimensionalGroupService.getAll);
};

const useCreateDimensionalGroup = () => {
  const queryClient = useQueryClient();
  return useMutation(DimensionalGroupService.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('dimensional-groups');
      toast.success('تم إضافة المجموعة بنجاح');
    },
    onError: () => {
      toast.error('حدث خطأ أثناء إضافة المجموعة');
    }
  });
};

const useUpdateDimensionalGroup = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ id, data }: { id: number; data: Partial<DimensionalGroup> }) => 
      DimensionalGroupService.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('dimensional-groups');
        toast.success('تم تحديث المجموعة بنجاح');
      },
      onError: () => {
        toast.error('حدث خطأ أثناء تحديث المجموعة');
      }
    }
  );
};

const useDeleteDimensionalGroup = () => {
  const queryClient = useQueryClient();
  return useMutation(DimensionalGroupService.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('dimensional-groups');
      toast.success('تم حذف المجموعة بنجاح');
    },
    onError: () => {
      toast.error('حدث خطأ أثناء حذف المجموعة');
    }
  });
};

const DimensionalGroups: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<DimensionalGroup | null>(null);
  const [formMode, setFormMode] = useState<FormMode>(FormMode.CREATE);

  // Hooks
  const { data: dimensionalGroups, isLoading } = useDimensionalGroups();
  const createMutation = useCreateDimensionalGroup();
  const updateMutation = useUpdateDimensionalGroup();
  const deleteMutation = useDeleteDimensionalGroup();

  // إضافة state جديدة لعرض استخدام الحقول
const [selectedGroupForUsage, setSelectedGroupForUsage] = useState<DimensionalGroup | null>(null);
const [groupUsage, setGroupUsage] = useState<any>(null);
const [loadingUsage, setLoadingUsage] = useState(false);

// دالة لعرض استخدام الحقول
const handleViewUsage = async (group: DimensionalGroup) => {
  setLoadingUsage(true);
  try {
    const usage = await DimensionalGroupService.getFieldsUsage(group.dimensional_group_id);
    setSelectedGroupForUsage(group);
    setGroupUsage(usage);
  } catch (error) {
    toast.error('حدث خطأ أثناء تحميل بيانات الاستخدام');
  } finally {
    setLoadingUsage(false);
  }
};

// دالة لإغلاق عرض الاستخدام
const handleCloseUsage = () => {
  setSelectedGroupForUsage(null);
  setGroupUsage(null);
};

  // Handlers
  const handleCreate = () => {
    setSelectedItem(null);
    setFormMode(FormMode.CREATE);
    setIsModalOpen(true);
  };

  const handleEdit = (item: DimensionalGroup) => {
    setSelectedItem(item);
    setFormMode(FormMode.EDIT);
    setIsModalOpen(true);
  };

  const handleView = (item: DimensionalGroup) => {
    setSelectedItem(item);
    setFormMode(FormMode.VIEW);
    setIsModalOpen(true);
  };

  const handleDelete = (item: DimensionalGroup) => {
    if (window.confirm('هل أنت متأكد من حذف هذه المجموعة؟\nملاحظة: سيتم حذف جميع الأبعاد المرتبطة بها.')) {
      deleteMutation.mutate(item.dimensional_group_id);
    }
  };

const handleFormSubmit = (data: any) => {
  // تنظيف البيانات وإزالة null values
  const cleanData: any = {};
  
  Object.keys(data).forEach(key => {
    const value = data[key];
    if (value !== null && value !== undefined) {
      cleanData[key] = value;
    }
  });

  if (formMode === FormMode.CREATE) {
    createMutation.mutate(cleanData);
  } else if (formMode === FormMode.EDIT && selectedItem) {
    updateMutation.mutate({
      id: selectedItem.dimensional_group_id,
      data: cleanData
    });
  }
  setIsModalOpen(false);
  setSelectedItem(null);
};


  // Table configuration
  const columns: TableColumn[] = [
    {
      key: 'dimensional_group_id',
      title: 'المعرف',
      width: 80
    },
    {
      key: 'dimensional_group_name',
      title: 'اسم المجموعة',
      width: 200
    },
    {
      key: 'dimensional_group_description',
      title: 'الوصف',
      width: 250,
      render: (value) => value ? (
        <div className="max-w-xs truncate" title={value}>
          {value}
        </div>
      ) : '-'
    },
    {
      key: 'level',
      title: 'المستوى',
      width: 80,
      render: (value) => value ?? '-'
    },
    {
      key: 'dimensional_group_sort',
      title: 'الترتيب',
      width: 80,
      render: (value) => value ?? '-'
    },
        {
      key: 'field_limits_group',
      title: 'حدود حقول المجموعة',
      width: 200,
      render: (_, record: DimensionalGroup) => (
        <div className="text-xs space-y-1">
          <div className="flex gap-2 flex-wrap">
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
              نص: {record.text_flows_count || 0}
            </span>
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
              رقم: {record.number_flows_count || 0}
            </span>
            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
              تاريخ: {record.date_flows_count || 0}
            </span>
            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
              منطقي: {record.boolean_flows_count || 0}
            </span>
          </div>
        </div>
      )
    },
    {
      key: 'field_limits_dimensional',
      title: 'حدود حقول الأبعاد',
      width: 220,
      render: (_, record: DimensionalGroup) => (
        <div className="text-xs space-y-1">
          <div className="flex gap-2 flex-wrap">
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
              نص: {record.dimensional_text_flows_count || 0}
            </span>
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
              رقم: {record.dimensional_number_flows_count || 0}
            </span>
            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
              تاريخ: {record.dimensional_date_flows_count || 0}
            </span>
            <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded">
              وصف: {record.dimensional_description_flows_count || 0}
            </span>
          </div>
        </div>
      )
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
      key: 'is_need_permission',
      title: 'يحتاج صلاحية',
      width: 120,
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          value 
            ? 'bg-warning text-white' 
            : 'bg-gray-200 text-gray-600'
        }`}>
          {value ? 'نعم' : 'لا'}
        </span>
      )
    },
    {
      key: 'is_constant',
      title: 'ثابت',
      width: 80,
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          value 
            ? 'bg-primary text-white' 
            : 'bg-gray-200 text-gray-600'
        }`}>
          {value ? 'نعم' : 'لا'}
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
  width: 180,
  render: (_, record: DimensionalGroup) => (
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
        onClick={() => handleViewUsage(record)}
        className="p-1 text-blue-600 hover:bg-blue-50"
        title="عرض استخدام الحقول"
        loading={loadingUsage}
      >
        <BarChart className="w-4 h-4" />
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
  const activeGroups = dimensionalGroups?.filter(g => g.is_active).length || 0;
  const constantGroups = dimensionalGroups?.filter(g => g.is_constant).length || 0;
  const permissionGroups = dimensionalGroups?.filter(g => g.is_need_permission).length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">مجموعات الأبعاد</h1>
          <p className="text-gray-600 mt-1">إدارة مجموعات الأبعاد وتنظيمها</p>
        </div>
        <Button
          variant="primary"
          onClick={handleCreate}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          إضافة مجموعة جديدة
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">إجمالي المجموعات</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {dimensionalGroups?.length || 0}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">المجموعات النشطة</h3>
          <p className="text-2xl font-bold text-success mt-1">
            {activeGroups}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">المجموعات الثابتة</h3>
          <p className="text-2xl font-bold text-primary mt-1">
            {constantGroups}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">تحتاج صلاحية</h3>
          <p className="text-2xl font-bold text-warning mt-1">
            {permissionGroups}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <Table
          columns={columns}
          data={dimensionalGroups || []}
          loading={isLoading}
          emptyText="لا توجد مجموعات أبعاد"
        />
      </div>
      {/* عرض استخدام الحقول */}
      {selectedGroupForUsage && groupUsage && (
        <div className="bg-gray-50 p-6 rounded-lg border">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              استخدام الحقول - {selectedGroupForUsage.dimensional_group_name}
            </h2>
            <Button
              variant="ghost"
              onClick={handleCloseUsage}
              className="text-gray-500 hover:text-gray-700"
            >
              إغلاق
            </Button>
          </div>
          
          <GroupFieldsUsage 
            group={selectedGroupForUsage} 
            usage={groupUsage} 
          />
        </div>
      )}

      {/* Form Modal */}
      <DimensionalGroupForm
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

export default DimensionalGroups;