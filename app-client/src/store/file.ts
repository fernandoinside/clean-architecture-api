'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '@/lib/api'
import { File, CreateFileData, UpdateFileData, FileFilters, FileStore } from '@/types'

export const useFileStore = create<FileStore>()(
  persist(
    (set, get) => ({
      files: [],
      selectedFile: null,
      loading: false,
      filters: {
        page: 1,
        limit: 10
      },
      pagination: null,

      fetchFiles: async (filters?: FileFilters) => {
        set({ loading: true })
        try {
          const params = filters || get().filters
          const response = await api.get('/files', { params })
          const { data, pagination } = response.data
          set({ 
            files: data, 
            pagination, 
            filters: { ...get().filters, ...params },
            loading: false 
          })
        } catch (error) {
          console.error('Erro ao buscar arquivos:', error)
          set({ loading: false })
        }
      },

      uploadFile: async (formData: FormData) => {
        set({ loading: true })
        try {
          const response = await api.post('/files', formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          })
          const newFile = response.data.data
          set(state => ({ 
            files: [newFile, ...state.files], 
            loading: false 
          }))
          return newFile
        } catch (error) {
          set({ loading: false })
          throw error
        }
      },

      updateFile: async (id: number, data: UpdateFileData) => {
        set({ loading: true })
        try {
          const response = await api.put(`/files/${id}`, data)
          const updatedFile = response.data.data
          set(state => ({
            files: state.files.map(item => 
              item.id === id ? updatedFile : item
            ),
            selectedFile: state.selectedFile?.id === id 
              ? updatedFile 
              : state.selectedFile,
            loading: false
          }))
          return updatedFile
        } catch (error) {
          set({ loading: false })
          throw error
        }
      },

      deleteFile: async (id: number) => {
        set({ loading: true })
        try {
          await api.delete(`/files/${id}`)
          set(state => ({
            files: state.files.filter(item => item.id !== id),
            selectedFile: state.selectedFile?.id === id 
              ? null 
              : state.selectedFile,
            loading: false
          }))
        } catch (error) {
          set({ loading: false })
          throw error
        }
      },

      setSelectedFile: (file: File | null) => {
        set({ selectedFile: file })
      },

      setFilters: (filters: Partial<FileFilters>) => {
        set(state => ({ 
          filters: { ...state.filters, ...filters } 
        }))
      }
    }),
    {
      name: 'file-store'
    }
  )
)