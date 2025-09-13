import { useQuery, useMutation, useQueryClient } from 'react-query';
import { codeDefinitionService, ApiService } from '@/services/api';
import { CodeDefinition, CodeDefinitionWithGroups } from '@/types';
import toast from 'react-hot-toast';

// Query keys
export const CODE_DEFINITION_KEYS = {
  all: ['code-definitions'] as const,
  withGroups: ['code-definitions', 'with-groups'] as const,
  detail: (id: number) => ['code-definitions', id] as const,
};

// Get all code definitions
export const useCodeDefinitions = () => {
  return useQuery(
    CODE_DEFINITION_KEYS.all,
    () => codeDefinitionService.getAll({
      orderBy: 'code_definition_code',
      ascending: true
    }),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    }
  );
};

// Get code definitions with groups
export const useCodeDefinitionsWithGroups = () => {
  return useQuery(
    CODE_DEFINITION_KEYS.withGroups,
    () => ApiService.getCodeDefinitionsWithGroups(),
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  );
};

// Get code definition by ID
export const useCodeDefinition = (id: number | undefined) => {
  return useQuery(
    CODE_DEFINITION_KEYS.detail(id!),
    () => codeDefinitionService.getById(id!),
    {
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  );
};

// Create code definition mutation
export const useCreateCodeDefinition = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (data: Omit<CodeDefinition, 'code_definition_id'>) => 
      codeDefinitionService.create({
        ...data,
        created_by: 1 // This should come from auth context
      }),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(CODE_DEFINITION_KEYS.all);
        queryClient.invalidateQueries(CODE_DEFINITION_KEYS.withGroups);
        toast.success('تم إضافة تعريف الكود بنجاح');
        return data;
      },
      onError: (error: any) => {
        toast.error(`خطأ في إضافة تعريف الكود: ${error.message}`);
        throw error;
      },
    }
  );
};

// Update code definition mutation
export const useUpdateCodeDefinition = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ id, data }: { id: number; data: Partial<CodeDefinition> }) =>
      codeDefinitionService.update(id, data),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(CODE_DEFINITION_KEYS.all);
        queryClient.invalidateQueries(CODE_DEFINITION_KEYS.withGroups);
        queryClient.invalidateQueries(CODE_DEFINITION_KEYS.detail(variables.id));
        toast.success('تم تحديث تعريف الكود بنجاح');
        return data;
      },
      onError: (error: any) => {
        toast.error(`خطأ في تحديث تعريف الكود: ${error.message}`);
        throw error;
      },
    }
  );
};

// Delete code definition mutation
export const useDeleteCodeDefinition = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (id: number) => codeDefinitionService.delete(id),
    {
      onSuccess: (_, id) => {
        queryClient.invalidateQueries(CODE_DEFINITION_KEYS.all);
        queryClient.invalidateQueries(CODE_DEFINITION_KEYS.withGroups);
        queryClient.removeQueries(CODE_DEFINITION_KEYS.detail(id));
        toast.success('تم حذف تعريف الكود بنجاح');
      },
      onError: (error: any) => {
        toast.error(`خطأ في حذف تعريف الكود: ${error.message}`);
        throw error;
      },
    }
  );
};