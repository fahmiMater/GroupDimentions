import React from 'react';

interface FieldUsage {
  key: string;
  label: string;
  max: number;
  current: number;
  color: string;
}

interface Props {
  group: any;
  usage: any;
}

const GroupFieldsUsage: React.FC<Props> = ({ group, usage }) => {
  const fieldTypes: FieldUsage[] = [
    {
      key: 'text',
      label: 'الحقول النصية',
      max: group?.text_flows_count || 0,
      current: usage?.text || 0,
      color: 'blue'
    },
    {
      key: 'number',
      label: 'الحقول الرقمية',
      max: group?.number_flows_count || 0,
      current: usage?.number || 0,
      color: 'green'
    },
    {
      key: 'date',
      label: 'حقول التاريخ',
      max: group?.date_flows_count || 0,
      current: usage?.date || 0,
      color: 'purple'
    },
    {
      key: 'boolean',
      label: 'الحقول المنطقية',
      max: group?.boolean_flows_count || 0,
      current: usage?.boolean || 0,
      color: 'yellow'
    },
    {
      key: 'id',
      label: 'حقول المعرف',
      max: group?.id_flows_count || 0,
      current: usage?.id || 0,
      color: 'red'
    }
  ];

  const dimensionalFieldTypes: FieldUsage[] = [
    {
      key: 'dimensional_text',
      label: 'الحقول النصية للأبعاد',
      max: group?.dimensional_text_flows_count || 0,
      current: usage?.dimensional_text || 0,
      color: 'blue'
    },
    {
      key: 'dimensional_number',
      label: 'الحقول الرقمية للأبعاد',
      max: group?.dimensional_number_flows_count || 0,
      current: usage?.dimensional_number || 0,
      color: 'green'
    },
    {
      key: 'dimensional_date',
      label: 'حقول التاريخ للأبعاد',
      max: group?.dimensional_date_flows_count || 0,
      current: usage?.dimensional_date || 0,
      color: 'purple'
    },
    {
      key: 'dimensional_boolean',
      label: 'الحقول المنطقية للأبعاد',
      max: group?.dimensional_boolean_flows_count || 0,
      current: usage?.dimensional_boolean || 0,
      color: 'yellow'
    },
    {
      key: 'dimensional_description',
      label: 'حقول الوصف للأبعاد',
      max: group?.dimensional_description_flows_count || 0,
      current: usage?.dimensional_description || 0,
      color: 'indigo'
    }
  ];

  const FieldUsageBar: React.FC<{ field: FieldUsage }> = ({ field }) => {
    const percentage = field.max > 0 ? (field.current / field.max) * 100 : 0;
    const isOverLimit = field.current > field.max;
    
    return (
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700">{field.label}</span>
          <span className={`text-xs px-2 py-1 rounded ${
            isOverLimit ? 'bg-red-100 text-red-800' : 
            percentage > 80 ? 'bg-yellow-100 text-yellow-800' : 
            'bg-green-100 text-green-800'
          }`}>
            {field.current}/{field.max}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${
              isOverLimit ? 'bg-red-500' : 
              percentage > 80 ? 'bg-yellow-500' : 
              'bg-green-500'
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          ></div>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white p-4 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">استخدام حقول المجموعة</h3>
        {fieldTypes.map((field) => (
          <FieldUsageBar key={field.key} field={field} />
        ))}
      </div>
      
      <div className="bg-white p-4 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">استخدام حقول الأبعاد</h3>
        {dimensionalFieldTypes.map((field) => (
          <FieldUsageBar key={field.key} field={field} />
        ))}
      </div>
    </div>
  );
};

export default GroupFieldsUsage;
