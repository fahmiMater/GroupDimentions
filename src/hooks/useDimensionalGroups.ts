import { useQuery, useMutation, useQueryClient } from 'react-query';
import { dimensionalGroupService, ApiService } from '@/services/api';
import { DimensionalGroup, DimensionalGroupWithDetails } from '@/types';
import toast from 'react-hot-toast';

// Query keys
export const DIMENSIONAL_GROUP_KEYS = {
  all: ['dimensional-groups'] as const,
  withDetails: ['dimensional-groups', 'with-details'] as const,
  byCodeDefinition: (codeDefinitionId: number) => ['dimensional-groups', 'code-definition', codeDefinitionId] as const,
  detail: (id: number) => ['dimensional-groups', id] as const,
  detailWithDetails: (id: number) => ['dimensional-groups', id, 'with-details'] as const,
};

// Get all dimensional groups
export const useDimensionalGroups = (filters?: {
  code_definition_id?: number;
  is_active?: boolean;
}) => {
  return useQuery(
    filters?.code_definition_id 
      ? DIMENSIONAL_GROUP_KEYS.byCodeDefinition(filters.code_definition_id)
      : DIMENSIONAL_GROUP_KEYS.all,
    () => dimensionalGroupService.getAll({
      orderBy: 'dimensional_group_sort',
      ascending: true,
      filters
    }),
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  );
};

// Get dimensional groups with details
export const useDimensionalGroupsWithDetails = (filters?: {
  code_definition_id?: number;
  is_active?: boolean;
}) => {
  return useQuery(
    DIMENSIONAL_GROUP_KEYS.withDetails,
    () => ApiService.getDimensionalGroupsWithDetails(filters),
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  );
};

// Get dimensional group by ID
export const useDimensionalGroup = (id: number | undefined) => {
  return useQuery(
    DIMENSIONAL_GROUP_KEYS.detail(id!),
    () => dimensionalGroupService.getById(id!),
    {
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  );
};

// Get dimensional group by ID with details
export const useDimensionalGroupWithDetails = (id: number | undefined) => {
  return useQuery(
    DIMENSIONAL_GROUP_KEYS.detailWithDetails(id!),
    () => ApiService.getDimensionalGroupById(id!),
    {
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  );
};

// Create dimensional group mutation
export const useCreateDimensionalGroup = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (data: Omit<DimensionalGroup, 'dimensional_group_id'>) => 
      dimensionalGroupService.create({
        ...data,
        created_by: 1 // This should come from auth context
      }),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(DIMENSIONAL_GROUP_KEYS.all);
        queryClient.invalidateQueries(DIMENSIONAL_GROUP_KEYS.withDetails);
        if (data.code_definition_id) {
          queryClient.invalidateQueries(DIMENSIONAL_GROUP_KEYS.byCodeDefinition(data.code_definition_id));
        }
        toast.success('تم إضافة مجموعة الأبعاد بنجاح');
        return data;
      },
      onError: (error: any) => {
        toast.error(`خطأ في إضافة مجموعة الأبعاد: ${error.message}`);
        throw error;
      },
    }
  );
};

// Update dimensional group mutation
export const useUpdateDimensionalGroup = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ id, data }: { id: number; data: Partial<DimensionalGroup> }) =>
      dimensionalGroupService.update(id, data),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(DIMENSIONAL_GROUP_KEYS.all);
        queryClient.invalidateQueries(DIMENSIONAL_GROUP_KEYS.withDetails);
        queryClient.invalidateQueries(DIMENSIONAL_GROUP_KEYS.detail(variables.id));
        queryClient.invalidateQueries(DIMENSIONAL_GROUP_KEYS.detailWithDetails(variables.id));
        if (data.code_definition_id) {
          queryClient.invalidateQueries(DIMENSIONAL_GROUP_KEYS.byCodeDefinition(data.code_definition_id));
        }
        toast.success('تم تحديث مجموعة الأبعاد بنجاح');
        return data;
      },
      onError: (error: any) => {
        toast.error(`خطأ في تحديث مجموعة الأبعاد: ${error.message}`);
        throw error;
      },
    }
  );
};

// Delete dimensional group mutation
export const useDeleteDimensionalGroup = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (id: number) => dimensionalGroupService.delete(id),
    {
      onSuccess: (_, id) => {
        queryClient.invalidateQueries(DIMENSIONAL_GROUP_KEYS.all);
        queryClient.invalidateQueries(DIMENSIONAL_GROUP_KEYS.withDetails);
        queryClient.removeQueries(DIMENSIONAL_GROUP_KEYS.detail(id));
        queryClient.removeQueries(DIMENSIONAL_GROUP_KEYS.detailWithDetails(id));
        toast.success('تم حذف مجموعة الأبعاد بنجاح');
      },
      onError: (error: any) => {
        toast.error(`خطأ في حذف مجموعة الأبعاد: ${error.message}`);
        throw error;
      },
    }
  );
};