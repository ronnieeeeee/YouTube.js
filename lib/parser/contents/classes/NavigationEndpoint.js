'use strict';

const Parser = require('..');

class NavigationEndpoint {
  type = 'navigationEndpoint';

  constructor(data) {
    data?.serviceEndpoint &&
      (data = data.serviceEndpoint);

    this.metadata = {
      url: data?.commandMetadata?.webCommandMetadata.url || null,
      page_type: data?.commandMetadata?.webCommandMetadata.webPageType || 'N/A',
      api_url: data?.commandMetadata?.webCommandMetadata.apiUrl || null,
      send_post: data?.commandMetadata?.webCommandMetadata.sendPost || null
    }
    
    if (data?.browseEndpoint) {
      this.browse = {
        id: data?.browseEndpoint?.browseId || null,
        params: data?.browseEndpoint.params || null,
        base_url: data?.browseEndpoint?.canonicalBaseUrl || null
      };
    }
    
    if (data?.watchEndpoint) {
      this.watch = {
        video_id: data?.watchEndpoint?.videoId,
        playlist_id: data?.watchEndpoint.playlistId || null,
        params: data?.watchEndpoint.params || null,
        index: data?.watchEndpoint.index || null, 
        supported_onesie_config: data?.watchEndpoint?.watchEndpointSupportedOnesieConfig
      };
    }
    
    if (data?.subscribeEndpoint) {
      this.subscribe = {
        channel_ids: data.subscribeEndpoint.channelIds,
        params: data.subscribeEndpoint.params
      }
    }
    
    if (data?.unsubscribeEndpoint) {
      this.unsubscribe = {
        channel_ids: data.unsubscribeEndpoint.channelIds,
        params: data.unsubscribeEndpoint.params
      }
    }
    
    if (data?.likeEndpoint) {
      this.like = {
        status: data.likeEndpoint.status,
        target: { video_id: data.likeEndpoint.target.videoId },
        remove_like_params: data.likeEndpoint?.removeLikeParams
      }
    }
    
    if (data?.offlineVideoEndpoint) {
      this.offline_video = {
        video_id: data.offlineVideoEndpoint.videoId,
        on_add_command: {
          get_download_action: {
            video_id: data.offlineVideoEndpoint.videoId,
            params: data.offlineVideoEndpoint.onAddCommand.getDownloadActionCommand.params,
          }
        }
      }
    }
    
    if (data?.continuationCommand) {
      this.continuation = {
        request: data?.continuationCommand?.request || null,
        token: data?.continuationCommand?.token || null
      };
    }
    
    if (data?.feedbackEndpoint) {
      this.feedback = {
        token: data.feedbackEndpoint.feedbackToken
      }
    }
    
    if (data?.watchPlaylistEndpoint) {
      this.watch_playlist = {
        playlist_id: data.watchPlaylistEndpoint?.playlistId
      }
    }
    
    if (data?.playlistEditEndpoint) {
      this.playlist_edit = {
        playlist_id: data.playlistEditEndpoint.playlistId,
        actions: data.playlistEditEndpoint.actions.map((item) => ({
          action: item.action,
          removed_video_id: item.removedVideoId 
        }))
      }
    }
    
    if (data?.addToPlaylistServiceEndpoint) {
      this.add_to_playlist = {
        video_id: data.addToPlaylistServiceEndpoint.videoId
      }
    }
    
    if (data?.getReportFormEndpoint) {
      this.get_report_form = {
        params: data.getReportFormEndpoint.params
      }
    }
  }
  
  async call(actions) {
    if (this.continuation) {
      switch (this.continuation.request) {
        case 'CONTINUATION_REQUEST_TYPE_BROWSE': {
          const response = await actions.browse(this.continuation.token, { is_ctoken: true });
          return Parser.parseResponse(response.data);
        }
        case 'CONTINUATION_REQUEST_TYPE_SEARCH': {
          const response = await actions.search({ ctoken: this.continuation.token });
          return Parser.parseResponse(response.data);
        }
        default:
          throw new Error(this.continuation.request + ' not implemented');
      }
    }
    
    if (this.browse) {
      const args = {};
      
      this.browse.params && 
        (args.params = this.browse.params);
      
      const response = await actions.browse(this.browse.id, args);
      return Parser.parseResponse(response.data);
    }
  }
}

module.exports = NavigationEndpoint;