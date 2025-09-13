import React from 'react';
import { Edit, Trash2, Eye } from 'lucide-react';
import { useDimensionalFollowData } from '@/hooks/useDimensionals';
import { useFields } from '@/hooks/useFields';
import { useDimensionals } from '@/hooks/useDimensionals';
import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import { TableColumn } from '@/types';

interface DataListProps {
  dimensionalId: number;
  onEdit: (data: any) => void;
}

const DataList: React.FC<DataListProps> = ({ dimensionalId, onEdit }) => {
  const { data: followData, isLoading } = useDimensionalFollowData(dimensionalId);
  const { data: fields } = useFields();
  const { data: dimensionals } = useDimensionals();

  // تحويل البيانات إلى شكل جدول
  const tableData = React.useMemo(() => {
    if (!followData || !fields) return [];

    const fieldEntries = new Map<number, any>();

    // تجميع البيانات حسب الحقل
    followData.textFollows?.forEach(item => {
      if (item.field_id) {
        fieldEntries.set(item.field_id, {
          field_id: item.field_id,
          value: item.dimensional_text_follow_value,
          type: 'text',
          id: item.dimensional_text_follow_id
        });
      }
    });

    followData.numberFollows?.forEach(item => {
      if (item.field_id) {
        fieldEntries.set(item.field_id, {
          field_id: item.field_id,
          value: item.dimensional_number_follow_value,
          type: 'number',
          id: item.dimensional_number_follow_id
        });
      }
    });

    followData.booleanFollows?.forEach(item => {
      if (item.field_id) {
        fieldEntries.set(item.field_id, {
          field_id: item.field_id,
          value: item.dimensional_boolean_follow_stat,
          type: 'boolean',
          id: item.dimensional_boolean_follow_id
        });
      }
    });

    followData.dateFollows?.forEach(item => {
      if (item.field_id) {
        fieldEntries.set(item.field_id, {
          field_id: item.field_id,
          value: item.date_value,
          type: 'date',
          id: item.dimensional_date_follow_id
        });
      }
    });

    followData.descriptionFollows?.forEach(item => {
      if (item.field_id) {
        fieldEntries.set(item.field_id, {
          field_id: item.field_id,
          value: item.description_value,
          type: 'description',
          id: item.dimensional_description_follow_id
        });
      }
    });

    followData.idFollows?.forEach(item => {
      if (item.field_id) {
        const referencedDimensional = dimensionals?.find(d => d.dimensional_id === item.follow_dimensional_id);
        fieldEntries.set(item.field_id, {
          field_id: item.field_id,
          value: referencedDimensional?.dimensional_name || `بعد ${item.follow_dimensional_id}`,
          type: 'id',
          id: item.dimensional_id_follow_id,
          raw_value: item.follow_dimensional_id
        });
      }
    });

    return Array.from(fieldEntries.values());
  }, [followData, fields, dimensionals]);

  const columns: TableColumn[] = [
    {
      key: 'field_id',
      title: 'الحقل',
      width: 200,
      render: (value) => {
        const field = fields?.find(f => f.field_id === value);
        return (
          <div>
            <div className="font-medium">{field?.field_name || `حقل ${value}`}</div>
            <div className="text-xs text-gray-500">{field?.field_code}</div>
          </div>
        );
      }
    },
    {
      key: 'value',
      title: 'القيمة',
      width: 300,
      render: (_, record) => {
        const { value, type } = record;
        
        if (value === null || value === undefined) return '-';
        
        switch (type) {
          case 'boolean':
            return (
              <span className={`px-2 py-1 rounded-full text-xs ${
                value ? 'bg-success text-white' : 'bg-gray-300 text-gray-700'
              }`}>
                {value ? 'نعم' : 'لا'}
              </span>
            );
          case 'date':
            return new Date(value).toLocaleDateString('ar-SA');
          case 'number':
            return value.toString();
          case 'description':
            return (
              <div className="max-w-xs truncate" title={value}>
                {value}
              </div>
            );
          default:
            return value.toString();
        }
      }
    },
    {
      key: 'type',
      title: 'النوع',
      width: 100,
      render: (_, record) => {
        const typeLabels = {
          text: 'نص',
          number: 'رقم',
          boolean: 'منطقي',
          date: 'تاريخ',
          description: 'وصف',
          id: 'مرجع'
        };
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
            {typeLabels[record.type as keyof typeof typeLabels] || record.type}
          </span>
        );
      }
    },
    {
      key: 'actions',
      title: 'الإجراءات',
      width: 120,
      render: (_, record) => (
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onEdit(record)}
            className="p-1"
            title="تعديل"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="p-1 text-error hover:bg-red-50"
            title="حذف"
            onClick={() => {
              if (window.confirm('هل أنت متأكد من حذف هذه البيانات؟')) {
                // TODO: Implement delete functionality
                console.log('Delete record:', record);
              }
            }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">البيانات المدخلة</h3>
        <p className="text-sm text-gray-500 mt-1">
          عدد الحقول المدخلة: {tableData.length}
        </p>
      </div>
      <Table
        columns={columns}
        data={tableData}
        loading={isLoading}
        emptyText="لا توجد بيانات مدخلة لهذا البعد"
      />
    </div>
  );
};

export default DataList;
