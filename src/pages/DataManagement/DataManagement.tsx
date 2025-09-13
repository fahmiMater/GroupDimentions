import React, { useState } from 'react';
import { Database, Edit, Eye, Plus, Trash2, Filter } from 'lucide-react';
import { useDimensionalGroups } from '@/hooks/useDimensionalGroups';
import { useDimensionals } from '@/hooks/useDimensionals';
import { useFields } from '@/hooks/useFields';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import DataEntryForm from './DataEntryForm'
import DataList from './DataList';

const DataManagement: React.FC = () => {
  const [selectedGroupId, setSelectedGroupId] = useState<number | undefined>();
  const [selectedDimensionalId, setSelectedDimensionalId] = useState<number | undefined>();
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Hooks
  const { data: dimensionalGroups } = useDimensionalGroups();
  const { data: dimensionals } = useDimensionals(
    selectedGroupId ? { dimensional_group_id: selectedGroupId } : undefined
  );
  const { data: fields } = useFields();

  const handleGroupChange = (groupId: string) => {
    const id = groupId ? Number(groupId) : undefined;
    setSelectedGroupId(id);
    setSelectedDimensionalId(undefined); // إعادة تعيين البعد عند تغيير المجموعة
  };

  const handleDimensionalChange = (dimensionalId: string) => {
    const id = dimensionalId ? Number(dimensionalId) : undefined;
    setSelectedDimensionalId(id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة البيانات</h1>
          <p className="text-gray-600 mt-1">إدخال وإدارة القيم الفعلية للحقول</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2"
          disabled={!selectedDimensionalId}
        >
          <Plus className="w-4 h-4" />
          إضافة بيانات جديدة
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center gap-4 mb-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">اختر البعد لإدخال البيانات</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* اختيار مجموعة الأبعاد */}
          <Select
            label="مجموعة الأبعاد"
            options={[
              { value: '', label: 'اختر مجموعة الأبعاد' },
              ...(dimensionalGroups?.map(group => ({
                value: group.dimensional_group_id.toString(),
                label: group.dimensional_group_name || `مجموعة ${group.dimensional_group_id}`
              })) || [])
            ]}
            value={selectedGroupId?.toString() || ''}
            onChange={(e) => handleGroupChange(e.target.value)}
          />

          {/* اختيار البعد */}
          <Select
            label="البعد"
            options={[
              { value: '', label: 'اختر البعد' },
              ...(dimensionals?.map(dim => ({
                value: dim.dimensional_id.toString(),
                label: dim.dimensional_name || `بعد ${dim.dimensional_id}`
              })) || [])
            ]}
            value={selectedDimensionalId?.toString() || ''}
            onChange={(e) => handleDimensionalChange(e.target.value)}
            disabled={!selectedGroupId}
          />
        </div>

        {selectedGroupId && selectedDimensionalId && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-900">
                جاهز لإدخال البيانات للبعد المختار
              </span>
            </div>
          </div>
        )}
      </div>

      {/* إعرض قائمة البيانات إذا تم اختيار بعد */}
      {selectedDimensionalId && (
        <DataList 
          dimensionalId={selectedDimensionalId}
          onEdit={(data) => {
            // Handle edit
            setIsFormOpen(true);
          }}
        />
      )}

      {/* نموذج إدخال البيانات */}
      <DataEntryForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        dimensionalId={selectedDimensionalId}
        dimensionalGroupId={selectedGroupId}
      />
    </div>
  );
};

export default DataManagement;
