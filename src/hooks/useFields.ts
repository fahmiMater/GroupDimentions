import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiService, fieldService } from '@/services/api';
import { Field, FieldWithDetails } from '@/types';

// Query keys for better cache management
const FIELD_KEYS = {
  all: ['fields'] as const,
  lists: () => [...FIELD_KEYS.all, 'list'] as const,
  list: (filters: any) => [...FIELD_KEYS.lists(), { filters }] as const,
  details: () => [...FIELD_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...FIELD_KEYS.details(), id] as const,
  withDetails: ['fields', 'with-details'] as const,
  byType: (typeId: number) => [...FIELD_KEYS.all, 'by-type', typeId] as const,
  byGroup: (groupId: number) => [...FIELD_KEYS.all, 'by-group', groupId] as const,
  paginated: (page: number, pageSize: number, options?: any) => 
    [...FIELD_KEYS.all, 'paginated', { page, pageSize, options }] as const,
};

// Get all fields
export const useFields = (options?: {
  orderBy?: string;
  ascending?: boolean;
  filters?: Record<string, any>;
}) => {
  return useQuery({
    queryKey: FIELD_KEYS.list(options),
    queryFn: () => fieldService.getAll(options),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Get field by ID
export const useField = (id: number) => {
  return useQuery({
    queryKey: FIELD_KEYS.detail(id),
    queryFn: () => fieldService.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Get fields with details
export const useFieldsWithDetails = () => {
  return useQuery({
    queryKey: FIELD_KEYS.withDetails,
    queryFn: () => ApiService.getFieldsWithDetails(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Get fields by type
export const useFieldsByType = (fieldTypeDimensionalId: number) => {
  return useQuery({
    queryKey: FIELD_KEYS.byType(fieldTypeDimensionalId),
    queryFn: () => fieldService.getAll({
      filters: { field_type_dimensional_id: fieldTypeDimensionalId }
    }),
    enabled: !!fieldTypeDimensionalId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Get fields by group (through dimensional_group_field)
export const useFieldsByGroup = (groupId: number) => {
  return useQuery({
    queryKey: FIELD_KEYS.byGroup(groupId),
    queryFn: async () => {
      const groupWithDetails = await ApiService.getDimensionalGroupById(groupId);
      return groupWithDetails?.fields || [];
    },
    enabled: !!groupId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Get paginated fields
export const useFieldsPaginated = (
  page: number = 1,
  pageSize: number = 10,
  options?: {
    orderBy?: string;
    ascending?: boolean;
    filters?: Record<string, any>;
  }
) => {
  return useQuery({
    queryKey: FIELD_KEYS.paginated(page, pageSize, options),
    queryFn: () => ApiService.getPaginatedData(fieldService, page, pageSize, options),
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });
};

// Count fields
export const useFieldsCount = (filters?: Record<string, any>) => {
  return useQuery({
    queryKey: [...FIELD_KEYS.all, 'count', { filters }],
    queryFn: () => fieldService.count(filters),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Create field mutation
export const useCreateField = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Field, 'field_id'>) => 
      fieldService.create(data),
    onSuccess: (newField, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: FIELD_KEYS.all });
      
      // Update type-specific cache
      if (variables.field_type_dimensional_id) {
        queryClient.invalidateQueries({ 
          queryKey: FIELD_KEYS.byType(variables.field_type_dimensional_id) 
        });
      }
      
      // Add to cache
      queryClient.setQueryData(
        FIELD_KEYS.detail(newField.field_id),
        newField
      );
    },
    onError: (error) => {
      console.error('Error creating field:', error);
    },
  });
};

// Update field mutation
export const useUpdateField = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Field> }) =>
      fieldService.update(id, data),
    onSuccess: (updatedField, { id, data }) => {
      // Update cache
      queryClient.setQueryData(
        FIELD_KEYS.detail(id),
        updatedField
      );
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: FIELD_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: FIELD_KEYS.withDetails });
      
      // Update type-specific cache if changed
      if (data.field_type_dimensional_id) {
        queryClient.invalidateQueries({ 
          queryKey: FIELD_KEYS.byType(data.field_type_dimensional_id) 
        });
      }
    },
    onError: (error) => {
      console.error('Error updating field:', error);
    },
  });
};

// Delete field mutation
export const useDeleteField = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => fieldService.delete(id),
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: FIELD_KEYS.detail(id) });
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: FIELD_KEYS.all });
    },
    onError: (error) => {
      console.error('Error deleting field:', error);
    },
  });
};

