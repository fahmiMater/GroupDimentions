import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiService, codeDefinitionService } from '@/services/api';
import { CodeDefinition, CodeDefinitionWithGroups } from '@/types';

// Query keys for better cache management
const CODE_DEFINITION_KEYS = {
  all: ['code-definitions'] as const,
  lists: () => [...CODE_DEFINITION_KEYS.all, 'list'] as const,
  list: (filters: any) => [...CODE_DEFINITION_KEYS.lists(), { filters }] as const,
  details: () => [...CODE_DEFINITION_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...CODE_DEFINITION_KEYS.details(), id] as const,
  withGroups: ['code-definitions', 'with-groups'] as const,
  paginated: (page: number, pageSize: number, options?: any) => 
    [...CODE_DEFINITION_KEYS.all, 'paginated', { page, pageSize, options }] as const,
};

// Get all code definitions
export const useCodeDefinitions = (options?: {
  orderBy?: string;
  ascending?: boolean;
  filters?: Record<string, any>;
}) => {
  return useQuery({
    queryKey: CODE_DEFINITION_KEYS.list(options),
    queryFn: () => codeDefinitionService.getAll(options),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Get code definition by ID
export const useCodeDefinition = (id: number) => {
  return useQuery({
    queryKey: CODE_DEFINITION_KEYS.detail(id),
    queryFn: () => codeDefinitionService.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Get code definitions with groups
export const useCodeDefinitionsWithGroups = () => {
  return useQuery({
    queryKey: CODE_DEFINITION_KEYS.withGroups,
    queryFn: () => ApiService.getCodeDefinitionsWithGroups(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Get paginated code definitions
export const useCodeDefinitionsPaginated = (
  page: number = 1,
  pageSize: number = 10,
  options?: {
    orderBy?: string;
    ascending?: boolean;
    filters?: Record<string, any>;
  }
) => {
  return useQuery({
    queryKey: CODE_DEFINITION_KEYS.paginated(page, pageSize, options),
    queryFn: () => ApiService.getPaginatedData(codeDefinitionService, page, pageSize, options),
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });
};

// Count code definitions
export const useCodeDefinitionsCount = (filters?: Record<string, any>) => {
  return useQuery({
    queryKey: [...CODE_DEFINITION_KEYS.all, 'count', { filters }],
    queryFn: () => codeDefinitionService.count(filters),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Create code definition mutation
export const useCreateCodeDefinition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<CodeDefinition, 'code_definition_id'>) => 
      codeDefinitionService.create(data),
    onSuccess: (newCodeDefinition) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: CODE_DEFINITION_KEYS.all });
      
      // Optionally add the new item to the cache
      queryClient.setQueryData(
        CODE_DEFINITION_KEYS.detail(newCodeDefinition.code_definition_id),
        newCodeDefinition
      );
    },
    onError: (error) => {
      console.error('Error creating code definition:', error);
    },
  });
};

// Update code definition mutation
export const useUpdateCodeDefinition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CodeDefinition> }) =>
      codeDefinitionService.update(id, data),
    onSuccess: (updatedCodeDefinition, { id }) => {
      // Update specific item in cache
      queryClient.setQueryData(
        CODE_DEFINITION_KEYS.detail(id),
        updatedCodeDefinition
      );
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: CODE_DEFINITION_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: CODE_DEFINITION_KEYS.withGroups });
    },
    onError: (error) => {
      console.error('Error updating code definition:', error);
    },
  });
};

// Delete code definition mutation
export const useDeleteCodeDefinition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => codeDefinitionService.delete(id),
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: CODE_DEFINITION_KEYS.detail(id) });
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: CODE_DEFINITION_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: CODE_DEFINITION_KEYS.withGroups });
    },
    onError: (error) => {
      console.error('Error deleting code definition:', error);
    },
  });
};

// Bulk operations
export const useBulkDeleteCodeDefinitions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: number[]) => {
      const promises = ids.map(id => codeDefinitionService.delete(id));
      return Promise.all(promises);
    },
    onSuccess: (_, ids) => {
      // Remove all deleted items from cache
      ids.forEach(id => {
        queryClient.removeQueries({ queryKey: CODE_DEFINITION_KEYS.detail(id) });
      });
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: CODE_DEFINITION_KEYS.all });
    },
    onError: (error) => {
      console.error('Error bulk deleting code definitions:', error);
    },
  });
};

// Search code definitions
export const useSearchCodeDefinitions = (searchTerm: string) => {
  return useQuery({
    queryKey: [...CODE_DEFINITION_KEYS.all, 'search', searchTerm],
    queryFn: () => codeDefinitionService.getAll({
      filters: {
        code_definition_code: searchTerm,
      }
    }),
    enabled: !!searchTerm && searchTerm.length > 2,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

export default {
  useCodeDefinitions,
  useCodeDefinition,
  useCodeDefinitionsWithGroups,
  useCodeDefinitionsPaginated,
  useCodeDefinitionsCount,
  useCreateCodeDefinition,
  useUpdateCodeDefinition,
  useDeleteCodeDefinition,
  useBulkDeleteCodeDefinitions,
  useSearchCodeDefinitions,
};
