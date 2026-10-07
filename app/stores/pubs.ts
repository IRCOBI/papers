import _ from 'lodash/core'
import { defineStore } from 'pinia'
import api from '~/api'

export const usePubsStore = defineStore('pubs', {
  persist: {
    storage: window.localStorage,
    //pick: [],
  },
  state: () => ({
    pubs: {},
    mailproblem: null as null | { problem: string, since: string },
    error: false
  }),
  actions: {
    async fetch() {
      try {
        this.error = false
        const { pubs, mailproblem } = await api.pubs.fetch({})
        this.mailproblem = mailproblem || null
        for (const pub of pubs) { // Add working variables here (so they are reactive)
          pub.owner = Boolean(_.find(pub.myroles, (mr: any) => { return mr.isowner }))
          pub.notowner = pub.owner ? false : (pub.myroles.length > 0)
          pub.superedit = false
          pub.adduserid = 0
          pub.addroleid = 0
          pub.hasanyrole = false
          if ('superpubroles' in pub) {
            pub.hasanyrole = pub.superpubroles.length > 0
          }
        }
        this.pubs = pubs
      } catch (e: any) {
        console.log('store fetchpub error', e.message)
        this.error = e.message
      }
    },
    clearError() {
      this.error = false
    },
    clearAll() {
      this.error = false
      this.pubs = {}
      this.mailproblem = null
    }
  },
  getters: {
    getPub: (state: { pubs: any }) => (pubid: any) => {
      return _.find(state.pubs, (pub: { id: any }) => { return pub.id === pubid })
    }
  },
})