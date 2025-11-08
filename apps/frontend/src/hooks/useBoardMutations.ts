import { useMutation, useQueryClient } from '@tanstack/react-query'
import { boardsAPI, itemsAPI, columnsAPI, tagsAPI } from '../services/api'

export function useBoardMutations(boardId: number) {
  const queryClient = useQueryClient()

  const createItemMutation = useMutation({
    mutationFn: ({ columnId, title }: { columnId: number; title: string }) =>
      itemsAPI.create(columnId, { title }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] })
    },
  })

  const moveItemMutation = useMutation({
    mutationFn: ({ itemId, columnId, position }: { itemId: number; columnId: number; position: number }) =>
      itemsAPI.move(itemId, { column_id: columnId, position }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] })
    },
    onError: (error) => {
      console.error('Failed to move item:', error)
      queryClient.invalidateQueries({ queryKey: ['board', boardId] })
    },
  })

  const updateItemMutation = useMutation({
    mutationFn: ({ id, title, description, start_date, end_date, effort, label, priority, tag_ids }: { id: number; title: string; description: string; start_date?: string; end_date?: string; effort?: number; label?: string | null; priority?: 'high' | 'medium' | 'low' | null; tag_ids?: number[] }) =>
      itemsAPI.update(id, { title, description, start_date, end_date, effort, label, priority, tag_ids }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] })
    },
  })

  const deleteItemMutation = useMutation({
    mutationFn: (id: number) => itemsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] })
    },
    onError: (error) => {
      console.error('Failed to delete item:', error)
    },
  })

  const archiveItemMutation = useMutation({
    mutationFn: ({ id, archived }: { id: number; archived: boolean }) => itemsAPI.archive(id, archived),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] })
    },
    onError: (error) => {
      console.error('Failed to archive item:', error)
    },
  })

  const updateColumnMutation = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      columnsAPI.update(id, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] })
    },
    onError: (error) => {
      console.error('Failed to update column:', error)
    },
  })

  const deleteColumnMutation = useMutation({
    mutationFn: (id: number) => columnsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] })
    },
    onError: (error) => {
      console.error('Failed to delete column:', error)
    },
  })

  const moveColumnMutation = useMutation({
    mutationFn: ({ id, position }: { id: number; position: number }) =>
      columnsAPI.move(id, position),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] })
    },
    onError: (error) => {
      console.error('Failed to move column:', error)
      queryClient.invalidateQueries({ queryKey: ['board', boardId] })
    },
  })

  const createColumnMutation = useMutation({
    mutationFn: ({ boardId, name, position }: { boardId: number; name: string; position: number }) =>
      columnsAPI.create(boardId, { name, position }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] })
    },
    onError: (error) => {
      console.error('Failed to create column:', error)
    },
  })

  const updateBoardMutation = useMutation({
    mutationFn: ({ id, name, background, column_theme, archived }: { id: number; name?: string; background?: string; column_theme?: string; archived?: boolean }) =>
      boardsAPI.update(id, { name, background, column_theme, archived }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] })
      queryClient.invalidateQueries({ queryKey: ['boards'] })
    },
    onError: (error) => {
      console.error('Failed to update board:', error)
    },
  })

  const deleteBoardMutation = useMutation({
    mutationFn: (id: number) => boardsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] })
    },
    onError: (error) => {
      console.error('Failed to delete board:', error)
    },
  })

  const createTagMutation = useMutation({
    mutationFn: (data: { name: string; color?: string }) => tagsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] })
    },
    onError: (error) => {
      console.error('Failed to create tag:', error)
    },
  })

  const updateTagMutation = useMutation({
    mutationFn: ({ id, name, color }: { id: number; name?: string; color?: string }) =>
      tagsAPI.update(id, { name, color }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] })
    },
    onError: (error) => {
      console.error('Failed to update tag:', error)
    },
  })

  const deleteTagMutation = useMutation({
    mutationFn: (id: number) => tagsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] })
    },
    onError: (error) => {
      console.error('Failed to delete tag:', error)
    },
  })

  return {
    createItemMutation,
    moveItemMutation,
    updateItemMutation,
    deleteItemMutation,
    archiveItemMutation,
    createColumnMutation,
    updateColumnMutation,
    deleteColumnMutation,
    moveColumnMutation,
    updateBoardMutation,
    deleteBoardMutation,
    createTagMutation,
    updateTagMutation,
    deleteTagMutation
  }
}