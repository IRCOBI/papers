import _ from 'lodash/core'
import { defineStore } from 'pinia'
import api from '~/api'

export const useSitePagesStore = defineStore('sitepages', {
  persist: {
    storage: window.localStorage,
    pick: ['list'],
  },
  state: () => ({
    list: [] as any[],
    error: false as string | false
  }),
  actions: {
    async fetch() {
      try {
        const response = await api.sitepages.fetch({})
        console.log('SitePagesStore fetch response:', response)

        if (!response) {
          console.error('No response from sitepages API')
          this.error = 'Failed to load site pages: No response from server'
          return
        }

        if (response.ret !== 0) {
          console.error('SitePagesStore fetch error:', response)
          this.error = response.status || 'Failed to load site pages'
          return
        }

        const { sitepages } = response
        if (sitepages) {
          for (const sitepage of sitepages) {
            sitepage.visible = false
            sitepage.paras = sitepage.content.split('\n')
          }
          this.list = sitepages
          this.error = false
        } else {
          console.warn('No sitepages in response')
          this.list = []
          this.error = false
        }
      } catch (err: any) {
        console.error('SitePagesStore fetch exception:', err)
        this.error = err.message || 'Failed to load site pages'
      }
    },
  },
  getters: {
    get: (_state: { list: any }) => {
      return (path: any) => {
        return _.find(_state.list, (_sitepage: { path: any }) => { return _sitepage.path === path })
      }
    },
  },
})