// Bulk operations
export const useBulkDeleteFields = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: number[]) => {
      const promises = ids.map(id => fieldService.delete(id));
      return Promise.all(promises);
    },
    onSuccess: (_, ids) => {
      ids.forEach(id => {
        queryClient.removeQueries({ queryKey: FIELD_KEYS.detail(id) });
      });
      queryClient.invalidateQueries({ queryKey: FIELD_KEYS.all });
    },
    onError: (error) => {
      console.error('Error bulk deleting fields:', error);
    },
  });
};

// Search fields
export const useSearchFields = (searchTerm: string) => {
  return useQuery({
    queryKey: [...FIELD_KEYS.all, 'search', searchTerm],
    queryFn: () => fieldService.getAll({
      filters: {
        field_name: searchTerm,
      }
    }),
    enabled: !!searchTerm && searchTerm.length > 2,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

// Field type statistics
export const useFieldTypeStats = () => {
  return useQuery({
    queryKey: [...FIELD_KEYS.all, 'type-stats'],
    queryFn: async () => {
      const fields = await fieldService.getAll();
      const stats = fields.reduce((acc: Record<number, number>, field) => {
        const typeId = field.field_type_dimensional_id || 0;
        acc[typeId] = (acc[typeId] || 0) + 1;
        return acc;
      }, {});
      return stats;
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};

// Validate field code uniqueness
export const useValidateFieldCode = (code: string, excludeId?: number) => {
  return useQuery({
    queryKey: [...FIELD_KEYS.all, 'validate-code', code, excludeId],
    queryFn: async () => {
      const fields = await fieldService.getAll({
        filters: { field_code: code }
      });
      
      if (excludeId) {
        return fields.filter(f => f.field_id !== excludeId).length === 0;
      }
      
      return fields.length === 0;
    },
    enabled: !!code && code.length > 0,
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

// Clone field
export const useCloneField = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fieldId: number) => {
      const originalField = await fieldService.getById(fieldId);
      if (!originalField) throw new Error('Field not found');
      
      const { field_id, created_at, updated_by, ...cloneData } = originalField;
      
      return fieldService.create({
        ...cloneData,
        field_code: `${cloneData.field_code}_copy`,
        field_name: `${cloneData.field_name} (Copy)`,
      });
    },
    onSuccess: (clonedField) => {
      queryClient.invalidateQueries({ queryKey: FIELD_KEYS.all });
      queryClient.setQueryData(
        FIELD_KEYS.detail(clonedField.field_id),
        clonedField
      );
    },
    onError: (error) => {
      console.error('Error cloning field:', error);
    },
  });
};

// Get available field types (dimensionals that can be used as field types)
export const useFieldTypes = () => {
  return useQuery({
    queryKey: ['field-types'],
    queryFn: async () => {
      // Assuming field types are dimensionals from a specific group
      // You might need to adjust this based on your actual schema
      const dimensionals = await ApiService.getDimensionalsWithDetails();
      return dimensionals.filter(d => d.group?.dimensional_group_name === 'FieldTypes');
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};

export default {
  useFields,
  useField,
  useFieldsWithDetails,
  useFieldsByType,
  useFieldsByGroup,
  useFieldsPaginated,
  useFieldsCount,
  useCreateField,
  useUpdateField,
  useDeleteField,
  useBulkDeleteFields,
  useSearchFields,
  useFieldTypeStats,
  useValidateFieldCode,
  useCloneField,
  useFieldTypes,
};