import BaseAPI from './BaseAPI'

export default class PubAPI extends BaseAPI {
  async fetch(params) {
    // console.log('pubAPI fetch')
    // if (params && 'id' in params) return this.$get('/pubs/' + params.id)
    return this.$get('/pubs', params)
  }

  async addPub(pubname, pubdescr) {
    const data = {
      pubname,
      pubdescr
    }
    const { ok } = await this.$post('/pubs', data)
    return ok
  }

  async deletePub(pubid) {
    console.log('deletePub', pubid)
    const { ok } = await this.$del('/pubs/' + pubid)
    return ok
  }

  async toggleEnablePub(pubid, enabled) {
    const data = {
      enabled
    }
    const { ok } = await this.$post('/pubs/' + pubid, data)
    return ok
  }

  async addPubRoleOwner(pubid) {
    const data = {
      addPubRoleOwner: true
    }
    const { ok } = await this.$post('/pubs/' + pubid, data)
    return ok
  }

  async addPubRole(pubid, userid, roleid) {
    const data = {
      addroleid: roleid,
      addroleuserid: userid
    }
    const { ok } = await this.$post('/pubs/' + pubid, data)
    return ok
  }

  async editPubDetails(pubid, editname, editdescription) {
    const data = {
      editname,
      editdescription
    }
    const { ok } = await this.$post('/pubs/' + pubid, data)
    return ok
  }

  async duplicatePub(pubid, pubname, pubdupusers) {
    const data = {
      pubname,
      pubdupusers
    }
    const { ok } = await this.$post('/pubs/' + pubid, data)
    return ok
  }

  /// //////////
  // POST bulk op: for all submits at FROM status, add new TO status
  async bulkSubmitStatusUpdate(pubid, fromstatus, tostatus) {
    console.log('pubAPI bulkSubmitStatusUpdateaddSubmitStatus', pubid, fromstatus, tostatus)
    const data = { fromstatus, tostatus }
    const { status } = await this.$postOverride('POST', '/pubs/bulk/' + pubid, data)
    return status
  }

}
