import { useQuery, useMutation, useQueryClient } from 'react-query';
import { fieldService, ApiService } from '@/services/api';
import { Field, FieldWithDetails } from '@/types';
import toast from 'react-hot-toast';

// Query keys
export const FIELD_KEYS = {
  all: ['fields'] as const,
  withDetails: ['fields', 'with-details'] as const,
  detail: (id: number) => ['fields', id] as const,
  byType: (typeId: number) => ['fields', 'type', typeId] as const,
};

// Get all fields
export const useFields = (filters?: {
  field_type_dimensional_id?: number;
}) => {
  return useQuery(
    filters?.field_type_dimensional_id 
      ? FIELD_KEYS.byType(filters.field_type_dimensional_id)
      : FIELD_KEYS.all,
    () => fieldService.getAll({
      orderBy: 'field_name',
      ascending: true,
      filters
    }),
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  );
};

// Get fields with details
export const useFieldsWithDetails = () => {
  return useQuery(
    FIELD_KEYS.withDetails,
    () => ApiService.getFieldsWithDetails(),
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  );
};

// Get field by ID
export const useField = (id: number | undefined) => {
  return useQuery(
    FIELD_KEYS.detail(id!),
    () => fieldService.getById(id!),
    {
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  );
};

// Create field mutation
export const useCreateField = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (data: Omit<Field, 'field_id'>) => 
      fieldService.create({
        ...data,
        created_by: 1 // This should come from auth context
      }),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(FIELD_KEYS.all);
        queryClient.invalidateQueries(FIELD_KEYS.withDetails);
        if (data.field_type_dimensional_id) {
          queryClient.invalidateQueries(FIELD_KEYS.byType(data.field_type_dimensional_id));
        }
        toast.success('تم إضافة الحقل بنجاح');
        return data;
      },
      onError: (error: any) => {
        toast.error(`خطأ في إضافة الحقل: ${error.message}`);
        throw error;
      },
    }
  );
};

// Update field mutation
export const useUpdateField = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ id, data }: { id: number; data: Partial<Field> }) =>
      fieldService.update(id, data),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(FIELD_KEYS.all);
        queryClient.invalidateQueries(FIELD_KEYS.withDetails);
        queryClient.invalidateQueries(FIELD_KEYS.detail(variables.id));
        if (data.field_type_dimensional_id) {
          queryClient.invalidateQueries(FIELD_KEYS.byType(data.field_type_dimensional_id));
        }
        toast.success('تم تحديث الحقل بنجاح');
        return data;
      },
      onError: (error: any) => {
        toast.error(`خطأ في تحديث الحقل: ${error.message}`);
        throw error;
      },
    }
  );
};

// Delete field mutation
export const useDeleteField = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (id: number) => fieldService.delete(id),
    {
      onSuccess: (_, id) => {
        queryClient.invalidateQueries(FIELD_KEYS.all);
        queryClient.invalidateQueries(FIELD_KEYS.withDetails);
        queryClient.removeQueries(FIELD_KEYS.detail(id));
        toast.success('تم حذف الحقل بنجاح');
      },
      onError: (error: any) => {
        toast.error(`خطأ في حذف الحقل: ${error.message}`);
        throw error;
      },
    }
  );
};