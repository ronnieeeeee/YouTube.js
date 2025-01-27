'use strict';

const Text = require('./Text');
const Parser = require('..');
const Thumbnail = require('./Thumbnail');
const NavigationEndpoint = require('./NavigationEndpoint');
const PlaylistAuthor = require('./PlaylistAuthor');

class Playlist {
  type = 'playlistRenderer';
  
  constructor(data) {
    this.id = data.playlistId;
    this.title = new Text(data.title);

    this.author = data.shortBylineText.simpleText &&
      new Text(data.shortBylineText) || 
      new PlaylistAuthor({ nav_text: data.shortBylineText, badges: data.ownerBadges });
  
    this.thumbnails = new Thumbnail(data.thumbnail || { thumbnails: data.thumbnails.map((th) => th.thumbnails).flat(1) }).thumbnails;
    this.video_count = new Text(data.thumbnailText);
    this.video_count_short = new Text(data.videoCountShortText);
    this.first_videos = Parser.parse(data.videos) || [];
    this.share_url = data.shareUrl || null;
    
    this.menu = Parser.parse(data.menu);
    this.badges = Parser.parse(data.ownerBadges);
    this.endpoint = new NavigationEndpoint(data.navigationEndpoint);
    this.thumbnail_overlays = Parser.parse(data.thumbnailOverlays) || [];
  }
}

module.exports = Playlist;